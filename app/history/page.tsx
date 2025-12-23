import { db, lessons } from '@/db'
import { auth } from '@clerk/nextjs/server'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DeleteLessonButton } from '@/components/DeleteLessonButton'

export default async function HistoryPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/')
    }

    const userLessons = await db.select()
        .from(lessons)
        .where(eq(lessons.userId, userId))
        .orderBy(desc(lessons.createdAt))

    return (
        <div className='min-h-screen bg-slate-50 py-16 px-6'>
            <div className='max-w-6xl mx-auto'>
                <div className='flex justify-between items-end mb-12'>
                    <div>
                        <h1 className='text-4xl font-extrabold text-slate-900 tracking-tight mb-2'>Learning History</h1>
                        <p className='text-slate-500 font-medium'>Review your previous visual lessons and vocabulary.</p>
                    </div>
                    <Link
                        href='/analyze'
                        className='hidden md:flex bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95'
                    >
                        New Session
                    </Link>
                </div>

                {userLessons.length === 0 ? (
                    <div className='bg-white p-20 rounded-[3rem] text-center border border-slate-100 shadow-sm'>
                        <div className='w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl'>
                            📚
                        </div>
                        <p className='text-xl text-slate-600 font-medium mb-8'>You haven't saved any lessons yet.</p>
                        <Link
                            href='/analyze'
                            className='inline-block bg-primary text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-primary/20'
                        >
                            Analyze Your First Image
                        </Link>
                    </div>
                ) : (
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {userLessons.map((lesson) => (
                            <div key={lesson.id} className="relative group">
                                <Link
                                    href={`/results?id=${lesson.id}`}
                                    className='block bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
                                >
                                    <div className='aspect-[16/10] overflow-hidden bg-slate-100 relative'>
                                        <img
                                            src={lesson.imageUrl}
                                            alt='Lesson thumbnail'
                                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                                        />
                                    </div>
                                    <div className='p-8'>
                                        <p className='text-slate-900 font-bold line-clamp-2 leading-relaxed mb-6 group-hover:text-primary transition-colors'>
                                            {(lesson.description as any).target}
                                        </p>
                                        <div className='flex justify-between items-center pt-4 border-t border-slate-50'>
                                            <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                                                {new Date(lesson.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <div className='flex -space-x-2'>
                                                {(lesson.vocabulary as any[]).slice(0, 3).map((_, i) => (
                                                    <div key={i} className='w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500'>
                                                        {i + 1}
                                                    </div>
                                                ))}
                                                {(lesson.vocabulary as any[]).length > 3 && (
                                                    <div className='w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400'>
                                                        +{(lesson.vocabulary as any[]).length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <DeleteLessonButton lessonId={lesson.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
