'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Award, BookOpen, CalendarDays, Filter,
  SearchIcon, Sparkle, TrendingUp, Users, XIcon,
} from 'lucide-react'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import type { Formation, FormationCatalogFilters } from '@/lib/types/formation'
import {
  calculateCatalogStats, filterFormations,
  getPublishedFormations, sortFormations,
} from '@/lib/formations/catalog'
import CategoryFilter    from '@/components/formations/CategoryFilter'
import FilterPanel       from '@/components/formations/FilterPanel'
import FormationCard     from '@/components/formations/FormationCard'
import FormationFAQ      from '@/components/formations/FormationFAQ'
import FormationGrid     from '@/components/formations/FormationGrid'
import FormationGuidance from '@/components/formations/FormationGuidance'
import FormationStats    from '@/components/formations/FormationStats'
import HowToRegister     from '@/components/formations/HowToRegister'
import SessionsHub       from '@/components/formations/SessionsHub'

export default function FormationsPage() {
  const params = useParams()
  const locale = resolveSiteLocale(params?.locale as string | undefined)
  const isFr   = locale === 'fr'

  /* ── state ── */
  const [formations, setFormations]   = useState<Formation[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState<FormationCatalogFilters>({
    search: '', category: 'all', level: 'all', format: 'all',
  })
  const [sortBy, setSortBy] = useState<
    'popular'|'price-low'|'price-high'|'rating'|'newest'|'alphabetical'
  >('popular')

  /* ── data ── */
  useEffect(() => {
    let alive = true
    setIsLoading(true)
    fetch('/api/formations')
      .then(r => r.json())
      .then(d => { if (alive) setFormations(getPublishedFormations(d.formations ?? [])) })
      .catch(console.error)
      .finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [])

  /* ── derived ── */
  const filtered  = useMemo(() => sortFormations(filterFormations(formations, filters), sortBy), [formations, filters, sortBy])
  const stats     = useMemo(() => calculateCatalogStats(formations), [formations])
  const catCounts = useMemo(() => {
    const c: Record<string, number> = {}
    formations.forEach(f => { const k = f.categorie ?? 'autre'; c[k] = (c[k] ?? 0) + 1 })
    return c
  }, [formations])
  const featured  = useMemo(() => formations.filter(f => f.featured).slice(0, 3), [formations])
  const hasActiveFilters = !!filters.search || filters.category !== 'all' || filters.level !== 'all' || filters.format !== 'all'

  const sortOptions = [
    { id: 'popular',      name: isFr ? 'PlusIcon populaire'   : 'Most popular'   },
    { id: 'price-low',    name: isFr ? 'Prix croissant'   : 'Price low–high' },
    { id: 'price-high',   name: isFr ? 'Prix décroissant' : 'Price high–low' },
    { id: 'rating',       name: isFr ? 'Mieux noté'       : 'Top rated'      },
    { id: 'newest',       name: isFr ? 'PlusIcon récent'      : 'Newest'         },
    { id: 'alphabetical', name: isFr ? 'Alphabétique'     : 'A – Z'          },
  ]

  /* ── render ── */
  return (
    <div className="min-h-screen bg-slate-50">

      <header className="hero-bg-unified">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-100 mb-6">
            {isFr ? 'Catalogue officiel' : 'Official catalog'} · CJ Development Training Center
          </span>
          <h1 className="hero-title-unified mb-6">
            {isFr ? 'Formations' : 'Training Programs'}
            <span className="block">
              {isFr ? '& Sessions ouvertes' : '& Open Sessions'}
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-blue-100 mb-10">
            {isFr
              ? 'Découvrez nos programmes certifiants et réservez directement votre place dans une session disponible. Tout au même endroit.'
              : 'Explore our certified programs and book your spot in an available session — all in one place.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
            <a href="#catalogue"
              className="rounded-xl bg-[var(--cj-red)] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-700">
              {isFr ? 'Voir les formations' : 'Browse programs'}
            </a>
            <a href="#sessions"
              className="rounded-xl border-2 border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <CalendarDays className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
              {isFr ? 'Sessions ouvertes' : 'Open sessions'}
            </a>
          </div>
          <FormationStats stats={stats} />
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48 C360 0 1080 0 1440 48 L1440 48 L0 48Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </header>

      {/* ═══ PUBLIC CIBLES ═══ */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              {isFr ? 'Une formation pour chaque ambition' : 'A program for every ambition'}
            </h2>
            <p className="text-base text-slate-600">
              {isFr
                ? "Nos programmes s'adressent à tous les profils : étudiants, professionnels, managers, entrepreneurs, entreprises et institutions."
                : 'Our programs serve all profiles: students, professionals, managers, entrepreneurs, businesses and institutions.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              { icon: BookOpen,   color: 'bg-blue-100 text-[var(--cj-blue)]', label: isFr ? 'Étudiants'      : 'Students'      },
              { icon: Users,      color: 'bg-green-100 text-green-700',        label: isFr ? 'Professionnels' : 'Professionals' },
              { icon: TrendingUp, color: 'bg-purple-100 text-purple-700',      label: isFr ? 'Entrepreneurs'  : 'Entrepreneurs' },
              { icon: Award,      color: 'bg-orange-100 text-orange-700',      label: isFr ? 'Organisations'  : 'Organizations' },
            ] as {icon: any; color: string; label: string}[]).map(({ icon: Icon, color, label }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FORMATIONS VEDETTES ═══ */}
      {featured.length > 0 && (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--cj-blue)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white mb-3">
                <Sparkle className="h-3.5 w-3.5" />
                {isFr ? 'Programmes phares' : 'Featured programs'}
              </span>
              <h2 className="text-3xl font-black text-slate-900">
                {isFr ? 'Nos formations vedettes' : 'Our featured trainings'}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map(f => <FormationCard key={f.id} formation={f} locale={locale} featured />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CATALOGUE COMPLET ═══ */}
      <section id="catalogue" className="scroll-mt-20 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900">
              {isFr ? 'Catalogue complet' : 'Full catalog'}
            </h2>
            <p className="mt-2 text-base text-slate-600">
              {isFr ? 'Recherchez, filtrez et trouvez le programme qui vous correspond.' : 'SearchIcon, filter and find the program that matches your goals.'}
            </p>
          </div>

          {/* SearchIcon + sort */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={filters.search || ''}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder={isFr ? 'Rechercher une formation…' : 'SearchIcon a program…'}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2.5 text-sm focus:border-[var(--cj-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--cj-blue)]/20"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(f => ({ ...f, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowMobileFilters(v => !v)}
              className={`lg:hidden flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${showMobileFilters ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]' : 'border-slate-200 text-slate-600'}`}
            >
              <Filter className="h-4 w-4" />
              {isFr ? 'Filtres' : 'Filters'}
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[var(--cj-blue)]" />}
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-[var(--cj-blue)] focus:outline-none cursor-pointer"
            >
              {sortOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          {/* Count + reset */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{filtered.length}</span>
              {' '}{isFr ? 'formation(s)' : 'program(s)'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ search: '', category: 'all', level: 'all', format: 'all' })}
                className="text-xs text-[var(--cj-blue)] hover:underline"
              >
                {isFr ? 'Réinitialiser' : 'Reset'}
              </button>
            )}
          </div>

          {/* Sidebar + grid */}
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block space-y-6">
              <CategoryFilter
                selectedCategory={filters.category || 'all'}
                onCategoryChange={cat => setFilters(f => ({ ...f, category: cat }))}
                counts={catCounts}
              />
              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </aside>
            <div className="lg:col-span-3">
              <FormationGrid
                formations={filtered}
                locale={locale}
                isLoading={isLoading}
                emptyMessage={isFr ? 'Aucune formation ne correspond à vos critères.' : 'No programs match your criteria.'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filters overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">{isFr ? 'Filtres' : 'Filters'}</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <XIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-6">
              <CategoryFilter
                selectedCategory={filters.category || 'all'}
                onCategoryChange={cat => setFilters(f => ({ ...f, category: cat }))}
                counts={catCounts}
              />
              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </div>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full rounded-xl bg-[var(--cj-blue)] py-3 text-sm font-bold text-white"
            >
              {isFr ? 'Appliquer' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ SESSIONS OUVERTES ═══ */}
      <SessionsHub locale={locale} />

      {/* ═══ PARCOURS INSCRIPTION ═══ */}
      <HowToRegister locale={locale} />

      {/* ═══ ORIENTATION ═══ */}
      <FormationGuidance locale={locale} />

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">
              {isFr ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
            <p className="mt-2 text-base text-slate-600">
              {isFr
                ? "Tout ce qu'il faut savoir sur nos formations et les inscriptions."
                : 'Everything you need to know about our programs and registration.'}
            </p>
          </div>
          <FormationFAQ />
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-gradient-to-r from-[var(--cj-blue)] to-[#0B3A8E] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            {isFr ? 'Prêt à transformer votre carrière ?' : 'Ready to transform your career?'}
          </h2>
          <p className="text-lg text-blue-100 mb-10">
            {isFr
              ? 'Rejoignez les milliers de professionnels formés par CJ Development Training Center.'
              : 'Join the thousands of professionals trained by CJ Development Training Center.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#sessions"
              className="rounded-xl bg-[var(--cj-red)] px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:bg-red-700">
              {isFr ? 'Voir les sessions ouvertes' : 'See open sessions'}
            </a>
            <Link href={`/${locale}/contact`}
              className="rounded-xl border-2 border-white/50 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
              {isFr ? 'Parler à un conseiller' : 'Talk to an advisor'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
