import { UploadZone } from '@/components/UploadZone'
import { getUserPreferences } from '@/actions/user'
import { getI18n } from '@/lib/i18n/server'

export default async function AnalyzePage() {
    const [prefs, { messages }] = await Promise.all([
        getUserPreferences(),
        getI18n()
    ])

    return (
        <div className='bg-slate-50 min-h-screen py-16 px-6'>
            <div className='max-w-4xl mx-auto'>
                <div className='mb-12 text-center'>
                    <h1 className='text-4xl font-extrabold text-slate-900 mb-4'>{messages.analyzePage.title}</h1>
                    <p className='text-lg text-slate-600'>{messages.analyzePage.subtitle}</p>
                </div>

                <UploadZone initialPrefs={prefs ? {
                    nativeLanguage: prefs.nativeLanguage as string,
                    targetLanguage: prefs.targetLanguage as string,
                    difficulty: prefs.difficulty as string
                } : null} />

                <div className='mt-16 grid md:grid-cols-2 gap-8'>
                    <div className='bg-white p-8 rounded-3xl border border-slate-200 shadow-sm'>
                        <h3 className='font-bold text-xl mb-4 flex items-center gap-2'>
                            <span className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm'>1</span>
                            {messages.analyzePage.steps.uploadTitle}
                        </h3>
                        <p className='text-slate-600'>{messages.analyzePage.steps.uploadDesc}</p>
                    </div>
                    <div className='bg-white p-8 rounded-3xl border border-slate-200 shadow-sm'>
                        <h3 className='font-bold text-xl mb-4 flex items-center gap-2'>
                            <span className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm'>2</span>
                            {messages.analyzePage.steps.analyzeTitle}
                        </h3>
                        <p className='text-slate-600'>{messages.analyzePage.steps.analyzeDesc}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
