import { db, lessons } from '@/db'
import { deleteImage } from '@/actions/upload'
import { and, eq, lt } from 'drizzle-orm'

/**
 * Deletes unsaved lessons older than 24h and removes their images from R2.
 * Returns metadata so cron routes can report what happened.
 */
export async function cleanupStaleLessons () {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const staleLessons = await db
    .select()
    .from(lessons)
    .where(
      and(
        eq(lessons.isSaved, false),
        lt(lessons.createdAt, twentyFourHoursAgo)
      )
    )

  if (!staleLessons.length) {
    return { deletedCount: 0, deletedIds: [] }
  }

  console.log(`[Cleanup Cron] Found ${staleLessons.length} stale lessons.`)

  const deletedIds = await Promise.all(staleLessons.map(async lesson => {
    await deleteImage(lesson.imageUrl)
    await db.delete(lessons).where(eq(lessons.id, lesson.id))
    return lesson.id
  }))

  return { deletedCount: deletedIds.length, deletedIds }
}
