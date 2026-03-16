import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { generatePageMetadata } from '@/components/PageMetadata'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

const copy = publicMessages.partnersMetadata

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> | { locale: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]

  return generatePageMetadata({
    title: t.title,
    description: t.description,
    keywords: ['partners', 'collaboration', 'CJ DTC', 'Africa'],
  })
}

export default function PartenairesLayout({ children }: { children: ReactNode }) {
  return children
}
