'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Clock3,
  MapPinIcon,
  Users,
  Monitor,
  Layers,
  Search,
  RotateCw,
  XIcon,
  Sparkle,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { StudentAuthProvider, useStudentAuth } from '@/lib/auth/StudentAuthContext'

export interface SessionItem {
  id: number
  formationId: number
  formation: {
    id: number
    title: string
    slug: string
    categorie?: string | null
    description?: string | null
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  maxParticipants: number
  currentParticipants: number
  price: number
  status: string
  description?: string | null
  objectives?: string | null
  imageUrl?: string | null
  adminMeta?: {
    customTitle?: string | null
    sessionType?: string | null
    durationLabel?: string | null
    paymentInfo?: string | null
    participationType?: string | null
    imageUrl?: string | null
    registrationDeadline?: string | null
  }
}

function formatDateRange(start: string, end: string) {
  if (!start) return 'À préciser'
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : null
  return endDate ? `${fmt.format(startDate)} – ${fmt.format(endDate)}` : fmt.format(startDate)
}

function getDurationDays(start: string, end: string) {
  if (!start || !end) return 1
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.ceil(diff / 86400000) + 1)
}

function normalizeFormat(format: string) {
  const v = (format || '').toLowerCase()
  if (v.includes('distanciel') || v.includes('ligne') || v.includes('online')) return 'en_ligne'
  if (v.includes('hybride')) return 'hybride'
  return 'presentiel'
}

const FORMAT_LABELS: Record<string, string> = {
  presentiel: 'Présentiel',
  en_ligne:   'En ligne',
  hybride:    'Hybride',
}

const FORMAT_ICONS = {
  presentiel: MapPinIcon,
  en_ligne:   Monitor,
  hybride:    Layers,
}

