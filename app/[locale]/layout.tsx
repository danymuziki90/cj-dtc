import { ReactNode } from 'react'
import type { Metadata } from 'next'
import ConditionalLayout from '../../components/ConditionalLayout'
import StructuredData from '../../components/StructuredData'
import SessionProviderWrapper from '../../components/SessionProviderWrapper'
import WebVitals from '../_components/WebVitals'
import I18nProvider from '../i18n'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cjdevelopmenttc.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: {
    default: 'CJ Development Training Center - Formation professionnelle panafricaine',
    template: '%s | CJ DTC',
  },
  description:
    'Centre panafricain de formation professionnelle en RH, leadership et employabilite. Programmes certifiants depuis 2018.',
  keywords: [
    'formation professionnelle',
    'leadership',
    'RH',
    'emploi',
    'Afrique',
    'certification',
    'insertion professionnelle',
    'CJ DTC',
  ],
  authors: [{ name: 'CJ Development Training Center' }],
  openGraph: {
    title: 'CJ Development Training Center',
    description: 'Batir des competences. Transformer des destins. Creer des opportunites.',
    url: APP_URL,
    siteName: 'CJ DTC',
    images: [
      {
        url: `${APP_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'CJ Development Training Center',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CJ Development Training Center',
    description: 'Batir des competences. Transformer des destins.',
    images: [`${APP_URL}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      'fr': `${APP_URL}/fr`,
      'en': `${APP_URL}/en`,
      'x-default': `${APP_URL}/fr`,
    },
  },
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'fr'

  const messages = {}

  return (
    <I18nProvider messages={messages} locale={locale}>
      <SessionProviderWrapper>
        <StructuredData />
        <WebVitals />
        <ConditionalLayout>{children}</ConditionalLayout>
      </SessionProviderWrapper>
    </I18nProvider>
  )
}
