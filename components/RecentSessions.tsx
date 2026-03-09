'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type SessionItem = {
  id: number
  createdAt: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  status: string
  maxParticipants: number
  currentParticipants: number
  price: number
  formation: {
    id: number
    title: string
    slug: string
    categorie?: string | null
    description?: string | null
  }
  adminMeta?: {
    customTitle?: string | null
    imageUrl?: string | null
    sessionType?: string | null
    durationLabel?: string | null
  }
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price || 0)
}

function formatLabel(value: string) {
  const lowered = (value || '').toLowerCase()
  if (lowered.includes('distanciel') || lowered.includes('en ligne') || lowered.includes('online')) return 'En ligne'
  if (lowered.includes('hybride')) return 'Hybride'
  return 'Presentiel'
}

function statusLabel(value: string) {
  const lowered = (value || '').toLowerCase()
  if (lowered === 'ouverte') return 'Ouverte'
  if (lowered === 'complete' || lowered === 'complet') return 'Complete'
  if (lowered === 'fermee') return 'Fermee'
  if (lowered === 'terminee') return 'Terminee'
  if (lowered === 'annulee') return 'Annulee'
  return value
}

function statusClasses(value: string) {
  const lowered = (value || '').toLowerCase()
  if (lowered === 'ouverte') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (lowered === 'complete' || lowered === 'complet') return 'bg-amber-50 text-amber-700 ring-amber-100'
  if (lowered === 'fermee') return 'bg-slate-100 text-slate-700 ring-slate-200'
  if (lowered === 'annulee') return 'bg-red-50 text-red-700 ring-red-100'
  return 'bg-blue-50 text-blue-700 ring-blue-100'
}

function selectSessions(data: SessionItem[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activeStatuses = new Set(['ouverte', 'complete', 'complet', 'fermee'])

  const activeOrUpcoming = data
    .filter((session) => {
      const start = new Date(session.startDate)
      return start >= today && activeStatuses.has((session.status || '').toLowerCase())
    })
    .sort((a, b) => {
      const createdDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (createdDiff !== 0) return createdDiff
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

  const selected = [...activeOrUpcoming]

  if (selected.length < 3) {
    const selectedIds = new Set(selected.map((item) => item.id))
    const recent = [...data]
      .filter((session) => !selectedIds.has(session.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    for (const session of recent) {
      selected.push(session)
      if (selected.length >= 3) break
    }
  }

  return selected.slice(0, 3)
}

export default function RecentSessions() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/sessions', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch sessions')
        const data = (await response.json()) as SessionItem[]
        setSessions(selectSessions(data))
      } catch (error) {
        console.error('Error fetching sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-10 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-6 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-xl bg-white shadow-md">
                <div className="h-48 w-full animate-pulse bg-gray-200" />
                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (sessions.length === 0) return null

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-cjblue">Dernières sessions</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Les sessions recemment ajoutees ou actuellement actives par l'administration.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {sessions.map((session) => {
            const availableSpots = Math.max(0, (session.maxParticipants || 0) - (session.currentParticipants || 0))
            const title = session.adminMeta?.customTitle || session.formation.title
            const image = session.adminMeta?.imageUrl || null

            return (
              <Link key={session.id} href={`/${locale}/programmes`} className="group">
                <article className="transform overflow-hidden rounded-xl border border-blue-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-cjblue to-blue-700">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-4xl text-white/70">SESSION</div>
                    )}
                    <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses(session.status)}`}>
                      {statusLabel(session.status)}
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                      {session.adminMeta?.sessionType || session.formation.categorie || 'Session'}
                    </div>
                  </div>

                  <div className="flex min-h-[22rem] flex-col p-6">
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gray-400">
                      {formatDateRange(session.startDate, session.endDate)}
                    </p>

                    <h3 className="mb-3 line-clamp-2 text-xl font-bold text-cjblue transition-colors group-hover:text-[var(--cj-red)]">
                      {title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{session.location}</p>
                      <p>{formatLabel(session.format)} • {session.startTime} - {session.endTime}</p>
                      <p>{availableSpots} place(s) disponible(s) sur {session.maxParticipants}</p>
                    </div>

                    <div className="mt-4 flex-grow">
                      <p className="line-clamp-3 text-sm text-gray-600">
                        {session.formation.description || 'Session professionnelle ouverte aux candidats souhaitant monter en competences rapidement.'}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
                      <p className="text-lg font-bold text-cjblue">{formatPrice(session.price)}</p>
                      <span className="rounded-lg bg-blue-50 px-4 py-2 font-semibold text-cjblue transition-colors group-hover:bg-red-50 group-hover:text-[var(--cj-red)]">
                        Voir la session
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/programmes`}
            className="inline-block rounded-lg bg-[var(--cj-blue)] px-8 py-3 font-semibold text-white transition-colors hover:bg-[var(--cj-red)]"
          >
            Voir toutes les sessions
          </Link>
        </div>
      </div>
    </section>
  )
}