function SessionCard({ session: s }: { session: SessionItem }) {
  const router = useRouter()
  const { isLoggedIn } = useStudentAuth()

  const available = Math.max(0, s.maxParticipants - (s.currentParticipants || 0))
  const isFull = available <= 0 || ['complete', 'complet', 'full'].includes((s.status || '').toLowerCase())
  const fmt = normalizeFormat(s.format)
  const FormatIcon = FORMAT_ICONS[fmt as keyof typeof FORMAT_ICONS] ?? MapPinIcon
  const formatLabel = FORMAT_LABELS[fmt] ?? s.format
  const image = s.adminMeta?.imageUrl || s.imageUrl || s.formation?.description || '/logo.png'
  const title = s.adminMeta?.customTitle || s.formation?.title || `Session #${s.id}`
  const domainType = s.adminMeta?.sessionType || s.formation?.categorie || 'Session de formation'
  const days = getDurationDays(s.startDate, s.endDate)
  const durationText = s.adminMeta?.durationLabel || `${days} jour${days > 1 ? 's' : ''}`

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Accent top */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--cj-blue)] via-[#0B3A8E] to-[var(--cj-red)]" />

      {/* Image / Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex-shrink-0">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--cj-blue)] shadow-sm">
            {domainType}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
            <FormatIcon className="h-3 w-3" />
            {formatLabel}
          </span>
        </div>

        {/* Status Badge right */}
        <div className="absolute right-3 top-3 z-10">
          {isFull ? (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-white shadow">
              Complète
            </span>
          ) : (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow animate-pulse">
              Ouverte ({available} place{available > 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-extrabold leading-snug text-[var(--cj-blue)] line-clamp-2 mb-2">
          {title}
        </h3>

        {s.description && (
          <p className="text-xs leading-relaxed text-slate-600 line-clamp-2 mb-4">
            {s.description}
          </p>
        )}

        {/* Info Grid */}
        <dl className="grid grid-cols-2 gap-2 text-xs mb-5">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              Dates
            </dt>
            <dd className="mt-1 font-bold text-slate-800">
              {formatDateRange(s.startDate, s.endDate)}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Clock3 className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              Durée & Horaires
            </dt>
            <dd className="mt-1 font-bold text-slate-800 truncate">
              {durationText} {s.startTime ? `(${s.startTime})` : ''}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <MapPinIcon className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              Lieu
            </dt>
            <dd className="mt-1 font-bold text-slate-800 truncate">
              {s.location || 'À préciser'}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Users className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              Capacité
            </dt>
            <dd className="mt-1 font-bold text-slate-800">
              {available} / {s.maxParticipants} places libres
            </dd>
          </div>
        </dl>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-500 font-medium">
            <span>Inscrits : {s.currentParticipants || 0}/{s.maxParticipants}</span>
            <span>{Math.round(((s.currentParticipants || 0) / s.maxParticipants) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${isFull ? 'bg-slate-400' : available <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, Math.round(((s.currentParticipants || 0) / s.maxParticipants) * 100))}%` }}
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Statut</span>
            <p className="text-xs font-bold text-slate-800">{isFull ? 'Liste d\'attente' : 'Inscriptions ouvertes'}</p>
          </div>
          
          <button
            type="button"
            onClick={() => {
              const confirmUrl = `/espace-etudiants/confirm-inscription?sessionId=${s.id}&formationId=${s.formationId}`
              if (isLoggedIn) {
                router.push(confirmUrl)
              } else {
                router.push(`/fr/auth/student-login?next=${encodeURIComponent(confirmUrl)}`)
              }
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all shadow-md ${
              isFull
                ? 'bg-slate-700 text-white hover:bg-slate-800'
                : 'bg-[var(--cj-red)] text-white hover:bg-red-700 hover:shadow-lg'
            }`}
          >
            <span>{isFull ? "Rejoindre liste d'attente" : "S'inscrire"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

function MainSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [search, setSearch]     = useState('')
  const [formatFilter, setFormatFilter] = useState('all')

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch('/api/sessions', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('load_error'); return r.json() })
      .then((data: any) => {
        if (!alive) return
        const list: SessionItem[] = Array.isArray(data) ? data : (data?.sessions || [])
        // Exclude draft, archived, cancelled
        const valid = list.filter(s => !['brouillon', 'archive', 'annulee', 'cancelled', 'draft'].includes((s.status || '').toLowerCase().trim()))
        setSessions(valid)
      })
      .catch(() => { if (alive) setError('Impossible de charger les sessions. Veuillez réessayer.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      const title = (s.adminMeta?.customTitle || s.formation?.title || '').toLowerCase()
      const domain = (s.adminMeta?.sessionType || s.formation?.categorie || '').toLowerCase()
      const desc = (s.description || s.formation?.description || '').toLowerCase()
      const loc = (s.location || '').toLowerCase()
      const q = search.toLowerCase().trim()
      
      const matchSearch = !q || title.includes(q) || domain.includes(q) || desc.includes(q) || loc.includes(q)
      const matchFormat = formatFilter === 'all' || normalizeFormat(s.format) === formatFilter
      
      return matchSearch && matchFormat
    })
  }, [sessions, search, formatFilter])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* HERO CARD */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-8 text-white shadow-2xl border border-white/10 mb-10">
          <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-[rgba(227,6,19,0.2)] blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white mb-4">
              <Sparkle className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              Catalogue Officiel · Sessions Ouvertes
            </span>
            <h1 className="text-3xl font-black sm:text-5xl tracking-tight leading-tight text-white mb-4">
              Nos Sessions de Formation
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-white/80 max-w-2xl mb-6">
              Découvrez nos prochaines sessions de formation certifiantes. Réservez votre place directement et accédez à votre espace d'apprentissage.
            </p>
          </div>
        </section>

        {/* SEARCH & FILTERS BAR */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par domaine, titre, ville..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-[var(--cj-blue)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Format Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'Tous les formats' },
                { id: 'presentiel', label: 'Présentiel' },
                { id: 'en_ligne', label: 'En ligne' },
                { id: 'hybride', label: 'Hybride' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormatFilter(opt.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                    formatFilter === opt.id
                      ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white shadow'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {(search || formatFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setFormatFilter('all') }}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 ml-2"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS COUNT */}
        {!loading && !error && (
          <p className="mb-6 text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-900">{filtered.length}</span> session(s) ouverte(s) trouvée(s)
          </p>
        )}

        {/* LOADING SKELETONS */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-3xl" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {[...Array(4)].map((__, j) => <div key={j} className="h-12 bg-slate-100 rounded-xl" />)}
                  </div>
                  <div className="h-10 bg-slate-200 rounded-xl pt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
            <p className="font-semibold text-red-700 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
            >
              <RotateCw className="h-4 w-4" />
              Réessayer
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[var(--cj-blue)]">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Aucune session disponible
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Aucune session ne correspond à vos critères de recherche actuellement.
            </p>
            <button
              type="button"
              onClick={() => { setSearch(''); setFormatFilter('all') }}
              className="rounded-xl bg-[var(--cj-red)] px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow"
            >
              Voir toutes les sessions
            </button>
          </div>
        )}

        {/* SESSIONS GRID */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(s => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NosSessionsPage() {
  return (
    <StudentAuthProvider>
      <MainSessionsPage />
    </StudentAuthProvider>
  )
}
