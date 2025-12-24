import { headers, cookies } from 'next/headers'
import { detectLocale } from './detect-locale'
import { getDictionary, DEFAULT_LOCALE } from './messages'

export async function getI18n() {
  const incomingHeaders = await headers()
  const acceptLanguage = incomingHeaders.get('accept-language')
  const cookieStore = await cookies()
  const preferredLocale = cookieStore.get('lexilens-locale')?.value
  const locale = detectLocale(preferredLocale, acceptLanguage)
  const messages = getDictionary(locale)
  return { locale, messages }
}

export { DEFAULT_LOCALE }
