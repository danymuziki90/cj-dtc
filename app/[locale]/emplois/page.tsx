'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import UnifiedHero from '@/components/ui/UnifiedHero'
import Breadcrumbs from '@/components/Breadcrumbs'
import type { HeroSectionData } from '@/lib/hero/types'
import {
  Search, MapPin, Briefcase, Calendar, Building2, Globe,
  ChevronLeft, ChevronRight, Filter, X, SlidersHorizontal, ArrowRight,
  Clock, Loader2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type EmploiMeta = {
  company: string; contractType: string; location: string; remote: string
  domain: string; educationLevel: string; experience: string; salary: string
  positions: number; deadline: string; applyUrl: string; contactEmail: string
  excerpt: string; status: string
}
type Emploi = {
  id: string; title: string; published: boolean
  publicationDate: string; imageDataUrl: string | null
  tags: string[]; metadata: EmploiMeta
}
type Filters = { locations: string[]; contracts: string[]; domains: string[] }
type Pagination = { page: number; pageSize: number; total: number; pageCount: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'medium' }).format(new Date(iso))
}

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

const REMOTE_LABELS: Record<string, string> = { oui: 'Télétravail', hybride: 'Hybride', non: '' }
const SORT_OPTIONS = [
  { value: 'recent',   label: 'Plus récentes' },
  { value: 'deadline', label: 'Date limite' },
  { value: 'alpha',    label: 'Alphabétique' },
]

