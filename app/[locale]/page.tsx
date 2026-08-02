'use client'

import { useParams } from 'next/navigation'
import { resolveSiteLocale } from '@/lib/i18n/locale'

import Hero from '@/components/Hero'
import WhoWeAre from '@/components/home/WhoWeAre'
import ExpertiseServices from '@/components/home/ExpertiseServices'
import RecentSessions from '@/components/RecentSessions'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import TestimonialsAndResults from '@/components/home/TestimonialsAndResults'
import NewsAndOpportunities from '@/components/home/NewsAndOpportunities'
import FinalCTA from '@/components/home/FinalCTA'

export default function HomePage() {
  const params = useParams<{ locale?: string }>()
  const locale = resolveSiteLocale(params?.locale)

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section (première impression) */}
      <Hero />

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
