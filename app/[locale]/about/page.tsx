import type { Metadata } from 'next'
import AboutModernPage from '@/components/about/AboutModernPage'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type AboutPageProps = {
  params: Promise<{ locale: string }> | { locale: string }
}

const metadataCopy = publicMessages.aboutMetadata

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = metadataCopy[locale]

  return {
    title: t.title,
    description: t.description,
  }
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
