'use client'

import { publicMessages } from '@/lib/i18n/public-messages'

interface WhyChooseUsProps {
  locale: string
}

export default function WhyChooseUs({ locale }: WhyChooseUsProps) {
  const isFr = locale === 'fr'
  const t = publicMessages.home[locale as keyof typeof publicMessages.home] || publicMessages.home.fr

  return (
    <section className="bg-white py-20 sm:py-24 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full border border-[var(--cj-blue)]/20 bg-[var(--cj-blue-50)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-blue)] mb-4">
            {t.whyChooseBadge}
          </span>
          <h2 className="text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl font-montserrat leading-tight">
            {t.whyChooseTitlePrefix}
            <span className="text-[var(--cj-blue)]">{t.whyChooseTitleHighlight}</span>
            {t.whyChooseTitleSuffix}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 font-opensans leading-relaxed">
            {t.whyChooseDescription}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {t.whyChooseCards.map((card, index) => {
            const accents = [
              { border: 'border-t-[var(--cj-blue)]', icon: '🎓' },
              { border: 'border-t-blue-400', icon: '🤝' },
              { border: 'border-t-[var(--cj-red)]', icon: '🌍' },
              { border: 'border-t-emerald-500', icon: '🚀' },
            ]
            const { border, icon } = accents[index]

            return (
              <article
                key={card.title}
                className={`group rounded-2xl border border-slate-200 border-t-4 ${border} bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-montserrat">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 font-opensans">{card.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-8 border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-2xl font-black text-[var(--cj-blue)] font-montserrat">
                      {['100%', '1:1', '10+', '85%'][index]}
                    </p>
                    <p className="text-[10px] text-slate-500 font-opensans uppercase tracking-wider">{card.stats[0]}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[var(--cj-blue)] font-montserrat">
                      {isFr 
                        ? ['Terrain', 'Suivi', 'Région', 'Débouchés'][index] 
                        : ['Hands-on', 'Coaching', 'Region', 'Outcomes'][index]}
                    </p>
                    <p className="text-[10px] text-slate-500 font-opensans uppercase tracking-wider">{card.stats[1]}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
