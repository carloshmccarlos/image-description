import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, lessons } from '@/db'
import { eq, and } from 'drizzle-orm'
import OpenAI from 'openai'

// Vercel timeout: Free=10s, Pro=60s, Enterprise=900s
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
  const timeoutId = setTimeout(() => controller.abort(), 15000)

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
 * Simple JSON API route for image analysis
 * Returns lessonId directly - no streaming
 */
export async function POST (request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { imageUrl, targetLanguage = 'en', nativeLanguage = 'zh', difficulty = 'Beginner' } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
    }

    // Check cache first - return existing lesson if found
    const existingLesson = await db.query.lessons.findFirst({
      where: and(eq(lessons.imageUrl, imageUrl), eq(lessons.userId, userId))
    })

    if (existingLesson) {
      return NextResponse.json({ lessonId: existingLesson.id, cached: true })
    }

    // Fetch and encode image
    const encodedImage = await fetchImageAsBase64(imageUrl)

    // Call AI
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

    return NextResponse.json({ lessonId: newLesson.id, cached: false })
  } catch (error) {
    console.error('[API/analyze] Error:', error)
    const message = error instanceof Error ? error.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
