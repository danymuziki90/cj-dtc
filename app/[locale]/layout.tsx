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

import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'CJ Development Training Center - Formation Professionnelle Panafricaine',
    description: 'Centre panafricain d\'excellence en formation professionnelle, RH, leadership et insertion. Formations certifiantes en ligne et présentiel depuis 2018.',
    keywords: [
      'formation professionnelle',
      'leadership',
      'ressources humaines',
      'RH',
      'employabilité',
      'Afrique',
      'certification',
      'insertion professionnelle',
      'CJ DTC',
    ],
    path: '/',
  }),
  title: {
    default: 'CJ Development Training Center - Formation Professionnelle Panafricaine',
    template: '%s | CJ DTC',
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
