'use client'

import { useState, useEffect } from 'react'
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
  const t = copy[resolvedLocale]
  const isFr = resolvedLocale === 'fr'
  const values = isFr ? valuesData.fr : valuesData.en

  const [dbTestimonials, setDbTestimonials] = useState<any[]>([])

  useEffect(() => {
    let active = true
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setDbTestimonials(data)
        }
      })
      .catch((err) => console.error('Error fetching testimonials:', err))
    return () => {
      active = false
    }
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const testimonialsList = dbTestimonials.length > 0
    ? dbTestimonials.map((item: any) => ({
        id: item.id,
        name: item.name,
        initials: getInitials(item.name),
        location: item.formation?.title ? `Formation ${item.formation.title}` : (item.location || (isFr ? 'Kinshasa, RDC' : 'Kinshasa, DRC')),
        quote: item.quote,
        title: item.title,
        rating: item.rating || 5,
        photoUrl: item.photoUrl,
      }))
    : t.testimonials

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

      {/* ── Témoignages ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">
              {isFr ? "Ils l'ont vécu" : 'Alumni voices'}
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              {t.testimonialsTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">{t.testimonialsDescription}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {testimonialsList.map((item: any, idx: number) => (
              <figure
                key={item.id || item.name || idx}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-7 shadow-sm flex flex-col justify-between"
              >
                {/* Guillemet décoratif */}
                <span
                  className="absolute right-6 top-5 text-5xl font-black leading-none text-[var(--cj-blue)]/10 select-none"
                  aria-hidden="true"
                >
                  "
                </span>

                <div>
                  <div className="mb-5 flex items-center gap-4">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="h-12 w-12 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cj-blue)] text-sm font-bold text-white shadow-sm">
                        {item.initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.location}</p>
                    </div>
                  </div>

                  {item.title && (
                    <h4 className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</h4>
                  )}

                  <blockquote className="text-sm leading-7 text-slate-700 italic">
                    « {item.quote} »
                  </blockquote>
                </div>

                <div className="mt-4 flex gap-0.5" aria-label={`${item.rating || 5} étoiles`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${
                        i < (item.rating || 5)
                          ? 'fill-[var(--cj-red)]'
                          : 'fill-slate-200'
                      }`}
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
