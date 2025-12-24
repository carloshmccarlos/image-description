'use client'

import { useState, useTransition } from 'react'
import { Globe } from 'lucide-react'
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/messages'
import { useI18n } from '@/lib/i18n/use-i18n'
import { setLocale } from '@/actions/i18n'

const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷'
}

export function LanguageSwitcher() {
  const { locale, messages } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      setIsOpen(false)
      return
    }

    startTransition(async () => {
      await setLocale(nextLocale)
      setIsOpen(false)
    })
  }

  return (
    <div className='relative'>
      <button
        className='flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary/40 hover:text-primary transition-colors bg-white'
        onClick={() => setIsOpen(prev => !prev)}
        type='button'
        aria-label={messages.nav.language}
      >
        <Globe className='w-4 h-4' />
        <span className='uppercase text-xs font-black'>{locale}</span>
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/40 p-2 z-50'>
          {SUPPORTED_LOCALES.map(option => (
            <button
              key={option}
              type='button'
              onClick={() => handleSelect(option)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                option === locale
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              disabled={isPending}
            >
              <span>{LOCALE_FLAGS[option]}</span>
              <span>{messages.languages[option] || option.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
