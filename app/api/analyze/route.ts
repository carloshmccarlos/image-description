import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, lessons } from '@/db'
import { eq, and } from 'drizzle-orm'

/**
 * POST /api/analyze - Quick endpoint that just creates a job record
 * Returns immediately with a job ID for polling
 * Actual processing happens in /api/analyze/process
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

    // Check if lesson already exists (cache hit)
    const existingLesson = await db.query.lessons.findFirst({
      where: and(eq(lessons.imageUrl, imageUrl), eq(lessons.userId, userId))
    })

    if (existingLesson) {
      return NextResponse.json({
        status: 'completed',
        lessonId: existingLesson.id,
        cached: true
      })
    }

    // Create a pending lesson record (acts as job tracker)
    const [pendingLesson] = await db.insert(lessons).values({
      userId,
      imageUrl,
      description: { target: '', native: '', _pending: true },
      vocabulary: [],
      difficulty,
      isSaved: false
    }).returning()

    // Fire-and-forget: trigger processing
    // Don't await - let it run in background
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    fetch(`${baseUrl}/api/analyze/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CRON_SECRET || ''
      },
      body: JSON.stringify({
        lessonId: pendingLesson.id,
        imageUrl,
        targetLanguage,
        nativeLanguage,
        difficulty
      })
    }).catch(err => console.error('[analyze] Failed to trigger process:', err))

    return NextResponse.json({
      status: 'processing',
      lessonId: pendingLesson.id
    })
  } catch (error) {
    console.error('[API/analyze] Error:', error)
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 })
  }
}
