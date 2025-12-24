import { ResultsView } from '@/components/ResultsView'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { db, lessons } from '@/db'
import { eq } from 'drizzle-orm'

/**
 * Results page - displays analyzed lesson data
 * Now only loads from database (analysis happens via API route)
 * This prevents HTTP2 protocol errors on Vercel
 */
export default async function ResultsPage ({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id: lessonId } = await searchParams
  const { userId } = await auth()

  // Guard: require lesson ID
  if (!lessonId) {
    redirect('/analyze')
  }

  // Guard: require authentication
  if (!userId) {
    redirect('/sign-in')
  }

  // Load lesson from database
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId)
  })

  // Guard: lesson must exist and belong to user
  if (!lesson || lesson.userId !== userId) {
    redirect('/analyze')
  }

  // Normalize description format (handle legacy string format)
  let description = lesson.description as { target: string; native: string }
  if (typeof description === 'string') {
    description = { target: description, native: description }
  }

  const data = {
    description,
    vocabulary: lesson.vocabulary as Array<{
      word: string
      pronunciation: string
      category: string
      translation: string
    }>
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <ResultsView
        data={data}
        imageUrl={lesson.imageUrl}
        lessonId={lesson.id}
        nativeLanguage='zh'
        targetLanguage='en'
        initialSaved={lesson.isSaved}
      />
    </div>
  )
}
