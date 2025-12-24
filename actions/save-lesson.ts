'use server'

import { db, lessons } from '@/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { promoteImageToSaved, deleteImage } from './upload'

/**
 * Save a lesson to user's history
 * Promotes the image from temp/ to saved/ in R2
 */
export async function saveLesson (lessonId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    // Get the existing lesson
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId)
    })

    if (!lesson) throw new Error('Lesson not found')
    if (lesson.userId !== userId) throw new Error('Unauthorized')

    // Promote image from temp/ to saved/ in R2 (only if currently in temp)
    let finalImageUrl = lesson.imageUrl
    if (lesson.imageUrl.includes('/temp/')) {
      finalImageUrl = await promoteImageToSaved(lesson.imageUrl)
    }

    // Update the lesson status and permanent URL
    const [updatedLesson] = await db.update(lessons)
      .set({
        imageUrl: finalImageUrl,
        isSaved: true
      })
      .where(eq(lessons.id, lessonId))
      .returning()

    return { success: true, lesson: updatedLesson }
  } catch (error) {
    console.error('Failed to save lesson:', error)
    throw new Error('Database operation failed')
  }
}

/**
 * Delete a lesson and its associated image from R2
 */
export async function deleteLesson (lessonId: string) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId)
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    if (lesson.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Remove the lesson image from R2 to avoid storage leaks
    await deleteImage(lesson.imageUrl)

    await db.delete(lessons)
      .where(eq(lessons.id, lessonId))

    return { success: true }
  } catch (error) {
    console.error('Failed to delete lesson:', error)
    throw new Error('Database operation failed')
  }
}
