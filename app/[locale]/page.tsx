import { resolveSiteLocale } from '@/lib/i18n/locale'
import { getHeroData } from '@/lib/hero/getHeroData'

import HomeHero from '@/components/home/HomeHero'
import WhoWeAre from '@/components/home/WhoWeAre'
import ExpertiseServices from '@/components/home/ExpertiseServices'
import RecentSessions from '@/components/RecentSessions'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import TestimonialsAndResults from '@/components/home/TestimonialsAndResults'
import NewsAndOpportunities from '@/components/home/NewsAndOpportunities'
import FinalCTA from '@/components/home/FinalCTA'

export const revalidate = 60

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale?: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = resolveSiteLocale(rawLocale)

  // Charger les données Hero depuis la DB (slides dynamiques)
  const heroData = await getHeroData('home')

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section (première impression) */}
      <HomeHero heroData={heroData} locale={locale} />

      {/* 2. Présentation rapide ("Who We Are") */}
      <WhoWeAre locale={locale} />

      {/* 3. Nos domaines d'expertise / Services */}
      <ExpertiseServices locale={locale} />

      {/* 4. Nos formations / Sessions ouvertes */}
      <RecentSessions />

      {/* 5. Pourquoi nous choisir ? */}
      <WhyChooseUs locale={locale} />

      {/* 6. Témoignages / Réalisations */}
      <TestimonialsAndResults locale={locale} />

      {/* 8. Actualités et opportunités */}
      <NewsAndOpportunities locale={locale} />

      {/* 9. Call To Action final */}
      <FinalCTA locale={locale} />
    </div>
  )
}
