import AboutModernPage from '@/components/about/AboutModernPage'

type AboutPageProps = {
  params: Promise<{ locale: string }> | { locale: string }
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
