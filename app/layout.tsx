import './globals.css'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import GoogleAnalytics from '../components/GoogleAnalytics'
import PublicPageFadeUp from '../components/PublicPageFadeUp'
import ScrollToTop from '../components/ScrollToTop'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'], fallback: ['system-ui', 'Arial', 'sans-serif'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cjdevelopmenttc.org'),
  title: {
    default: 'CJ Development Training Center | Formation Professionnelle Panafricaine',
    template: '%s | CJ DTC',
  },
  description:
    'Centre panafricain de formation professionnelle en RH, leadership et employabilite. Formations certifiantes en ligne, hybride et presentiel depuis 2018.',
  keywords: ['formation professionnelle', 'leadership', 'RH', 'emploi', 'Afrique', 'certification', 'CJ Development Training Center', 'CJ DTC'],
  authors: [{ name: 'CJ Development Training Center' }],
  creator: 'CJ Development Training Center',
  publisher: 'CJ Development Training Center',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.cjdevelopmenttc.org',
    siteName: 'CJ DEVELOPMENT TRAINING CENTER',
    title: 'CJ Development Training Center | Formation Professionnelle Panafricaine',
    description:
      'Formations certifiantes en RH, leadership et employabilite pour etudiants, professionnels et entreprises.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'CJ Development Training Center',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CJ Development Training Center | Formation Professionnelle Panafricaine',
    description: 'Batir des competences. Transformer des destins.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Schema.org WebSite — remplace l'en-tête Vercel sur Google par le nom de marque officiel
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CJ DEVELOPMENT TRAINING CENTER',
  alternateName: 'CJ DTC',
  url: 'https://www.cjdevelopmenttc.org',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Schema.org WebSite — positionne le nom de marque officiel dans les résultats Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <PublicPageFadeUp>{children}</PublicPageFadeUp>
        <ScrollToTop />
        <SpeedInsights />
      </body>
    </html>
  )
}
