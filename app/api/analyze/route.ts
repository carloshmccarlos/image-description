import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, lessons } from '@/db'
import { eq, and } from 'drizzle-orm'
import { analyzeImageOptimized } from '@/actions/analyze'

// Allow up to 60s for AI analysis on Vercel Pro/Enterprise
// Free tier has 10s limit - consider upgrading for production
export const maxDuration = 60

/**
 * API route for image analysis
 * Separates heavy AI work from page render to prevent HTTP2 protocol errors
 * The client calls this endpoint, waits for completion, then navigates to results
 */
export async function POST (request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { imageUrl, targetLanguage, nativeLanguage, difficulty } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 })
    }

    // Check cache: if we already analyzed this image for this user, return existing
    const existingLesson = await db.query.lessons.findFirst({
      where: and(eq(lessons.imageUrl, imageUrl), eq(lessons.userId, userId))
    })

    if (existingLesson) {
      return NextResponse.json({
        lessonId: existingLesson.id,
        cached: true
      })
    }

    // Perform AI analysis
    const data = await analyzeImageOptimized(
      imageUrl,
      targetLanguage || 'en',
      nativeLanguage || 'zh',
      difficulty || 'Beginner'
    )

    // Cache results in database (unsaved state initially)
    const [newLesson] = await db.insert(lessons).values({
      userId,
      imageUrl,
      description: data.description,
      vocabulary: data.vocabulary,
      difficulty: difficulty || 'Beginner',
      isSaved: false
    }).returning()

    return NextResponse.json({
      lessonId: newLesson.id,
      cached: false
    })
  } catch (error) {
    console.error('[API/analyze] Error:', error)
    const message = error instanceof Error ? error.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
