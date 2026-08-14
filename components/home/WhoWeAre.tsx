'use client'

import Image from 'next/image'
import Link from 'next/link'

interface WhoWeAreProps {
  locale: string
}

export default function WhoWeAre({ locale }: WhoWeAreProps) {
  const isFr = locale === 'fr'

  const stats = [
    { value: '2018', label: isFr ? 'Année de création' : 'Founded' },
    { value: '8 500+', label: isFr ? 'Participants formés' : 'Trained participants' },
    { value: '10+', label: isFr ? 'Pays couverts' : 'Countries reached' },
    { value: '50+', label: isFr ? 'Promotions actives' : 'Active sessions' },
  ]

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          
          {/* Text Content */}
          <div className="space-y-6 relative z-10">
            <div>
              <span className="inline-flex items-center rounded-full bg-[var(--cj-blue)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-blue)] mb-3">
                {isFr ? 'Qui sommes-nous' : 'Who We Are'}
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl font-montserrat leading-tight">
                {isFr ? 'Révéler les talents pour bâtir' : 'Unleashing talents to build'}{' '}
                <span className="text-[var(--cj-red)]">
                  {isFr ? "l'Afrique de demain." : "tomorrow's Africa."}
                </span>
              </h2>
            </div>
            
            <div className="space-y-3 text-base sm:text-lg text-slate-600 font-opensans leading-relaxed">
              <p>
                {isFr 
                  ? "CJ Development Training Center est un pôle d'excellence dédié à la formation professionnelle continue, à l'accompagnement des dirigeants et à l'insertion professionnelle." 
                  : "CJ Development Training Center is a center of excellence dedicated to continuous professional training, executive coaching, and professional insertion."}
              </p>
              <p>
                {isFr
                  ? "Notre mission est de doter les entreprises, les institutions et les particuliers des compétences stratégiques nécessaires pour relever les défis de performance et d'innovation d'aujourd'hui."
                  : "Our mission is to equip companies, institutions, and individuals with the strategic skills necessary to tackle today's performance and innovation challenges."}
              </p>
            </div>

            <div className="pt-2">
              <Link 
                href={`/${locale}/about`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--cj-blue)] hover:text-[var(--cj-red)] transition-colors group"
              >
                {isFr ? 'Découvrir notre vision' : 'Discover our vision'}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Image & Stats */}
          <div className="relative lg:ml-auto w-full max-w-lg">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
              <Image 
                src="/img/Formation.jpeg" 
                alt="CJ Development Training"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 shadow-lg">
                  <p className="text-white font-bold font-montserrat text-base sm:text-lg">
                    {isFr ? "L'Excellence comme standard" : "Excellence as a standard"}
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm mt-1">
                    {isFr ? "Formations accréditées et reconnues." : "Accredited and recognized training."}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute -z-10 -bottom-6 -right-6 h-full w-full rounded-3xl border-2 border-[var(--cj-red)]/20" />
            <div className="absolute -z-10 -top-6 -left-6 h-32 w-32 rounded-full bg-[var(--cj-blue)]/10 blur-2xl" />
          </div>

        </div>

        {/* Stats Grid - "Notre Impact" */}
        <div className="mt-12 sm:mt-14 overflow-hidden rounded-3xl bg-[var(--cj-blue)] px-6 py-8 sm:px-8 sm:py-10 text-white shadow-xl relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(227,6,19,0.15),transparent_50%)] pointer-events-none" />
          <div className="relative z-10 grid grid-cols-2 gap-6 md:grid-cols-4 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-3xl sm:text-4xl font-black text-white font-montserrat transition-colors group-hover:text-blue-300">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 font-opensans">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
