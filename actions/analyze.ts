'use server'

import OpenAI from 'openai'

// Lazy-initialize client to avoid issues during build
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

type SiliconApiError = {
  status?: number
  response?: {
    data?: unknown
  }
}

/**
 * Fetches image and converts to base64 data URL for AI analysis
 * Uses AbortController for timeout handling
 */
async function inlineImageFromUrl (imageUrl: string) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

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
 * Builds the AI prompt based on difficulty level
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
 * Parses and validates AI response JSON
 */
function parseAIResponse (content: string) {
  // Clean up markdown code blocks if the model includes them
  let cleaned = content.replace(/```json\n?|\n?```/g, '')
  cleaned = cleaned.replace(/<\|begin_of_box\|>|<\|end_of_box\|>/g, '')
  cleaned = cleaned.trim()

  try {
    const parsed = JSON.parse(cleaned)

    // Validate structure
    if (!parsed.description || !parsed.vocabulary) {
      throw new Error('Invalid response structure')
    }

    // Normalize description format
    if (typeof parsed.description === 'string') {
      parsed.description = { target: parsed.description, native: parsed.description }
    }

    // Ensure vocabulary is an array
    if (!Array.isArray(parsed.vocabulary)) {
      parsed.vocabulary = []
    }

    return parsed
  } catch (error) {
    console.error('Failed to parse AI response:', cleaned, error)
    throw new Error('Invalid JSON response from AI')
  }
}

/**
 * Original analyzeImage function - kept for backward compatibility
 * @deprecated Use analyzeImageOptimized for better performance
 */
export async function analyzeImage (
  imageUrl: string,
  targetLanguage: string = 'en',
  nativeLanguage: string = 'en',
  difficulty: string = 'Beginner'
) {
  return analyzeImageOptimized(imageUrl, targetLanguage, nativeLanguage, difficulty)
}

/**
 * Optimized image analysis with better error handling and timeouts
 * Designed to work reliably on Vercel serverless functions
 */
export async function analyzeImageOptimized (
  imageUrl: string,
  targetLanguage: string = 'en',
  nativeLanguage: string = 'en',
  difficulty: string = 'Beginner'
) {
  if (!process.env.SILICONFLOW_API_KEY) {
    throw new Error('SILICONFLOW_API_KEY is not defined')
  }

  // Fetch and encode image
  const encodedImage = await inlineImageFromUrl(imageUrl)

  let response

  try {
    response = await getClient().chat.completions.create({
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
  } catch (err: unknown) {
    const data = typeof err === 'object' && err ? (err as SiliconApiError).response?.data : undefined
    const status = typeof err === 'object' && err ? (err as SiliconApiError).status : undefined
    const message = err instanceof Error ? err.message : 'Unknown error'

    console.error('SiliconFlow request failed', { status, data, message })
    throw new Error('AI analysis request failed. Please try again.')
  }

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('Empty response from AI')
  }

  return parseAIResponse(content)
}
