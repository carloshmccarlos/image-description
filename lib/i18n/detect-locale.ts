import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './messages'

function isSupported(locale?: string | null): locale is Locale {
  if (!locale) return false
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

export function detectLocale(preferredLocale?: string | null, acceptLanguage?: string | null): Locale {
  if (isSupported(preferredLocale)) {
    return preferredLocale
  }

  if (!acceptLanguage) return DEFAULT_LOCALE

  const preferences = acceptLanguage.split(',').map(segment => {
    const [langPart, qPart] = segment.trim().split(';')
    const weight = qPart ? parseFloat(qPart.replace('q=', '')) : 1
    const normalized = langPart.toLowerCase()
    return { lang: normalized, score: Number.isFinite(weight) ? weight : 0 }
  }).sort((a, b) => b.score - a.score)

  for (const preference of preferences) {
    const base = preference.lang.split('-')[0]
    const directMatch = SUPPORTED_LOCALES.find(locale => locale === preference.lang)
    if (directMatch) return directMatch

    const baseMatch = SUPPORTED_LOCALES.find(locale => locale === base)
    if (baseMatch) return baseMatch
  }

  return DEFAULT_LOCALE
}
