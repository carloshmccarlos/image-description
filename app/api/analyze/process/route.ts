import { NextRequest, NextResponse } from 'next/server'
import { db, lessons } from '@/db'
import { eq } from 'drizzle-orm'
import OpenAI from 'openai'

// Max duration for Vercel - this runs as background
export const maxDuration = 300 // 5 minutes for Pro

// Lazy client
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
  const timeoutId = setTimeout(() => controller.abort(), 30000)

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
  return `You are a language learning assistant. Analyze the image for a ${difficulty} level student:
1. Description in ${target} (simple for Beginner, complex for Advanced)
2. Key vocabulary words in ${target} with ${native} translations
3. Include pronunciation for each word

Respond ONLY in JSON:
{
  "description": { "target": "...", "native": "..." },
  "vocabulary": [{ "word": "...", "pronunciation": "...", "category": "...", "translation": "..." }]
}`
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
 * POST /api/analyze/process - Background worker endpoint
 * Called by /api/analyze to do the actual AI work
 * Protected by API key
 */
export async function POST (request: NextRequest) {
  // Verify internal call
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lessonId, imageUrl, targetLanguage, nativeLanguage, difficulty } = await request.json()

    if (!lessonId || !imageUrl) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    // Fetch image
    const encodedImage = await fetchImageAsBase64(imageUrl)

    // Call AI
    const response = await getClient().chat.completions.create({
      model: 'zai-org/GLM-4.6V',
      messages: [
        { role: 'system', content: buildPrompt(targetLanguage, nativeLanguage, difficulty) },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Analyze this image for ${difficulty} level.` },
            { type: 'image_url', image_url: { url: encodedImage } }
          ]
        }
      ]
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('Empty AI response')

    const data = parseResponse(content)

    // Update lesson with results
    await db.update(lessons)
      .set({
        description: data.description,
        vocabulary: data.vocabulary
      })
      .where(eq(lessons.id, lessonId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[process] Error:', error)

    // Try to mark lesson as failed
    try {
      const { lessonId } = await request.json().catch(() => ({}))
      if (lessonId) {
        await db.update(lessons)
          .set({
            description: { target: '', native: '', _error: String(error) }
          })
          .where(eq(lessons.id, lessonId))
      }
    } catch {}

    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
