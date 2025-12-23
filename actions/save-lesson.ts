'use server'

import { db, lessons, users } from '@/db'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { promoteImageToSaved } from './upload'

interface LessonData {
    imageUrl: string
    description: { target: string; native: string }
    vocabulary: any
    difficulty: string
}

export async function saveLesson(lessonId: string) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('Unauthorized')
    }

    try {
        // 1. Get the existing lesson
        const lesson = await db.query.lessons.findFirst({
            where: eq(lessons.id, lessonId)
        })

        if (!lesson) throw new Error('Lesson not found')
        if (lesson.userId !== userId) throw new Error('Unauthorized')

        // 2. Promote image from temp/ to saved/ in R2
        // Only promote if it's currently in temp
        let finalImageUrl = lesson.imageUrl
        if (lesson.imageUrl.includes('/temp/')) {
            finalImageUrl = await promoteImageToSaved(lesson.imageUrl)
        }

        // 3. Update the lesson status and permanent URL
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

export async function deleteLesson(lessonId: string) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('Unauthorized')
    }

    try {
        await db.delete(lessons)
            .where(eq(lessons.id, lessonId))

        return { success: true }
    } catch (error) {
        console.error('Failed to delete lesson:', error)
        throw new Error('Database operation failed')
    }
}
