import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, lessons } from '@/db'
import { eq, and } from 'drizzle-orm'
import OpenAI from 'openai'

// Enable streaming to bypass Vercel timeout
export const runtime = 'nodejs'
export const maxDuration = 60

let client: OpenAI | null = null
function getClient () {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.SILICONFLOW_API_KEY,
      baseURL: 'https://api.siliconflow.cn/v1'
    })
  }
  return client
}

async function fetchImageAsBase64 (imageUrl: string) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)
  try {
    const res = await fetch(imageUrl, { signal: controller.signal })
    if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await res.arrayBuffer())
    return `data:${contentType};base64,${buffer.toString('base64')}`
  } finally {
    clearTimeout(timeoutId)
  }
}

function buildPrompt (target: string, native: string, difficulty: string) {
  return `Analyze the image for a ${difficulty} level language learner.
Return JSON only:
{"description":{"target":"description in ${target}","native":"translation in ${native}"},"vocabulary":[{"word":"","pronunciation":"","category":"","translation":""}]}`
}

function parseResponse (content: string) {
  let cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
  cleaned = cleaned.replace(/<\|[^|]+\|>/g, '')
  const parsed = JSON.parse(cleaned)
  if (typeof parsed.description === 'string') {
    parsed.description = { target: parsed.description, native: parsed.description }
  }
  return parsed
}

/**
 * Streaming API route - sends chunks to keep connection alive
 * This bypasses Vercel's timeout by maintaining an active stream
 */
export async function POST (request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const body = await request.json()
  const { imageUrl, targetLanguage = 'en', nativeLanguage = 'zh', difficulty = 'Beginner' } = body

  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'Missing imageUrl' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check cache
  const existingLesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.imageUrl, imageUrl), eq(lessons.userId, userId))
  })

  if (existingLesson) {
    return new Response(JSON.stringify({ status: 'completed', lessonId: existingLesson.id }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Create streaming response
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Start async processing
  ;(async () => {
    try {
      // Send heartbeat to keep connection alive
      await writer.write(encoder.encode('data: {"status":"starting"}\n\n'))

      const encodedImage = await fetchImageAsBase64(imageUrl)
      await writer.write(encoder.encode('data: {"status":"analyzing"}\n\n'))

      // Use streaming from OpenAI to get faster first token
      const response = await getClient().chat.completions.create({
        model: 'zai-org/GLM-4.6V',
        stream: true,
        messages: [
          { role: 'system', content: buildPrompt(targetLanguage, nativeLanguage, difficulty) },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image.' },
              { type: 'image_url', image_url: { url: encodedImage } }
            ]
          }
        ]
      })

      let fullContent = ''
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || ''
        fullContent += content
        // Send heartbeat every chunk to keep alive
        await writer.write(encoder.encode('data: {"status":"processing"}\n\n'))
      }

      const data = parseResponse(fullContent)

      const [newLesson] = await db.insert(lessons).values({
        userId,
        imageUrl,
        description: data.description,
        vocabulary: data.vocabulary,
        difficulty,
        isSaved: false
      }).returning()

      await writer.write(encoder.encode(`data: {"status":"completed","lessonId":"${newLesson.id}"}\n\n`))
    } catch (error) {
      console.error('[analyze] Error:', error)
      const msg = error instanceof Error ? error.message : 'Analysis failed'
      await writer.write(encoder.encode(`data: {"status":"error","error":"${msg}"}\n\n`))
    } finally {
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
