import type { Metadata } from 'next'
import AboutModernPage from '@/components/about/AboutModernPage'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type AboutPageProps = {
  params: Promise<{ locale: string }> | { locale: string }
}

const metadataCopy = publicMessages.aboutMetadata

import { buildMetadata } from '@/lib/seo-config'

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = metadataCopy[locale]

  return buildMetadata({
    title: t.title || 'À propos de nous | CJ Development Training Center',
    description: t.description || 'Découvrez l\'histoire, la vision et l\'engagement panafricain de CJ DTC dans la formation en leadership et management des RH depuis 2018.',
    keywords: ['à propos', 'histoire CJ DTC', 'centre de formation panafricain', 'vision', 'valeurs', 'équipe'],
    path: `/${locale}/about`,
  })
}

export default async function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)

  return (
    <AboutModernPage
      locale={locale}
      homeHref={`/${locale}`}
      formationsHref={`/${locale}/formations`}
      contactHref={`/${locale}/contact`}
    />
  )
}
