'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Award, BookOpen, CalendarDays, Search, Sparkle, TrendingUp, Users, XIcon } from 'lucide-react'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import type { Formation, FormationCatalogFilters } from '@/lib/types/formation'
import { calculateCatalogStats, getPublishedFormations, filterFormations, sortFormations, normalizeSearchText } from '@/lib/formations/catalog'
import { FORMATION_CATEGORIES } from '@/lib/types/formation'
import FormationCard     from '@/components/formations/FormationCard'
import FormationFAQ      from '@/components/formations/FormationFAQ'
import FormationGuidance from '@/components/formations/FormationGuidance'
import FormationStats    from '@/components/formations/FormationStats'
import HowToRegister     from '@/components/formations/HowToRegister'
import SessionsHub       from '@/components/formations/SessionsHub'
import FormationCardSkeleton from '@/components/formations/FormationCardSkeleton'
import { StudentAuthProvider } from '@/lib/auth/StudentAuthContext'

export default function FormationsPage() {
  const params = useParams()
  const locale = resolveSiteLocale(params?.locale as string | undefined)
  const isFr   = locale === 'fr'

  /* ── state ── */
  const [formations, setFormations]   = useState<Formation[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'alphabetical' | 'rating'>('popular')

  /* ── data ── */
  useEffect(() => {
    let alive = true
    setIsLoading(true)
    fetch('/api/formations', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (alive) setFormations(getPublishedFormations(d.formations ?? [])) })
      .catch(console.error)
      .finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [])

  /* ── derived ── */
  const stats    = useMemo(() => calculateCatalogStats(formations), [formations])
  const featured = useMemo(() => formations.filter(f => f.featured).slice(0, 3), [formations])

  // Full catalog with filters
  const filters: FormationCatalogFilters = useMemo(() => ({
    search: searchQuery,
    category: selectedCategory,
  }), [searchQuery, selectedCategory])

  const filteredFormations = useMemo(() => {
    const filtered = filterFormations(formations, filters)
    return sortFormations(filtered, sortBy)
  }, [formations, filters, sortBy])

  // Categories with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    formations.forEach(f => {
      const cat = f.categorie || 'autre'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [formations])

  // Only show categories that have formations
  const activeCategories = useMemo(() => {
    return FORMATION_CATEGORIES.filter(c => (categoryCounts[c.id] || 0) > 0)
  }, [categoryCounts])

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all'

  /* ── render ── */
  return (
    <StudentAuthProvider>
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero Section floating card */}
        <section className="cj-hero-card text-center mb-6">
          <div className="relative z-10 flex flex-col items-center">
            <span className="cj-eyebrow-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
              {isFr ? 'Catalogue officiel' : 'Official catalog'} · CJ Development
            </span>
            <h1 className="cj-hero-title mb-3 max-w-4xl">
              {isFr ? 'Formations' : 'Training Programs'}
              <span className="block text-white/80">
                {isFr ? '& Sessions ouvertes' : '& Open Sessions'}
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white sm:text-base mb-5">
              {isFr
                ? 'Découvrez nos programmes certifiants et réservez directement votre place dans une session disponible. Tout au même endroit.'
                : 'Explore our certified programs and book your spot in an available session — all in one place.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <a href="#sessions" className="cj-btn-primary">
                <CalendarDays className="w-4 h-4" />
                {isFr ? 'Voir les sessions ouvertes' : 'Browse open sessions'}
              </a>
              <a href="#catalogue" className="cj-btn-secondary-dark">
                <BookOpen className="w-4 h-4" />
                {isFr ? 'Explorer le catalogue' : 'Browse catalog'}
              </a>
            </div>
            <div className="w-full border-t border-white/10 pt-5 mt-1">
              <FormationStats stats={stats} />
            </div>
          </div>
        </section>

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
      <section id="catalogue" className="scroll-mt-20 bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cj-blue)]/20 bg-[var(--cj-blue)]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--cj-blue)] mb-3">
              <BookOpen className="h-3.5 w-3.5" />
              {isFr ? 'Catalogue complet' : 'Full catalog'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
              {isFr ? 'Toutes nos formations' : 'All our programs'}
            </h2>
            <p className="mt-2 max-w-2xl mx-auto text-base text-slate-600">
              {isFr
                ? 'Parcourez notre catalogue complet de formations certifiantes et trouvez le programme qui correspond à vos objectifs.'
                : 'Browse our complete catalog of certified programs and find the one that matches your goals.'}
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isFr ? 'Rechercher une formation...' : 'Search a program...'}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[var(--cj-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--cj-blue)]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category chips + Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white shadow'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)]'
                }`}
              >
                {isFr ? 'Toutes' : 'All'} ({formations.length})
              </button>
              {activeCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white shadow'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)]'
                  }`}
                >
                  {cat.name} ({categoryCounts[cat.id] || 0})
                </button>
              ))}

              {/* Sort & Reset */}
              <div className="ml-auto flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:border-[var(--cj-blue)] focus:outline-none"
                >
                  <option value="popular">{isFr ? 'Plus populaires' : 'Most popular'}</option>
                  <option value="newest">{isFr ? 'Plus récentes' : 'Newest'}</option>
                  <option value="alphabetical">{isFr ? 'A → Z' : 'A → Z'}</option>
                  <option value="rating">{isFr ? 'Mieux notées' : 'Top rated'}</option>
                </select>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                    {isFr ? 'Réinitialiser' : 'Reset'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results count */}
          {!isLoading && (
            <p className="mb-6 text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{filteredFormations.length}</span>
              {' '}{isFr ? 'formation(s) trouvée(s)' : 'program(s) found'}
            </p>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <FormationCardSkeleton key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredFormations.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-14 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-[var(--cj-blue)]">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--cj-blue)] mb-2">
                {isFr ? 'Aucune formation trouvée' : 'No program found'}
              </h3>
              <p className="text-slate-500 mb-5">
                {isFr
                  ? 'Ajustez vos critères de recherche ou de filtres.'
                  : 'Adjust your search criteria or filters.'}
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
                className="rounded-xl bg-[var(--cj-red)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                {isFr ? 'Voir toutes les formations' : 'View all programs'}
              </button>
            </div>
          )}

          {/* Grid */}
          {!isLoading && filteredFormations.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.map(f => (
                <FormationCard key={f.id} formation={f} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>

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
      <section className="cj-cta-banner mt-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-white sm:text-4xl mb-4 font-montserrat">
            {isFr ? 'Prêt à transformer votre carrière ?' : 'Ready to transform your career?'}
          </h2>
          <p className="text-base text-blue-100 mb-8 font-opensans leading-relaxed">
            {isFr
              ? 'Rejoignez les milliers de professionnels formés par CJ Development Training Center.'
              : 'Join the thousands of professionals trained by CJ Development Training Center.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#catalogue" className="cj-btn-primary">
              {isFr ? 'Explorer le catalogue' : 'Browse catalog'}
            </a>
            <Link href={`/${locale}/contact`} className="cj-btn-secondary-dark">
              {isFr ? 'Parler à un conseiller' : 'Talk to an advisor'}
            </Link>
          </div>
        </div>
      </section>

      </div>
    </div>
    </StudentAuthProvider>
  )
}
