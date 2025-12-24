import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/context'
import { getI18n } from '@/lib/i18n/server'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lexilens.app'

// Expanded metadata improves SEO, sharing previews, and install hints
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LexiLens – Visual English Learning',
    template: '%s | LexiLens'
  },
  description: 'Learn English visually with AI-crafted lessons, vocabulary drills, and instant translations.',
  keywords: [
    'LexiLens',
    'language learning',
    'AI tutor',
    'image description',
    'ESL',
    'visual learning'
  ],
  category: 'education',
  applicationName: 'LexiLens',
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: 'LexiLens – Visual English Learning',
    description: 'Turn any image into an immersive language lesson with AI translations and vocabulary.',
    url: siteUrl,
    siteName: 'LexiLens',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Learner using LexiLens to study languages with images'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexiLens – Visual English Learning',
    description: 'Upload a photo, get AI-powered descriptions, and expand your vocabulary instantly.',
    site: '@lexilensapp',
    creator: '@lexilensapp',
    images: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop'
    ]
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [{ url: '/lexilens-icon.svg', type: 'image/svg+xml', sizes: 'any' }],
    shortcut: ['/lexilens-icon.svg'],
    apple: ['/lexilens-icon.svg']
  },
  robots: {
    index: true,
    follow: true
  },
  appleWebApp: {
    capable: true,
    title: 'LexiLens',
    statusBarStyle: 'default'
  },
  formatDetection: {
    telephone: false
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const i18n = await getI18n()

  return (
    <ClerkProvider>
      <html lang={i18n.locale}>
        <body
          className={`${jakarta.variable} ${geistMono.variable} antialiased`}
        >
          <I18nProvider value={i18n}>
            <Navbar />
            {children}
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
