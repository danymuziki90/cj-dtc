'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Breadcrumbs from '../../../components/Breadcrumbs'

interface Formation {
  id: number
  title: string
  slug: string
  description: string
  objectifs?: string
  duree?: string
  modules?: string
  methodes?: string
  certification?: string
  categorie?: string
  statut: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

function normalizeText(value?: string | null) {
  if (!value) return ''
  return value.trim()
}

function summarize(value?: string | null, max = 170) {
  const text = normalizeText(value)
  if (!text) return 'Programme detaille a venir. Contactez CJ DTC pour les informations de la prochaine cohorte.'
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}...`
}

function modulesLabel(value?: string | null) {
  const text = normalizeText(value)
  if (!text) return 'Modules a confirmer'

  const numeric = Number(text)
  if (!Number.isNaN(numeric) && numeric > 0) {
    return `${numeric} modules`
  }

  const byComma = text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (byComma.length >= 2) {
    return `${byComma.length} modules`
  }

  return text
}

export default function FormationsPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'

  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Toutes')

  useEffect(() => {
    fetchFormations()
  }, [])

  async function fetchFormations() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/formations', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des formations')
      }

      const data = (await response.json()) as Formation[]
      const publishedFormations = data.filter((f) => f.statut === 'publie')
      setFormations(publishedFormations)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(
        formations
          .map((f) => normalizeText(f.categorie))
          .filter(Boolean)
      )
    )
    return ['Toutes', ...values]
  }, [formations])

  const filteredFormations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return formations.filter((formation) => {
      const categoryMatch =
        activeCategory === 'Toutes' || normalizeText(formation.categorie) === activeCategory

      if (!categoryMatch) return false
      if (!query) return true

      const content = `${formation.title} ${formation.description} ${formation.categorie || ''}`.toLowerCase()
      return content.includes(query)
    })
  }, [formations, search, activeCategory])

  const highlightedCount = filteredFormations.length

  if (loading) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Formations' }]} />
          <div className="rounded-3xl bg-gradient-to-r from-cjblue to-[#0B3A8E] p-8 text-white shadow-xl">
            <div className="h-7 w-56 animate-pulse rounded bg-white/30" />
            <div className="mt-4 h-4 w-80 animate-pulse rounded bg-white/20" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-white/20" />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-7 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-11/12 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-8/12 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Formations' }]} />
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-red-800">Impossible de charger les formations</h1>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchFormations}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
            >
              Reessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Formations' }]} />

        <section className="relative overflow-hidden rounded-3xl border border-[#0B3A8E]/20 bg-gradient-to-br from-cjblue via-[#0B3A8E] to-[#001B47] p-8 text-white shadow-2xl sm:p-10 lg:p-12">
          <div className="absolute -right-16 -top-14 h-52 w-52 rounded-full bg-cjred/25 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              Catalogue professionnel
            </span>

            <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Nos formations certifiantes
            </h1>

            <p className="mt-4 max-w-3xl text-base text-blue-100 sm:text-lg">
              Des parcours structures, pratiques et aligns au marche pour accelerer votre employabilite.
              Choisissez la formation qui correspond a votre objectif professionnel.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-blue-100">Formations publiees</p>
                <p className="text-xl font-bold text-white">{formations.length}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-blue-100">Resultats filtres</p>
                <p className="text-xl font-bold text-white">{highlightedCount}</p>
              </div>
              <div className="rounded-2xl border border-cjred/50 bg-cjred/20 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-red-100">Accompagnement</p>
                <p className="text-xl font-bold text-white">CJ DTC</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <label htmlFor="formation-search" className="mb-2 block text-sm font-semibold text-slate-700">
                Rechercher une formation
              </label>
              <input
                id="formation-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ex: leadership, RH, insertion..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none ring-cjblue/20 transition focus:border-cjblue focus:ring-4"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = activeCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'border-cjblue bg-cjblue text-white shadow-md'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-cjblue hover:text-cjblue'
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {filteredFormations.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-cjblue">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-cjblue">Aucune formation trouvee</h2>
            <p className="mt-2 text-slate-600">
              Essaie un autre mot-cle ou change la categorie selectionnee.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveCategory('Toutes')
              }}
              className="mt-5 rounded-xl bg-cjred px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
            >
              Reinitialiser les filtres
            </button>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            {filteredFormations.map((formation) => (
              <article
                key={formation.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cjblue via-[#0B3A8E] to-cjred" />

                {formation.imageUrl ? (
                  <div
                    className="h-36 w-full bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(90deg, rgba(0,45,114,0.65), rgba(227,6,19,0.35)), url('${formation.imageUrl}')` }}
                  />
                ) : (
                  <div className="h-36 w-full bg-gradient-to-br from-cjblue via-[#0B3A8E] to-[#001B47]" />
                )}

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cjblue/10 px-3 py-1 text-xs font-semibold text-cjblue">
                      {formation.categorie || 'Formation'}
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-cjred">
                      {formation.certification || 'Certification incluse'}
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold leading-tight text-cjblue">{formation.title}</h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">{summarize(formation.description)}</p>

                  <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duree</dt>
                      <dd className="mt-1 font-semibold text-cjblue">{normalizeText(formation.duree) || 'A confirmer'}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modules</dt>
                      <dd className="mt-1 font-semibold text-cjblue">{modulesLabel(formation.modules)}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Methodes</dt>
                      <dd className="mt-1 font-semibold text-cjblue">{normalizeText(formation.methodes) || 'Pratique + coaching'}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/${locale}/formations/${formation.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-cjblue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B3A8E]"
                    >
                      Voir le detail
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <Link
                      href={`/${locale}/contact`}
                      className="inline-flex items-center rounded-xl border border-cjred/40 px-4 py-2.5 text-sm font-semibold text-cjred transition hover:bg-red-50"
                    >
                      Demander un conseil
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-10 rounded-3xl border border-cjblue/15 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cjred">Parcours sur mesure</p>
              <h2 className="mt-2 text-3xl font-bold text-cjblue">Besoin d'un accompagnement pour choisir ?</h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Notre equipe vous aide a selectionner la meilleure formation selon votre profil et vos objectifs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/contact`}
                className="rounded-xl bg-cjred px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Parler a un conseiller
              </Link>
              <Link
                href={`/${locale}/programmes`}
                className="rounded-xl border border-cjblue px-6 py-3 text-sm font-semibold text-cjblue transition hover:bg-cjblue hover:text-white"
              >
                Voir les programmes
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
