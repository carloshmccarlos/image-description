'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, X, Sparkles, Languages } from 'lucide-react'
import { uploadToR2 } from '@/actions/upload'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/image-utils'

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
]

const DIFFICULTIES = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Advanced', value: 'Advanced' },
]

interface UploadZoneProps {
    initialPrefs?: {
        nativeLanguage: string
        targetLanguage: string
        difficulty: string
    } | null
}

export function UploadZone({ initialPrefs }: UploadZoneProps) {
    const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle')
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Config state
    const [nativeLang, setNativeLang] = useState(initialPrefs?.nativeLanguage || 'zh')
    const [targetLang, setTargetLang] = useState(initialPrefs?.targetLanguage || 'en')
    const [difficulty, setDifficulty] = useState(initialPrefs?.difficulty || 'Beginner')

    const router = useRouter()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0]
        if (!selectedFile) return

        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
    }, [])

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFile(null)
        setPreviewUrl(null)
        setStatus('idle')
    }

    const handleAnalyze = async () => {
        if (!file) return

        try {
            setStatus('compressing')
            const compressedFile = await compressImage(file, 500 * 1024)

            setStatus('uploading')
            const formData = new FormData()
            formData.append('file', compressedFile)
            const { url } = await uploadToR2(formData)

            // Redirect with query params for the analysis
            router.push(`/results?url=${encodeURIComponent(url)}&target=${targetLang}&native=${nativeLang}&level=${difficulty}`)
        } catch (error) {
            console.error('Process failed:', error)
            alert('Analysis failed. Please try again.')
            setStatus('idle')
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false,
        noClick: !!file // Disable click if we already have a file
    })

    return (
        <div className="space-y-8">
            <div
                {...getRootProps()}
                className={`
                    relative overflow-hidden
                    border-2 border-dashed rounded-[2.5rem] 
                    transition-all duration-300
                    ${file ? 'border-primary bg-white' : (isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50 cursor-pointer')}
                `}
            >
                <input {...getInputProps()} />

                {status !== 'idle' ? (
                    <div className='flex flex-col items-center gap-4 py-20 px-6'>
                        <div className='relative'>
                            <div className='absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse'></div>
                            <Loader2 className='w-16 h-16 text-primary animate-spin relative z-10' />
                        </div>
                        <p className='text-xl font-bold text-slate-900'>
                            {status === 'compressing' ? 'Optimizing Image...' : 'Analyzing Scene...'}
                        </p>
                        <p className='text-slate-500'>
                            {status === 'compressing' ? 'Reducing file size for faster AI analysis' : 'Uploading to secure storage'}
                        </p>
                    </div>
                ) : file ? (
                    <div className="relative p-4 md:p-8">
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xl relative group">
                            <img
                                src={previewUrl!}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                            <button
                                onClick={handleReset}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-all z-20"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 md:p-20 flex flex-col items-center justify-center gap-6">
                        <div className='w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary transition-transform group-hover:scale-110'>
                            <Upload className='w-12 h-12' />
                        </div>
                        <div className='text-center'>
                            <h3 className='text-2xl font-extrabold text-slate-900 mb-2'>Select a Scene</h3>
                            <p className='text-slate-500 max-w-xs mx-auto text-lg'>
                                Drag & drop a photo here, or click to browse
                            </p>
                        </div>
                        <div className='mt-4 bg-white border border-slate-200 px-8 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-all hover:border-slate-300'>
                            Browse Files
                        </div>
                    </div>
                )}
            </div>

            {file && status === 'idle' && (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Language Configuration */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Languages className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900">Language Pairing</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Native Language</label>
                                    <select
                                        value={nativeLang}
                                        onChange={(e) => setNativeLang(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                                    >
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Language</label>
                                    <select
                                        value={targetLang}
                                        onChange={(e) => setTargetLang(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                                    >
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Difficulty Configuration */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900">Study Level</h4>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {DIFFICULTIES.map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => setDifficulty(level.value)}
                                        className={`
                                            flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                            ${difficulty === level.value
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                                : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'}
                                        `}
                                    >
                                        <span className="font-bold text-sm">{level.label}</span>
                                        {difficulty === level.value && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        className="w-full bg-primary text-white font-black py-5 px-8 rounded-2xl text-xl shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Sparkles className="w-6 h-6" />
                        Run AI Analysis
                    </button>
                </div>
            )}
        </div>
    )
}
