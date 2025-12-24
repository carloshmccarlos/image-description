'use client'

import { createContext, ReactNode } from 'react'
import type { Messages, Locale } from './messages'

type I18nValue = {
  locale: Locale
  messages: Messages
}

export const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ value, children }: { value: I18nValue, children: ReactNode }) {
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
