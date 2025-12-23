'use client'

import { saveLesson } from '@/actions/save-lesson'
import { deleteImage } from '@/actions/upload'
import { ArrowLeft, Check, Languages, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

interface ResultsViewProps {
    data: {
        description: {
            target: string
            native: string
        }
        vocabulary: Array<{
            word: string
            pronunciation: string
            category: string
            translation: string
        }>
    }
    imageUrl: string
    lessonId?: string
    nativeLanguage: string
    targetLanguage: string
    initialSaved?: boolean
}

export function ResultsView({ data, imageUrl, lessonId, nativeLanguage, targetLanguage, initialSaved = false }: ResultsViewProps) {
    const [showNative, setShowNative] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(initialSaved)
    const isSavedRef = useRef(initialSaved)
    const router = useRouter()

    useEffect(() => {
        isSavedRef.current = isSaved
    }, [isSaved])

    const handleSave = async () => {
        if (!lessonId) return
        setIsSaving(true)
        try {
            await saveLesson(lessonId)
            setIsSaved(true)
            router.refresh()
        } catch (error) {
            console.error('Save failed:', error)
            alert('Could not save to history. Ensure database is configured.')
        } finally {
            setIsSaving(false)
        }
    }

    const languageNames: Record<string, string> = {
        en: 'English',
        ko: 'Korean',
        ja: 'Japanese',
        zh: 'Chinese'
    }

    return (
        <div className='max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-12'>
            {/* Header / Navigation */}
            <div className='flex justify-between items-center'>
                <Link
                    href="/analyze"
                    className='group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors'
                >
                    <div className='p-2 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors'>
                        <ArrowLeft className='w-5 h-5' />
                    </div>
                    <span className='font-bold text-sm'>Back to Upload</span>
                </Link>

                <div className='flex items-center gap-3'>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                        className={`
                            px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95
                            ${isSaved
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {isSaving ? (
                            <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                        ) : isSaved ? (
                            <Check className='w-4 h-4' />
                        ) : (
                            <Save className='w-4 h-4' />
                        )}
                        {isSaving ? 'Saving...' : isSaved ? 'Saved to History' : 'Save Session'}
                    </button>
                </div>
            </div>

            <div className='grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch'>
                {/* Left: Image Section (5 cols) */}
                <div className='lg:col-span-5 flex flex-col gap-6'>
                    <div className='relative group rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 bg-white p-2 border border-slate-100 aspect-[4/5] lg:aspect-auto lg:flex-1 min-h-[400px]'>
                        <img
                            src={imageUrl}
                            alt='Analyzed content'
                            className='w-full h-full rounded-[2.2rem] object-contain bg-slate-50'
                        />
                    </div>

                    {/* Visual Difficulty Indicator */}
                    {/* <div className='bg-white rounded-3xl p-6 border border-slate-100 shadow-sm'>
                        <div className='flex justify-between items-center mb-3'>
                            <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>Your Study Goal</span>
                            <span className='text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full'>
                                Learning {languageNames[targetLanguage] || targetLanguage}
                            </span>
                        </div>
                        <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                            <div className='h-full w-[65%] bg-primary rounded-full animate-pulse' />
                        </div>
                    </div> */}
                </div>

                {/* Right: Description Section (7 cols) */}
                <div className='lg:col-span-7'>
                    <div className='bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden h-full flex flex-col justify-between'>
                        <div className='absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none'>
                            <Sparkles className='w-48 h-48 text-primary' />
                        </div>

                        <div>
                            {/* Description Header */}
                            <div className='flex flex-wrap items-center justify-between gap-4 mb-10'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-3 h-3 rounded-full bg-primary shadow-sm ring-4 ring-primary/20'></div>
                                    <h2 className='text-sm font-black text-slate-400 uppercase tracking-[0.25em]'>Perspective</h2>
                                </div>

                                {/* Simple Toggle */}
                                <div className='flex bg-slate-100 p-1.5 rounded-2xl'>
                                    <button
                                        onClick={() => setShowNative(false)}
                                        className={`
                                            px-6 py-2 rounded-xl text-xs font-black transition-all
                                            ${!showNative
                                                ? 'bg-white text-primary shadow-sm scale-105'
                                                : 'text-slate-500 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        {targetLanguage.toUpperCase()}
                                    </button>
                                    <button
                                        onClick={() => setShowNative(true)}
                                        className={`
                                            px-6 py-2 rounded-xl text-xs font-black transition-all
                                            ${showNative
                                                ? 'bg-white text-indigo-600 shadow-sm scale-105'
                                                : 'text-slate-500 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        NATIVE
                                    </button>
                                </div>
                            </div>

                            {/* Main Description Text - Adjusted for side-by-side */}
                            <div className='prose prose-xl max-w-none'>
                                <p className={` text-sm md:text-lg leading-relaxed text-slate-800 font-semibold tracking-tight transition-all duration-300 `}>
                                    {showNative ? data.description.native : data.description.target}
                                </p>
                            </div>
                        </div>

                        {/* Context Footer */}
                        <div className='mt-10 pt-8 border-t border-slate-100 flex items-start gap-4'>
                            <div className='p-2 rounded-xl bg-indigo-50'>
                                <Languages className='w-6 h-6 text-indigo-500' />
                            </div>
                            <p className='text-sm text-slate-400 font-medium leading-relaxed italic'>
                                We've translated this scene into your native language ({languageNames[nativeLanguage] || nativeLanguage}) to help you bridge the gap between concepts and words.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vocabulary Section - Full Width */}
            <div className='space-y-8'>
                <div className='flex items-center gap-6'>
                    <h3 className='text-sm font-black text-slate-300 uppercase tracking-[0.3em] whitespace-nowrap shrink-0'>
                        Key Vocabulary ({data.vocabulary.length})
                    </h3>
                    <div className='h-px flex-1 bg-slate-200'></div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {data.vocabulary.map((item, idx) => (
                        <div
                            key={idx}
                            className='bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group'
                        >
                            <div className='flex justify-between items-start mb-6'>
                                <span className='px-3 py-1.5 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors'>
                                    {item.category}
                                </span>
                                <span className='text-xs font-mono text-slate-200 group-hover:text-primary/20 transition-colors'>#{idx + 1}</span>
                            </div>

                            <h3 className='text-3xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors'>
                                {item.word}
                            </h3>
                            <p className='text-sm font-mono text-slate-400 mb-6'>
                                /{item.pronunciation}/
                            </p>

                            <div className='pt-6 border-t border-slate-50'>
                                <label className='text-[10px] font-black text-slate-300 uppercase mb-2 block tracking-widest'>Meaning</label>
                                <p className='text-lg font-bold text-slate-700'>
                                    {item.translation}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
