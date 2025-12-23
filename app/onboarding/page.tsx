'use client'

import { updateUserPreferences } from '@/actions/user'
import { ArrowRight, Languages, Check } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
]

function OnboardingContent() {
    const searchParams = useSearchParams()
    const returnTo = searchParams.get('returnTo') || '/'
    const [nativeLang, setNativeLang] = useState('')
    const [targetLang, setTargetLang] = useState('')
    const [difficulty, setDifficulty] = useState('Beginner')

    const DIFFICULTIES = [
        { label: 'Beginner', value: 'Beginner', desc: 'Simple words & short sentences' },
        { label: 'Medium', value: 'Medium', desc: 'Detailed scenes & context' },
        { label: 'Advanced', value: 'Advanced', desc: 'Complex insights & nuances' },
    ]

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-mint-50 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="max-w-xl w-full relative z-10 space-y-12">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <Languages className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Welcome to LexiLens
                    </h1>
                    <p className="text-lg text-slate-500 max-w-sm mx-auto">
                        Let's personalize your learning experience. Tell us about your languages.
                    </p>
                </div>

                <form action={updateUserPreferences} className="space-y-10">
                    {/* Native Language Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block text-center">
                            What is your mother language?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {LANGUAGES.map((lang) => (
                                <label key={lang.code} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="nativeLanguage"
                                        value={lang.code}
                                        checked={nativeLang === lang.code}
                                        onChange={(e) => setNativeLang(e.target.value)}
                                        className="peer sr-only"
                                    />
                                    <div className="
                                        flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-100 bg-white
                                        transition-all duration-200
                                        peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary
                                        hover:border-primary/50 hover:shadow-lg hover:-translate-y-1
                                    ">
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className="font-bold text-sm">{lang.name}</span>
                                        {nativeLang === lang.code && (
                                            <div className="absolute top-2 right-2 text-primary">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Target Language Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block text-center">
                            Which language do you want to learn?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {LANGUAGES.map((lang) => (
                                <label key={lang.code} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="targetLanguage"
                                        value={lang.code}
                                        checked={targetLang === lang.code}
                                        onChange={(e) => setTargetLang(e.target.value)}
                                        className="peer sr-only"
                                    />
                                    <div className="
                                        flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-100 bg-white
                                        transition-all duration-200
                                        peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-600
                                        hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1
                                    ">
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className="font-bold text-sm">{lang.name}</span>
                                        {targetLang === lang.code && (
                                            <div className="absolute top-2 right-2 text-indigo-600">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block text-center">
                            Set your learning level
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {DIFFICULTIES.map((level) => (
                                <label key={level.value} className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value={level.value}
                                        checked={difficulty === level.value}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="peer sr-only"
                                    />
                                    <div className="
                                        flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 border-slate-100 bg-white
                                        transition-all duration-200
                                        peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700
                                        hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 h-full
                                    ">
                                        <span className="font-bold text-sm">{level.label}</span>
                                        <span className="text-[10px] text-slate-400 text-center leading-tight">
                                            {level.desc}
                                        </span>
                                        {difficulty === level.value && (
                                            <div className="absolute top-2 right-2 text-emerald-600">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!nativeLang || !targetLang || !difficulty}
                        className="
                            w-full bg-primary text-white font-bold py-4 px-8 rounded-2xl text-lg
                            shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 
                            transform hover:-translate-y-0.5 transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
                            flex items-center justify-center gap-2
                        "
                    >
                        Start Learning <ArrowRight className="w-5 h-5" />
                    </button>

                    <input type="hidden" name="nativeLanguage" value={nativeLang} />
                    <input type="hidden" name="targetLanguage" value={targetLang} />
                    <input type="hidden" name="difficulty" value={difficulty} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                </form>
            </div>
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    )
}
