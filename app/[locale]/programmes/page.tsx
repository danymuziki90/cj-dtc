'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CalendarDays, Clock3, MapPin, MonitorSmartphone, Users } from 'lucide-react'
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

export default function ProgrammesPage() {
  const params = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]

  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)
  const [selectedType, setSelectedType] = useState<ProgramSessionType>('MRH')
  const [typeFilter, setTypeFilter] = useState<'ALL' | ProgramSessionType>('ALL')

  const paymentStatus = searchParams.get('payment_status')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
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
      } catch (error) {
        console.error('Programmes load error:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cj-blue-50)]">
        <div className="mx-auto flex h-screen max-w-5xl items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--cj-blue-50)] via-white to-[var(--cj-blue-50)]">
      <div className="bg-[linear-gradient(135deg,#002D72_0%,#003b96_65%,#E30613_140%)] py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm uppercase tracking-[0.25em] text-white/90">{t.heroEyebrow}</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl">
            {t.heroTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-white/95 md:text-xl">{t.heroDescription}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">{hydratedSessions.length} {t.availableSessions}</span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              {hydratedSessions.reduce((sum, session) => sum + session.availableSpots, 0)} {t.openSpots}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {paymentStatus ? (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              paymentStatus === 'success'
                ? 'border-blue-200 bg-blue-50 text-blue-900'
                : paymentStatus === 'pending'
                ? 'border-blue-200 bg-white text-cjblue'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            {t.paymentStatus}: <strong>{paymentStatus}</strong>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'ALL' ? 'bg-cjblue text-white' : 'bg-white text-cjblue ring-1 ring-blue-200'
            }`}
          >
            {t.all}
          </button>
          <button
            onClick={() => setTypeFilter('MRH')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'MRH' ? 'bg-cjblue text-white' : 'bg-white text-cjblue ring-1 ring-blue-200'
            }`}
          >
            MRH
          </button>
          <button
            onClick={() => setTypeFilter('IOP')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'IOP' ? 'bg-cjblue text-white' : 'bg-white text-cjblue ring-1 ring-blue-200'
            }`}
          >
            IOP
          </button>
          <button
            onClick={() => setTypeFilter('CONFERENCE_FORUM')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'CONFERENCE_FORUM'
                ? 'bg-cjblue text-white'
                : 'bg-white text-cjblue ring-1 ring-blue-200'
            }`}
          >
            {t.conference}
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white px-6 py-14 text-center">
            <p className="text-lg font-medium text-cjblue">{t.emptyTitle}</p>
            <p className="mt-2 text-sm text-gray-600">{t.emptyDescription}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => {
              const image = session.adminMeta?.imageUrl || session.imageUrl || '/logo.png'
              const isFull = session.availableSpots <= 0
              const typeLabel = getTypeLabel(session.programType, locale)

              return (
                <article
                  key={session.id}
                  className="group overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-blue-50">
                    <img
                      src={image}
                      alt={session.formation.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
                      {typeLabel}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h2 className="text-lg font-semibold text-cjblue">{session.formation.title}</h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-gray-500">
                        {normalizeFormatLabel(session.format, locale)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-cjblue" />
                        <span>{formatDateRange(session.startDate, session.endDate, locale)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-cjblue" />
                        <span>
                          {session.startTime} - {session.endTime} ({getDurationLabel(session.startDate, session.endDate, locale)})
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cjblue" />
                        <span>{session.location}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MonitorSmartphone className="h-4 w-4 text-cjblue" />
                        <span>{normalizeFormatLabel(session.format, locale)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-cjblue" />
                        <span>{session.availableSpots} {t.availableSpots}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-blue-100 pt-4">
                      <p className="text-xl font-semibold text-cjblue">{formatPrice(session.price, locale)}</p>
                      <button
                        onClick={() => {
                          setSelectedSession(session)
                          setSelectedType(session.programType)
                        }}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                          isFull
                            ? 'cursor-not-allowed bg-red-100 text-red-700'
                            : 'bg-cjblue text-white hover:bg-blue-800'
                        }`}
                      >
                        {isFull ? t.waitlist : t.register}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

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
