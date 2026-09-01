'use client'

import TestimonialsSection from '@/components/TestimonialsSection'

interface TestimonialsAndResultsProps {
  locale: string
}

export default function TestimonialsAndResults({ locale }: TestimonialsAndResultsProps) {
  const isFr = locale === 'fr'

  return (
    <>
      {/* ── Bloc Résultats ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-8 sm:py-10 lg:py-12 text-white relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute inset-0 z-0 opacity-15">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-96 h-96 rounded-full bg-[var(--cj-red)]/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[var(--cj-blue)]/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200 mb-3">
              {isFr ? "Mesure d'impact" : 'Impact Metrics'}
            </span>
            <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl font-montserrat">
              {isFr ? 'Des résultats réels et vérifiables.' : 'Real and verifiable results.'}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-300 font-opensans leading-relaxed">
              {isFr
                ? "Notre modèle pédagogique combine théorie et immersion terrain pour des indicateurs d'insertion et de réussite concrets."
                : 'Our educational model combines theory and field immersion for concrete placement and success indicators.'}
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '98%', label: isFr ? 'Taux de satisfaction' : 'Satisfaction rate', desc: isFr ? 'Évalué par nos apprenants à la fin de leur cursus.' : 'Rated by our learners at the end of their path.' },
              { value: '85%', label: isFr ? 'Taux d’insertion' : 'Placement rate', desc: isFr ? 'De nos diplômés en poste dans les 6 mois.' : 'Of our graduates in jobs within 6 months.' },
              { value: '10+', label: isFr ? 'Pays d’impact' : 'Impacted countries', desc: isFr ? 'Une présence active à travers toute l’Afrique.' : 'Active presence across the African continent.' },
              { value: '50+', label: isFr ? 'Promotions certifiées' : 'Certified cohorts', desc: isFr ? 'Sessions réalisées avec évaluation rigoureuse.' : 'Sessions completed with rigorous evaluation.' },
            ].map((stat) => (
              <div key={stat.label} className="group rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7 transition duration-500 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1.5 shadow-xl">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-montserrat group-hover:text-[var(--cj-red)] transition-colors">{stat.value}</p>
                <p className="mt-3 text-base sm:text-lg font-bold text-[var(--cj-blue-300)] font-montserrat">{stat.label}</p>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-opensans leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Témoignages ─────────────────────────────────────────────── */}
      <TestimonialsSection locale={locale} />
    </>
  )
}
