import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, lessons } from '@/db'
import { eq, and } from 'drizzle-orm'
import OpenAI from 'openai'

// Vercel Pro/Enterprise: up to 60s, Free/Hobby: 10s max
export const maxDuration = 60

// Lazy-initialize OpenAI client
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

/**
 * Fetch image and convert to base64 with timeout
 */
async function fetchImageAsBase64 (imageUrl: string) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

  try {
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'image/*' }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image (status ${response.status})`)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = buffer.toString('base64')
    return `data:${contentType};base64,${base64}`
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Build AI prompt based on difficulty
 */
function buildPrompt (targetLanguage: string, nativeLanguage: string, difficulty: string) {
  return `You are a language learning assistant. Analyze the image and provide a learning experience tailored for a ${difficulty} level student:
1. A detailed description in the target language (${targetLanguage}). 
   - Beginner: Simple words, short sentences.
   - Medium: Natural flow, some intermediate vocabulary.
   - Advanced: Complex structures, idiomatic expressions, and nuances.
2. A comprehensive list of key vocabulary words found in the image in the target language (${targetLanguage}) appropriate for the ${difficulty} level. Include all relevant objects and concepts.
3. For each word, include: word (in ${targetLanguage}), category, and translation in the native language (${nativeLanguage}).
4. Also provide a translation of the full description into the native language (${nativeLanguage}).

Respond ONLY in JSON format:
{
  "description": {
    "target": "...",
    "native": "..."
  },
  "vocabulary": [
    {
      "word": "...",
      "pronunciation": "...",
      "category": "...",
      "translation": "..."
    }
  ]
}`
}

/**
 * Parse AI response JSON
 */
function parseAIResponse (content: string) {
  let cleaned = content.replace(/```json\n?|\n?```/g, '')
  cleaned = cleaned.replace(/<\|begin_of_box\|>|<\|end_of_box\|>/g, '')
  cleaned = cleaned.trim()

  const parsed = JSON.parse(cleaned)

  if (!parsed.description || !parsed.vocabulary) {
    throw new Error('Invalid response structure')
  }

  if (typeof parsed.description === 'string') {
    parsed.description = { target: parsed.description, native: parsed.description }
  }

  if (!Array.isArray(parsed.vocabulary)) {
    parsed.vocabulary = []
  }

  return parsed
}

/**
 * API route for image analysis using streaming to prevent timeout
 * Uses ReadableStream to keep connection alive during long AI processing
 */
export async function POST (request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { imageUrl, targetLanguage = 'en', nativeLanguage = 'zh', difficulty = 'Beginner' } = body

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
  }

  // Check cache first
  const existingLesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.imageUrl, imageUrl), eq(lessons.userId, userId))
  })

  if (existingLesson) {
    return NextResponse.json({ lessonId: existingLesson.id, cached: true })
  }

  // Use streaming response to prevent Vercel timeout
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start (controller) {
      try {
        // Send initial heartbeat
        controller.enqueue(encoder.encode('data: {"status":"starting"}\n\n'))

        // Fetch and encode image
        const encodedImage = await fetchImageAsBase64(imageUrl)
        controller.enqueue(encoder.encode('data: {"status":"analyzing"}\n\n'))

        // Call AI with streaming disabled for simpler parsing
        const response = await getClient().chat.completions.create({
          model: 'zai-org/GLM-4.6V',
          messages: [
            {
              role: 'system',
              content: buildPrompt(targetLanguage, nativeLanguage, difficulty)
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image for a ${difficulty} level student learning ${targetLanguage} whose native language is ${nativeLanguage}.`
                },
                {
                  type: 'image_url',
                  image_url: { url: encodedImage }
                }
              ]
            }
          ]
        })

        const content = response.choices[0].message.content
        if (!content) {
          throw new Error('Empty response from AI')
        }

        const data = parseAIResponse(content)

        // Save to database
        const [newLesson] = await db.insert(lessons).values({
          userId,
          imageUrl,
          description: data.description,
          vocabulary: data.vocabulary,
          difficulty,
          isSaved: false
        }).returning()

        // Send final result
        controller.enqueue(encoder.encode(`data: {"status":"complete","lessonId":"${newLesson.id}"}\n\n`))
        controller.close()
      } catch (error) {
        console.error('[API/analyze] Error:', error)
        const message = error instanceof Error ? error.message : 'Analysis failed'
        controller.enqueue(encoder.encode(`data: {"status":"error","error":"${message}"}\n\n`))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