// ─── Card component ───────────────────────────────────────────────────────────
function EmploiCard({ e, locale }: { e: Emploi; locale: string }) {
  const days = e.metadata.deadline ? daysUntil(e.metadata.deadline) : null
  const urgent = days !== null && days <= 7 && days >= 0
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Image or gradient header */}
      <div className="relative h-40 bg-gradient-to-br from-[var(--cj-blue)] to-blue-700 overflow-hidden">
        {e.imageDataUrl
          ? <img src={e.imageDataUrl} alt={e.title} className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
          : <div className="absolute inset-0 flex items-center justify-center opacity-20"><Briefcase className="h-16 w-16 text-white" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {e.metadata.contractType && (
            <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-0.5 text-[11px] font-bold text-white">
              {e.metadata.contractType}
            </span>
          )}
          {REMOTE_LABELS[e.metadata.remote] && (
            <span className="rounded-full bg-purple-500/80 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-white">
              {REMOTE_LABELS[e.metadata.remote]}
            </span>
          )}
          {urgent && (
            <span className="rounded-full bg-red-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-white animate-pulse">
              ⚡ Expire bientôt
            </span>
          )}
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div>
          <h2 className="font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-[var(--cj-blue)] transition-colors">
            {e.title}
          </h2>
          {e.metadata.company && (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />{e.metadata.company}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          {e.metadata.location && (
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--cj-red)]" />{e.metadata.location}</span>
          )}
          {e.metadata.domain && (
            <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />{e.metadata.domain}</span>
          )}
          {e.metadata.deadline && (
            <span className={`flex items-center gap-1.5 ${urgent ? 'text-red-600 font-semibold' : ''}`}>
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Limite : {formatDate(e.metadata.deadline, locale)}
              {days !== null && days >= 0 && <span className="ml-1 text-[10px]">({days}j)</span>}
            </span>
          )}
        </div>
        {e.metadata.excerpt && (
          <p className="text-xs leading-relaxed text-slate-600 line-clamp-2 flex-1">{e.metadata.excerpt}</p>
        )}
        <Link href={`/${locale}/emplois/${e.id}`}
          className="mt-auto inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-900 transition-colors group/btn">
          Voir l'offre <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function EmploisContent() {
  const params   = useParams<{ locale: string }>()
  const locale   = resolveSiteLocale(params?.locale)
  const spRaw    = useSearchParams()

  const [emplois, setEmplois]       = useState<Emploi[]>([])
  const [filters, setFilters]       = useState<Filters>({ locations: [], contracts: [], domains: [] })
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 9, total: 0, pageCount: 1 })
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [location, setLocation]     = useState('')
  const [contractType, setContract] = useState('')
  const [domain, setDomain]         = useState('')
  const [remote, setRemote]         = useState('')
  const [sort, setSort]             = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null)

  useEffect(() => {
    fetch('/api/hero-images?pageKey=emplois')
      .then((r) => r.json())
      .then((data) => setHeroData(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search.trim()); setPage(1) }, 250)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async (p: number) => {
    setLoading(true); setError(null)
    const qs = new URLSearchParams({ page: String(p), pageSize: '9', sort })
    if (debouncedSearch) qs.set('search', debouncedSearch)
    if (location)     qs.set('location', location)
    if (contractType) qs.set('contractType', contractType)
    if (domain)       qs.set('domain', domain)
    if (remote)       qs.set('remote', remote)
    try {
      const res = await fetch(`/api/emplois?${qs}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Chargement impossible.')
      const data = await res.json()
      setEmplois(data.emplois || [])
      setFilters(data.filters || { locations: [], contracts: [], domains: [] })
      setPagination(data.pagination)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [debouncedSearch, location, contractType, domain, remote, sort])

  useEffect(() => { load(page) }, [page, debouncedSearch, location, contractType, domain, remote, sort])

  function resetFilters() {
    setSearch(''); setDebounced(''); setLocation(''); setContract('')
    setDomain(''); setRemote(''); setSort('recent'); setPage(1)
  }

  const hasActiveFilters = debouncedSearch || location || contractType || domain || remote

  const selectCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--cj-blue)] focus:ring-1 focus:ring-[var(--cj-blue)]'

  return (
    <div className="bg-slate-50 min-h-screen">
      <UnifiedHero
        eyebrow="Offres d'emploi"
        title={locale === 'fr' ? 'Opportunités de carrière' : 'Career Opportunities'}
        description={locale === 'fr'
          ? "Découvrez les offres d'emploi, stages et opportunités proposées par notre réseau de partenaires."
          : 'Explore job openings, internships and opportunities from our partner network.'}
        image="/img/actu.jpeg"
        compact
        heroData={heroData}
        locale={locale}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Offres d\'emploi' }
        ]} />

        {/* ── Search + Filters ── */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Poste, entreprise, mot-clé…"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--cj-blue)] focus:ring-1 focus:ring-[var(--cj-blue)]" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${showFilters ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <SlidersHorizontal className="h-4 w-4" /> Filtres {hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-[var(--cj-red)]" />}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[var(--cj-blue)]">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {showFilters && (
            <div className="grid gap-3 pt-3 border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Localisation</label>
                <select className={selectCls} value={location} onChange={e => { setLocation(e.target.value); setPage(1) }}>
                  <option value="">Toutes</option>
                  {filters.locations.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Type de contrat</label>
                <select className={selectCls} value={contractType} onChange={e => { setContract(e.target.value); setPage(1) }}>
                  <option value="">Tous</option>
                  {filters.contracts.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Secteur</label>
                <select className={selectCls} value={domain} onChange={e => { setDomain(e.target.value); setPage(1) }}>
                  <option value="">Tous</option>
                  {filters.domains.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wide">Télétravail</label>
                <select className={selectCls} value={remote} onChange={e => { setRemote(e.target.value); setPage(1) }}>
                  <option value="">Tous</option>
                  <option value="oui">Télétravail</option>
                  <option value="hybride">Hybride</option>
                  <option value="non">Présentiel</option>
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--cj-blue)] hover:underline">
              <X className="h-3.5 w-3.5" /> Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* ── Results ── */}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
            <Loader2 className="h-6 w-6 animate-spin" /> Chargement des offres…
          </div>
        ) : emplois.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h2 className="text-xl font-bold text-slate-700">Aucune offre disponible</h2>
            <p className="mt-2 text-sm text-slate-500">Revenez prochainement ou modifiez vos filtres.</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-4 rounded-xl bg-[var(--cj-blue)] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-900">
                Voir toutes les offres
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {emplois.map(e => <EmploiCard key={e.id} e={e} locale={locale} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination.pageCount > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(pagination.pageCount, 7) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${n === page ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {n}
              </button>
            ))}
            <button disabled={page >= pagination.pageCount} onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EmploisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
      <EmploisContent />
    </Suspense>
  )
}
