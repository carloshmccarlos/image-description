import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, lessons } from '@/db'
import { eq } from 'drizzle-orm'

/**
 * GET /api/analyze/status?lessonId=xxx
 * Polls for analysis completion status
 */
export async function GET (request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lessonId = request.nextUrl.searchParams.get('lessonId')
  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 })
  }

  try {
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId)
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    if (lesson.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const description = lesson.description as { target?: string; native?: string; _pending?: boolean; _error?: string }

    // Check if still pending
    if (description._pending) {
      return NextResponse.json({ status: 'processing' })
    }

    // Check if failed
    if (description._error) {
      return NextResponse.json({ status: 'failed', error: description._error })
    }

    // Completed
    return NextResponse.json({
      status: 'completed',
      lessonId: lesson.id
    })
  } catch (error) {
    console.error('[status] Error:', error)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}
