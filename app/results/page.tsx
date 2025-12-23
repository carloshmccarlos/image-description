import { analyzeImage } from '@/actions/analyze'
import { getUserPreferences } from '@/actions/user'
import { ResultsView } from '@/components/ResultsView'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { auth } from '@clerk/nextjs/server'

import { db, lessons } from '@/db'
import { eq, and } from 'drizzle-orm'

export default async function ResultsPage({
    searchParams
}: {
    searchParams: Promise<{ url?: string; id?: string; target?: string; native?: string; level?: string }>
}) {
    const { url: imageUrl, id: lessonId, target, native, level } = await searchParams
    const { userId } = await auth()

    if (!imageUrl && !lessonId) {
        redirect('/analyze')
    }

    if (!userId) {
        redirect('/sign-in')
    }

    // Get user preferences (guaranteed to have defaults now)
    const prefs = await getUserPreferences()
    if (!prefs) redirect('/')

    try {
        let data: any
        let finalImageUrl = imageUrl
        let isPreviouslySaved = false
        let finalLessonId = lessonId

        if (lessonId) {
            // Load from database
            const [savedLesson] = await db.select()
                .from(lessons)
                .where(eq(lessons.id, lessonId))

            if (!savedLesson) {
                redirect('/analyze')
            }

            let description = savedLesson.description
            if (typeof description === 'string') {
                description = { target: description, native: description }
            }

            data = {
                description: description,
                vocabulary: savedLesson.vocabulary
            }
            finalImageUrl = savedLesson.imageUrl
            isPreviouslySaved = savedLesson.isSaved
            finalLessonId = savedLesson.id
        } else if (imageUrl) {
            // Check if we already analyzed this image for this user in this session
            const existingLesson = await db.query.lessons.findFirst({
                where: and(eq(lessons.imageUrl, imageUrl), eq(lessons.userId, userId))
            })

            if (existingLesson) {
                redirect(`/results?id=${existingLesson.id}`)
            }

            // Perform the AI analysis server-side
            data = await analyzeImage(
                imageUrl,
                (target || prefs.targetLanguage) as string,
                (native || prefs.nativeLanguage) as string,
                (level || prefs.difficulty) as string
            )

            // Cache the results in DB (unsaved state)
            const [newLesson] = await db.insert(lessons).values({
                userId,
                imageUrl,
                description: data.description,
                vocabulary: data.vocabulary,
                difficulty: (level || prefs.difficulty) as string,
                isSaved: false
            }).returning()

            // Redirect to the ID so refreshing won't re-trigger AI
            redirect(`/results?id=${newLesson.id}`)
        }

        return (
            <div className='min-h-screen bg-slate-50'>
                <ResultsView
                    data={data}
                    imageUrl={finalImageUrl!}
                    lessonId={finalLessonId}
                    nativeLanguage={(native || prefs.nativeLanguage) as string}
                    targetLanguage={(target || prefs.targetLanguage) as string}
                    initialSaved={isPreviouslySaved}
                />
            </div>
        )
    } catch (error) {
        if (isRedirectError(error)) {
            throw error
        }

        console.error('Analysis failed:', error)

        // Check if error is due to missing API key
        const isApiKeyMissing = error instanceof Error && error.message.includes('SILICONFLOW_API_KEY')

        return (
            <div className='min-h-screen flex flex-col items-center justify-center p-6 text-center'>
                <div className='w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6'>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h1 className='text-3xl font-extrabold text-slate-900 mb-4 tracking-tight'>
                    {isApiKeyMissing ? 'Configuration Required' : 'Analysis Interrupted'}
                </h1>
                <p className='text-lg text-slate-600 mb-10 max-w-lg leading-relaxed'>
                    {isApiKeyMissing
                        ? 'The SiliconFlow API key is missing. Please check your environment variables.'
                        : "We encountered an error while communicating with the AI. This can happen with large images or service timeouts."}
                </p>
                <div className='flex gap-4'>
                    <Link
                        href='/analyze'
                        className='bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95'
                    >
                        Try Another Image
                    </Link>
                </div>
            </div>
        )
    }
}
