'use client'

import Link from 'next/link'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type HomeSectionsProps = {
  locale?: string
}

const copy = publicMessages.homeSections

// Valeurs institutionnelles — fixes, bilingues inline
const valuesData = {
  fr: [
    {
      icon: '◆',
      title: 'Excellence opérationnelle',
      description:
        'Chaque programme est conçu pour produire des compétences directement applicables sur le terrain, pas seulement des diplômes.',
    },
    {
      icon: '◆',
      title: 'Intégrité et rigueur',
      description:
        'Nous travaillons avec transparence, discipline et redevabilité dans chaque session et chaque interaction avec nos apprenants.',
    },
    {
      icon: '◆',
      title: 'Leadership utile',
      description:
        "Nos formations ciblent des profils capables de décider, d'agir et de faire avancer leurs équipes dans des contextes africains et globaux.",
    },
    {
      icon: '◆',
      title: 'Impact social mesurable',
      description:
        "Chaque promotion vise un résultat concret : insertion, promotion, création d'entreprise ou renforcement institutionnel.",
    },
  ],
  en: [
    {
      icon: '◆',
      title: 'Operational excellence',
      description:
        'Every program is designed to produce skills directly applicable on the ground — not just credentials.',
    },
    {
      icon: '◆',
      title: 'Integrity and rigor',
      description:
        'We work with transparency, discipline and accountability in every session and every interaction with our learners.',
    },
    {
      icon: '◆',
      title: 'Useful leadership',
      description:
        'Our programs target people who can decide, act and move their teams forward in African and global contexts.',
    },
    {
      icon: '◆',
      title: 'Measurable social impact',
      description:
        'Every cohort targets a concrete outcome: placement, promotion, business creation or institutional strengthening.',
    },
  ],
}

export default function HomeSections({ locale }: HomeSectionsProps) {
  const resolvedLocale = resolveSiteLocale(locale)
  const isFr = resolvedLocale === 'fr'
  const values = isFr ? valuesData.fr : valuesData.en

  return (
    <div className="w-full">
      {/* ── Valeurs institutionnelles ──────────────────────────────────── */}
      <section className="bg-slate-950 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">
              {isFr ? 'Ce qui nous guide' : 'What guides us'}
            </p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              {isFr ? 'Nos valeurs fondatrices' : 'Our founding values'}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-400">
              {isFr
                ? 'Un cadre de travail clair, professionnel et orienté résultats — cohérent avec les exigences du marché africain et international.'
                : 'A clear, professional and results-oriented framework — aligned with the demands of African and international markets.'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/8"
              >
                <span className="text-xs font-bold text-[var(--cj-red)]" aria-hidden="true">
                  {value.icon}
                </span>
                <h3 className="mt-4 text-base font-bold text-white">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
