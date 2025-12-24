'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { SUPPORTED_LOCALES, type Locale, DEFAULT_LOCALE } from '@/lib/i18n/messages'

export async function setLocale(nextLocale: Locale) {
  const fallback = SUPPORTED_LOCALES.includes(nextLocale) ? nextLocale : DEFAULT_LOCALE
  const cookieStore = await cookies()
  cookieStore.set('lexilens-locale', fallback, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })

  revalidatePath('/', 'layout')
}
