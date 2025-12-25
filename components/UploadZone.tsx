'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, X, Sparkles, Languages } from 'lucide-react'
import { uploadToR2 } from '@/actions/upload'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/image-utils'
import { useI18n } from '@/lib/i18n/use-i18n'

// Available language options
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
]

// Difficulty level options
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

export function UploadZone ({ initialPrefs }: UploadZoneProps) {
  // Status includes 'analyzing' phase for the API call
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading' | 'analyzing'>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Config state with defaults from user preferences
  const [nativeLang, setNativeLang] = useState(initialPrefs?.nativeLanguage || 'zh')
  const [targetLang, setTargetLang] = useState(initialPrefs?.targetLanguage || 'en')
  const [difficulty, setDifficulty] = useState(initialPrefs?.difficulty || 'Beginner')

  const router = useRouter()
  const { messages } = useI18n()

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setErrorMessage(null)
  }, [])

  // Reset to initial state
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setPreviewUrl(null)
    setStatus('idle')
    setErrorMessage(null)
  }

  /**
   * Analysis flow:
   * 1. Compress image client-side
   * 2. Upload to R2
   * 3. Call API route for AI analysis
   * 4. Navigate to results page with lesson ID
   */
  const handleAnalyze = async () => {
    if (!file) return

    setErrorMessage(null)

    try {
      // Step 1: Compress
      setStatus('compressing')
      const compressedFile = await compressImage(file, 500 * 1024)

      // Step 2: Upload to R2
      setStatus('uploading')
      const formData = new FormData()
      formData.append('file', compressedFile)
      const { url } = await uploadToR2(formData)

      // Step 3: Call API for analysis
      setStatus('analyzing')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          targetLanguage: targetLang,
          nativeLanguage: nativeLang,
          difficulty
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed')
      }

      if (!result.lessonId) {
        throw new Error('No lesson ID received')
      }

      // Step 4: Navigate to results
      router.push(`/results?id=${result.lessonId}`)
    } catch (error) {
      console.error('Process failed:', error)
      const msg = error instanceof Error ? error.message : messages.upload.errorMessage
      setErrorMessage(msg)
      setStatus('idle')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: !!file
  })

  // Helper to get status message based on current state
  const getStatusMessage = () => {
    switch (status) {
      case 'compressing':
        return { title: messages.upload.compressingTitle, subtitle: messages.upload.compressingSubtitle }
      case 'uploading':
        return { title: messages.upload.uploadingTitle, subtitle: messages.upload.uploadingSubtitle }
      case 'analyzing':
        return { title: messages.upload.analyzingTitle, subtitle: messages.upload.analyzingSubtitle }
      default:
        return { title: '', subtitle: '' }
    }
  }

  return (
    <div className="space-y-8">
      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <X className="w-5 h-5 shrink-0" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

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
              {getStatusMessage().title}
            </p>
            <p className='text-slate-500'>
              {getStatusMessage().subtitle}
            </p>
          </div>
        ) : file ? (
          <div className="relative p-4 md:p-8">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xl relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <h3 className='text-2xl font-extrabold text-slate-900 mb-2'>{messages.upload.dropTitle}</h3>
              <p className='text-slate-500 max-w-xs mx-auto text-lg'>
                {messages.upload.dropSubtitle}
              </p>
            </div>
            <div className='mt-4 bg-white border border-slate-200 px-8 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 transition-all hover:border-slate-300'>
              {messages.upload.browseCta}
            </div>
          </div>
        )}
      </div>

      {/* Configuration panel - shown when file is selected */}
      {file && status === 'idle' && (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Language Configuration */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Languages className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900">{messages.upload.languageHeading}</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {`${messages.upload.targetLabel} (${messages.upload.targetHint})`}
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
                  >
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {`${messages.upload.nativeLabel} (${messages.upload.nativeHint})`}
                  </label>
                  <select
                    value={nativeLang}
                    onChange={(e) => setNativeLang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
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
                <h4 className="font-bold text-slate-900">{messages.upload.difficultyHeading}</h4>
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
            {messages.upload.runAnalysisCta}
          </button>
        </div>
      )}
    </div>
  )
}
