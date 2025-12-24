'use server'

import OpenAI from 'openai'

const client = new OpenAI({
    apiKey: process.env.SILICONFLOW_API_KEY,
    baseURL: 'https://api.siliconflow.cn/v1'
})

type SiliconApiError = {
    status?: number
    response?: {
        data?: unknown
    }
}

async function inlineImageFromUrl(imageUrl: string) {
    const response = await fetch(imageUrl)
    if (!response.ok) {
        throw new Error(`Failed to fetch image for analysis (status ${response.status})`)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = buffer.toString('base64')
    return `data:${contentType};base64,${base64}`
}

export async function analyzeImage(imageUrl: string, targetLanguage: string = 'en', nativeLanguage: string = 'en', difficulty: string = 'Beginner') {
    if (!process.env.SILICONFLOW_API_KEY) {
        throw new Error('SILICONFLOW_API_KEY is not defined')
    }

    const encodedImage = await inlineImageFromUrl(imageUrl)

    let response

    try {
        response = await client.chat.completions.create({
            model: 'zai-org/GLM-4.6V', // As specified in implementation plan
            messages: [
                {
                    role: 'system',
                    content: `You are a language learning assistant. Analyze the image and provide a learning experience tailored for a ${difficulty} level student:
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
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Analyze this image for a ${difficulty} level student learning ${targetLanguage} whose native language is ${nativeLanguage}.` },
                        { type: 'image_url', image_url: { url: encodedImage } }
                    ]
                }
            ],
            // response_format: { type: 'json_object' } // GLM-4V often errors with this param
        })
    } catch (err: unknown) {
        const data = typeof err === 'object' && err ? (err as SiliconApiError).response?.data : undefined
        const status = typeof err === 'object' && err ? (err as SiliconApiError).status : undefined
        const message = err instanceof Error ? err.message : 'Unknown error'

        console.error('SiliconFlow request failed', {
            status,
            data,
            message
        })
        throw new Error('AI analysis request failed. Please try again.')
    }

    let content = response.choices[0].message.content
    if (!content) {
        throw new Error('Empty response from AI')
    }

    // Clean up markdown code blocks if the model includes them (e.g. ```json ... ```)
    content = content.replace(/```json\n?|\n?```/g, '') // Remove markdown code blocks
    content = content.replace(/<\|begin_of_box\|>|<\|end_of_box\|>/g, '') // Remove model specific tokens
    content = content.trim()

    try {
        return JSON.parse(content)
    } catch (error) {
        console.error('Failed to parse JSON response:', content, error)
        throw new Error('Invalid JSON response from AI')
    }
}
