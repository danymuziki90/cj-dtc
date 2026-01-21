import './globals.css'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import GoogleAnalytics from '../components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://cjdevelopmenttc.com'),
  title: {
    default: 'CJ DEVELOPMENT TRAINING CENTER',
    template: '%s | CJ DTC',
  },
  description: 'Centre Panafricain de Formation Professionnelle, Leadership et Insertion. Formations certifiantes en Management des Ressources Humaines, Leadership et Employabilité depuis 2018.',
  keywords: ['formation professionnelle', 'leadership', 'RH', 'emploi', 'Afrique', 'certification'],
  authors: [{ name: 'CJ Development Training Center' }],
  creator: 'CJ Development Training Center',
  publisher: 'CJ Development Training Center',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png'
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://cjdevelopmenttc.com',
    siteName: 'CJ Development Training Center',
    title: 'CJ Development Training Center',
    description: 'Centre Panafricain de Formation Professionnelle, Leadership et Insertion',
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
    title: 'CJ Development Training Center',
    description: 'Bâtir des compétences. Transformer des destins.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {children}
      </body>
    </html>
  )
}
