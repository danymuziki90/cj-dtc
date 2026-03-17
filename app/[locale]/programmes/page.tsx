'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import Breadcrumbs from '../../../components/Breadcrumbs'
import SessionRegistrationModal from '@/components/programmes/SessionRegistrationModal'
import { inferProgramSessionType, type ProgramSessionType } from '@/lib/programmes/session-types'
import { getIntlLocale, resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type TrainingSession = {
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
  description?: string
  imageUrl?: string
  adminMeta?: {
    imageUrl?: string | null
  }
}

const copy = publicMessages.programmes
const navigationCopy = publicMessages.header
const formationsCopy = publicMessages.formations

function formatPrice(price: number, locale: 'fr' | 'en') {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDateRange(startDate: string, endDate: string, locale: 'fr' | 'en') {
  const intlLocale = getIntlLocale(locale)
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString(intlLocale)} - ${end.toLocaleDateString(intlLocale)}`
}

function getDurationLabel(startDate: string, endDate: string, locale: 'fr' | 'en') {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
  return `${days} ${days > 1 ? copy[locale].daysPlural : copy[locale].days}`
}

function normalizeFormatLabel(format: string, locale: 'fr' | 'en') {
  const lowered = format.toLowerCase()
  if (lowered.includes('distanciel') || lowered.includes('en ligne') || lowered.includes('online')) {
    return copy[locale].online
  }
  if (lowered.includes('hybride')) {
    return copy[locale].hybrid
  }
  return copy[locale].onsite
}

function isSessionPubliclyOpen(status: string) {
  const value = status.toLowerCase()
  return ['ouverte', 'open', 'complete', 'complet', 'full'].includes(value)
}

function getTypeLabel(type: ProgramSessionType, locale: 'fr' | 'en') {
  if (type === 'CONFERENCE_FORUM') return copy[locale].conference
  return type
}

function normalizeText(value?: string | null) {
  return value?.trim() || ''
}

function summarizeSession(value: string | null | undefined, fallback: string, max = 170) {
  const text = normalizeText(value)
  if (!text) return fallback
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}...`
}

export default function ProgrammesPage() {
  const params = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]
  const nav = navigationCopy[locale]
  const formationLabels = formationsCopy[locale]
  const detailLabels = locale === 'fr'
    ? { date: 'Date', duration: 'Duree', location: 'Lieu', capacity: 'Capacite' }
    : { date: 'Date', duration: 'Duration', location: 'Location', capacity: 'Capacity' }

  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)
  const [selectedType, setSelectedType] = useState<ProgramSessionType>('MRH')
  const [typeFilter, setTypeFilter] = useState<'ALL' | ProgramSessionType>('ALL')

  const paymentStatus = searchParams.get('payment_status')

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/sessions', { cache: 'no-store' })
        if (!response.ok) throw new Error(t.loadError)
        const data = (await response.json()) as TrainingSession[]

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = data.filter((session) => {
          const start = new Date(session.startDate)
          return start >= today && isSessionPubliclyOpen(session.status)
        })

        if (active) setSessions(upcoming)
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : t.loadError)
          setSessions([])
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [t.loadError])

  const hydratedSessions = useMemo(
    () =>
      sessions.map((session) => {
        const programType = inferProgramSessionType({
          title: session.formation.title,
          description: session.description || session.formation.description,
          format: session.format,
          formation: {
            title: session.formation.title,
            categorie: session.formation.categorie,
            description: session.formation.description,
          },
        })

        const availableSpots = Math.max(0, session.maxParticipants - (session.currentParticipants || 0))
        return { ...session, programType, availableSpots }
      }),
    [sessions]
  )

  const filteredSessions = useMemo(() => {
    if (typeFilter === 'ALL') return hydratedSessions
    return hydratedSessions.filter((session) => session.programType === typeFilter)
  }, [hydratedSessions, typeFilter])

  const totalOpenSpots = useMemo(
    () => hydratedSessions.reduce((sum, session) => sum + session.availableSpots, 0),
    [hydratedSessions]
  )

  const typeOptions: Array<{ value: 'ALL' | ProgramSessionType; label: string }> = [
    { value: 'ALL', label: t.all },
    { value: 'MRH', label: 'MRH' },
    { value: 'IOP', label: 'IOP' },
    { value: 'CONFERENCE_FORUM', label: t.conference },
  ]

  if (loading) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: nav.sessions }]} />

          <section className="rounded-3xl bg-gradient-to-br from-cjblue via-[#0B3A8E] to-[#001B47] p-8 shadow-2xl sm:p-10 lg:p-12">
            <div className="h-6 w-32 animate-pulse rounded-full bg-white/20" />
            <div className="mt-5 h-12 max-w-2xl animate-pulse rounded bg-white/20" />
            <div className="mt-4 h-5 max-w-3xl animate-pulse rounded bg-white/15" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/15 bg-white/10 p-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-white/25" />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="h-5 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-48 animate-pulse bg-slate-200" />
                <div className="space-y-4 p-5">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((__, innerIndex) => (
                      <div key={innerIndex} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: nav.sessions }]} />

        <section className="relative overflow-hidden rounded-3xl border border-[#0B3A8E]/20 bg-gradient-to-br from-cjblue via-[#0B3A8E] to-[#001B47] p-8 text-white shadow-2xl sm:p-10 lg:p-12">
          <div className="absolute -right-16 -top-14 h-56 w-56 rounded-full bg-cjred/25 blur-3xl" />
          <div className="absolute -bottom-20 left-12 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                {t.heroEyebrow}
              </span>
              <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t.heroTitle}
              </h1>
              <p className="mt-4 max-w-3xl text-base text-blue-100 sm:text-lg">{t.heroDescription}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-blue-100">{t.availableSessions}</p>
                <p className="mt-2 text-2xl font-bold text-white">{hydratedSessions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-blue-100">{t.openSpots}</p>
                <p className="mt-2 text-2xl font-bold text-white">{totalOpenSpots}</p>
              </div>
              <div className="rounded-2xl border border-cjred/50 bg-cjred/20 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-red-100">CJ DTC</p>
                <p className="mt-2 text-lg font-bold text-white">MRH - IOP - {t.conference}</p>
              </div>
            </div>
          </div>
        </section>

        {paymentStatus ? (
          <section
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              paymentStatus === 'success'
                ? 'border-blue-200 bg-blue-50 text-blue-900'
                : paymentStatus === 'pending'
                  ? 'border-blue-200 bg-white text-cjblue'
                  : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            {t.paymentStatus}: <strong>{paymentStatus}</strong>
          </section>
        ) : null}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-900">{filteredSessions.length} {t.availableSessions}</p>
              <p className="mt-1 text-sm text-slate-600">
                {nav.formations} - MRH - IOP - {t.conference}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {typeOptions.map((option) => {
                const active = typeFilter === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTypeFilter(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'border-cjblue bg-cjblue text-white shadow-md'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-cjblue hover:text-cjblue'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {error ? (
          <section className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-red-800">{t.loadError}</h2>
            <p className="mt-2 text-red-700">{error}</p>
          </section>
        ) : filteredSessions.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-cjblue">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-cjblue">{t.emptyTitle}</h2>
            <p className="mt-2 text-slate-600">{t.emptyDescription}</p>
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className="mt-5 rounded-xl bg-cjred px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
            >
              {t.all}
            </button>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => {
              const image = session.adminMeta?.imageUrl || session.imageUrl || '/logo.png'
              const isFull = session.availableSpots <= 0
              const typeLabel = getTypeLabel(session.programType, locale)
              const sessionSummary = summarizeSession(
                session.description || session.formation.description,
                t.heroDescription
              )

              return (
                <article
                  key={session.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cjblue via-[#0B3A8E] to-cjred" />

                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={image}
                      alt={session.formation.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-cjblue shadow-sm">
                        {typeLabel}
                      </span>
                      <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                        {normalizeFormatLabel(session.format, locale)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-bold leading-tight text-cjblue">{session.formation.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{sessionSummary}</p>

                    <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <CalendarDays className="h-4 w-4 text-cjblue" />
                          {detailLabels.date}
                        </dt>
                        <dd className="mt-2 font-semibold text-cjblue">
                          {formatDateRange(session.startDate, session.endDate, locale)}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <Clock3 className="h-4 w-4 text-cjblue" />
                          {detailLabels.duration}
                        </dt>
                        <dd className="mt-2 font-semibold text-cjblue">
                          {session.startTime} - {session.endTime}
                          <span className="block text-xs font-medium text-slate-500">
                            {getDurationLabel(session.startDate, session.endDate, locale)}
                          </span>
                        </dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <MapPin className="h-4 w-4 text-cjblue" />
                          {detailLabels.location}
                        </dt>
                        <dd className="mt-2 font-semibold text-cjblue">{session.location}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <Users className="h-4 w-4 text-cjblue" />
                          {detailLabels.capacity}
                        </dt>
                        <dd className="mt-2 font-semibold text-cjblue">
                          {session.availableSpots} {t.availableSpots}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {normalizeFormatLabel(session.format, locale)}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-cjblue">{formatPrice(session.price, locale)}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/${locale}/formations/${session.formation.slug}`}
                          className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cjblue hover:text-cjblue"
                        >
                          {formationLabels.detailCta}
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSession(session)
                            setSelectedType(session.programType)
                          }}
                          className={`inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                            isFull
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-cjblue text-white hover:bg-[#0B3A8E]'
                          }`}
                        >
                          {isFull ? t.waitlist : t.register}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>

      <SessionRegistrationModal
        open={Boolean(selectedSession)}
        locale={locale}
        session={selectedSession}
        programType={selectedType}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  )
}


