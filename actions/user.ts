'use server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { auth, currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function updateUserPreferences(formData: FormData) {
    const { userId } = await auth()
    if (!userId) {
        throw new Error('Unauthorized')
    }

    const nativeLanguage = formData.get('nativeLanguage') as string
    const targetLanguage = formData.get('targetLanguage') as string
    const difficulty = formData.get('difficulty') as string

    if (!nativeLanguage || !targetLanguage || !difficulty) {
        throw new Error('Missing language or difficulty selection')
    }

    // Upsert user (in case they don't exist in our DB yet)
    // Note: In a real app, you might sync users via Webhooks, but here we can ensure they exist on write.
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    const imageUrl = user?.imageUrl

    await db.insert(users).values({
        id: userId,
        email: email,
        imageUrl: imageUrl,
        nativeLanguage,
        targetLanguage,
        difficulty
    }).onConflictDoUpdate({
        target: users.id,
        set: {
            nativeLanguage,
            targetLanguage,
            difficulty,
            updatedAt: new Date()
        }
    })

    const returnTo = formData.get('returnTo') as string || '/'
    redirect(returnTo)
}

export async function getUserPreferences() {
    const { userId } = await auth()
    if (!userId) return null

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    })

    if (user) {
        return {
            nativeLanguage: user.nativeLanguage,
            targetLanguage: user.targetLanguage,
            difficulty: user.difficulty
        }
    }

    // If the user has never saved preferences, create a baseline row so FK constraints succeed
    const current = await currentUser()
    const defaults = {
        nativeLanguage: 'zh',
        targetLanguage: 'en',
        difficulty: 'Beginner'
    }

    await db.insert(users).values({
        id: userId,
        email: current?.emailAddresses[0]?.emailAddress,
        imageUrl: current?.imageUrl,
        ...defaults
    }).onConflictDoNothing()

    return defaults
}
