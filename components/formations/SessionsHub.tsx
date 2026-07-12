'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, RotateCw, SlidersHorizontal, XIcon } from 'lucide-react'
import SessionCard, { type SessionItem } from './SessionCard'
import { inferProgramSessionType, type ProgramSessionType } from '@/lib/programmes/session-types'

type Props = {
  locale: 'fr' | 'en'
}

const TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  ALL:              { fr: 'Toutes',                en: 'All'              },
  MRH:              { fr: 'MRH',                   en: 'MRH'             },
  IOP:              { fr: 'IOP',                   en: 'IOP'             },
  CONFERENCE_FORUM: { fr: 'Conférence / Forum',    en: 'Conference / Forum' },
}

function isOpen(status: string) {
  return ['ouverte', 'open', 'complete', 'complet', 'full'].includes(status.toLowerCase())
}

export default function SessionsHub({ locale }: Props) {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'ALL' | ProgramSessionType>('ALL')
  const [formatFilter, setFormatFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch('/api/sessions', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error('load_error'); return r.json() })
      .then((data: SessionItem[]) => {
        if (!alive) return
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const upcoming = data.filter(s => new Date(s.startDate) >= today && isOpen(s.status))
        setSessions(upcoming)
      })
      .catch(() => { if (alive) setError(locale === 'fr' ? 'Impossible de charger les sessions.' : 'Unable to load sessions.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [locale])

  const hydrated = useMemo(() => sessions.map(s => ({
    ...s,
    programType: inferProgramSessionType({
      title: s.formation.title,
      description: s.description || s.formation.description,
      format: s.format,
      formation: { title: s.formation.title, categorie: s.formation.categorie, description: s.formation.description },
    }),
    available: Math.max(0, s.maxParticipants - (s.currentParticipants || 0)),
  })), [sessions])

  const filtered = useMemo(() => hydrated.filter(s => {
    const matchType   = typeFilter === 'ALL' || s.programType === typeFilter
    const matchFormat = formatFilter === 'all' || s.format.toLowerCase().includes(formatFilter)
    return matchType && matchFormat
  }), [hydrated, typeFilter, formatFilter])

  const totalOpen = hydrated.reduce((sum, s) => sum + s.available, 0)

  const typeOptions: Array<{ value: 'ALL' | ProgramSessionType }> = [
    { value: 'ALL' }, { value: 'MRH' }, { value: 'IOP' }, { value: 'CONFERENCE_FORUM' },
  ]

  const formatOptions = [
    { id: 'all',       label: locale === 'fr' ? 'Tous les formats' : 'All formats' },
    { id: 'presentiel',label: locale === 'fr' ? 'Présentiel'       : 'On-site'     },
    { id: 'ligne',     label: locale === 'fr' ? 'En ligne'          : 'Online'      },
    { id: 'hybride',   label: locale === 'fr' ? 'Hybride'           : 'Hybrid'      },
  ]

  return (
    <section id="sessions" className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cj-blue)]/20 bg-[var(--cj-blue)]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--cj-blue)]">
              <CalendarDays className="h-3.5 w-3.5" />
              {locale === 'fr' ? 'Sessions ouvertes' : 'Open sessions'}
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              {locale === 'fr'
                ? 'Inscriptions en cours'
                : 'Registrations open now'}
            </h2>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              {locale === 'fr'
                ? 'Choisissez une session, vérifiez les places disponibles et réservez directement. Chaque inscription est confirmée immédiatement.'
                : 'Choose a session, check available spots and register directly. Each registration is confirmed immediately.'}
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm text-center">
              <p className="text-2xl font-bold text-[var(--cj-blue)]">{hydrated.length}</p>
              <p className="text-xs text-slate-500">{locale === 'fr' ? 'sessions ouvertes' : 'open sessions'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm text-center">
              <p className="text-2xl font-bold text-emerald-600">{totalOpen}</p>
              <p className="text-xs text-slate-500">{locale === 'fr' ? 'places disponibles' : 'spots available'}</p>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTypeFilter(opt.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    typeFilter === opt.value
                      ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white shadow'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)]'
                  }`}
                >
                  {TYPE_LABELS[opt.value]?.[locale] ?? opt.value}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition ${
                  showFilters ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]' : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {locale === 'fr' ? 'Format' : 'Format'}
                {formatFilter !== 'all' && <span className="h-2 w-2 rounded-full bg-[var(--cj-blue)]" />}
              </button>
              {(typeFilter !== 'ALL' || formatFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => { setTypeFilter('ALL'); setFormatFilter('all') }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  {locale === 'fr' ? 'Réinitialiser' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          {/* Format dropdown */}
          {showFilters && (
            <div className="mt-3 border-t border-slate-100 pt-3 flex flex-wrap gap-2">
              {formatOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormatFilter(opt.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    formatFilter === opt.id
                      ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p className="mb-4 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{filtered.length}</span>
            {' '}{locale === 'fr' ? 'session(s) trouvée(s)' : 'session(s) found'}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse">
                <div className="h-44 bg-slate-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(4)].map((__, j) => <div key={j} className="h-14 bg-slate-100 rounded-xl" />)}
                  </div>
                  <div className="h-8 bg-slate-100 rounded" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-9 bg-slate-200 rounded-xl flex-1" />
                    <div className="h-9 w-28 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <p className="font-semibold text-red-700 mb-3">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RotateCw className="h-4 w-4" />
              {locale === 'fr' ? 'Réessayer' : 'Retry'}
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-[var(--cj-blue)]">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[var(--cj-blue)] mb-2">
              {locale === 'fr' ? 'Aucune session disponible' : 'No session available'}
            </h3>
            <p className="text-slate-500 mb-5">
              {locale === 'fr'
                ? 'Ajustez vos filtres ou revenez prochainement.'
                : 'Adjust your filters or check back soon.'}
            </p>
            <button
              type="button"
              onClick={() => { setTypeFilter('ALL'); setFormatFilter('all') }}
              className="rounded-xl bg-[var(--cj-red)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              {locale === 'fr' ? 'Voir toutes les sessions' : 'View all sessions'}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(s => (
              <SessionCard key={s.id} session={s} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
