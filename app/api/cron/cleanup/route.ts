import { db, lessons } from '@/db'
import { deleteImage } from '@/actions/upload'
import { and, eq, lt } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Cleanup Cron Job
 * Deletes lessons that have isSaved = false and are older than 24 hours.
 * Also deletes the corresponding image from R2.
 */
export async function GET(request: Request) {
    // Basic auth check using a secret header
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // Find lessons not saved and created more than 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const staleLessons = await db.select()
            .from(lessons)
            .where(
                and(
                    eq(lessons.isSaved, false),
                    lt(lessons.createdAt, twentyFourHoursAgo)
                )
            )

        console.log(`[Cleanup Cron] Found ${staleLessons.length} stale lessons.`)

        const results = await Promise.all(staleLessons.map(async (lesson) => {
            // 1. Delete image from R2
            await deleteImage(lesson.imageUrl)

            // 2. Delete lesson from DB
            await db.delete(lessons).where(eq(lessons.id, lesson.id))

            return lesson.id
        }))

        return NextResponse.json({
            success: true,
            deletedCount: results.length,
            deletedIds: results
        })

    } catch (error) {
        console.error('[Cleanup Cron] Error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
