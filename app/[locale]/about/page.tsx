import type { Metadata } from 'next'
import AboutModernPage from '@/components/about/AboutModernPage'

type AboutPageProps = {
  params: Promise<{ locale: string }> | { locale: string }
}

export const metadata: Metadata = {
  title: 'A propos',
  description:
    'Decouvrez CJ Development Training Center, son histoire, sa mission et son approche pratique en formation professionnelle.',
}

export default async function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'fr'

  return (
    <AboutModernPage
      homeHref={`/${locale}`}
      formationsHref={`/${locale}/formations`}
      contactHref={`/${locale}/contact`}
    />
  )
}
