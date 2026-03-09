'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CalendarDays, Clock3, MapPin, MonitorSmartphone, Users } from 'lucide-react'
import SessionRegistrationModal from '@/components/programmes/SessionRegistrationModal'
import {
  getProgramSessionTypeLabel,
  inferProgramSessionType,
  type ProgramSessionType,
} from '@/lib/programmes/session-types'

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
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
}

function getDurationLabel(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
  return `${days} jour${days > 1 ? 's' : ''}`
}

function normalizeFormatLabel(format: string) {
  const lowered = format.toLowerCase()
  if (lowered.includes('distanciel') || lowered.includes('en ligne') || lowered.includes('online')) {
    return 'En ligne'
  }
  if (lowered.includes('hybride')) {
    return 'Hybride'
  }
  return 'Presentiel'
}

function isSessionPubliclyOpen(status: string) {
  const value = status.toLowerCase()
  return ['ouverte', 'open', 'complete', 'complet'].includes(value)
}

export default function ProgrammesPage() {
  const params = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const locale = params?.locale || 'fr'

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
        if (!response.ok) throw new Error('Impossible de charger les sessions.')
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
  }, [])

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
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto flex h-screen max-w-5xl items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <div className="bg-slate-950 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Catalogue 2026</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Nos Sessions</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Inscrivez-vous a la session adaptee a votre profil: MRH, IOP, Conference / Forum. Le formulaire
            s&apos;adapte automatiquement au type de session.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">{hydratedSessions.length} sessions disponibles</span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              {hydratedSessions.reduce((sum, session) => sum + session.availableSpots, 0)} places ouvertes
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {paymentStatus ? (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              paymentStatus === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : paymentStatus === 'pending'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            Statut paiement: <strong>{paymentStatus}</strong>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setTypeFilter('MRH')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'MRH' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'
            }`}
          >
            MRH
          </button>
          <button
            onClick={() => setTypeFilter('IOP')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'IOP' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'
            }`}
          >
            IOP
          </button>
          <button
            onClick={() => setTypeFilter('CONFERENCE_FORUM')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              typeFilter === 'CONFERENCE_FORUM'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-300'
            }`}
          >
            Conference / Forum
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-lg font-medium text-slate-900">Aucune session disponible</p>
            <p className="mt-2 text-sm text-slate-600">Ajustez le filtre ou revenez plus tard.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => {
              const image = session.imageUrl || '/logo.png'
              const isFull = session.availableSpots <= 0
              const typeLabel = getProgramSessionTypeLabel(session.programType)

              return (
                <article
                  key={session.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
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
                      <h2 className="text-lg font-semibold text-slate-900">{session.formation.title}</h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-500">
                        {normalizeFormatLabel(session.format)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-cyan-700" />
                        <span>{formatDateRange(session.startDate, session.endDate)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-cyan-700" />
                        <span>
                          {session.startTime} - {session.endTime} ({getDurationLabel(session.startDate, session.endDate)})
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-700" />
                        <span>{session.location}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MonitorSmartphone className="h-4 w-4 text-cyan-700" />
                        <span>{normalizeFormatLabel(session.format)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-700" />
                        <span>{session.availableSpots} places disponibles</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <p className="text-xl font-semibold text-slate-900">{formatPrice(session.price)}</p>
                      <button
                        onClick={() => {
                          setSelectedSession(session)
                          setSelectedType(session.programType)
                        }}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                          isFull ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-cyan-700 text-white hover:bg-cyan-800'
                        }`}
                      >
                        {isFull ? 'Liste attente' : "S'inscrire"}
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
