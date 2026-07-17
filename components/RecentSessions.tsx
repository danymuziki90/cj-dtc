'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getIntlLocale, resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

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
  imageUrl?: string | null
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

const copy = publicMessages.recentSessions

function formatDateRange(startDate: string, endDate: string, locale: 'fr' | 'en') {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const intlLocale = getIntlLocale(locale)
  return `${start.toLocaleDateString(intlLocale)} - ${end.toLocaleDateString(intlLocale)}`
}

function formatPrice(price: number, locale: 'fr' | 'en') {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price || 0)
}

function formatLabel(value: string, locale: 'fr' | 'en') {
  const lowered = (value || '').toLowerCase()
  if (lowered.includes('distanciel') || lowered.includes('en ligne') || lowered.includes('online')) return copy[locale].online
  if (lowered.includes('hybride')) return copy[locale].hybrid
  return copy[locale].onsite
}

function statusLabel(value: string, locale: 'fr' | 'en') {
  const lowered = (value || '').toLowerCase()
  if (lowered === 'ouverte' || lowered === 'open') return copy[locale].status.open
  if (lowered === 'complete' || lowered === 'complet' || lowered === 'full') return copy[locale].status.full
  if (lowered === 'fermee' || lowered === 'closed') return copy[locale].status.closed
  if (lowered === 'terminee' || lowered === 'finished') return copy[locale].status.finished
  if (lowered === 'annulee' || lowered === 'cancelled') return copy[locale].status.cancelled
  return value
}

function statusClasses(value: string) {
  const lowered = (value || '').toLowerCase()
  if (lowered === 'ouverte' || lowered === 'open') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (lowered === 'complete' || lowered === 'complet' || lowered === 'full') return 'bg-amber-50 text-amber-700 ring-amber-100'
  if (lowered === 'fermee' || lowered === 'closed') return 'bg-slate-100 text-slate-700 ring-slate-200'
  if (lowered === 'annulee' || lowered === 'cancelled') return 'bg-red-50 text-red-700 ring-red-100'
  return 'bg-blue-50 text-blue-700 ring-blue-100'
}

function selectSessions(data: SessionItem[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filtrer uniquement pour les sessions ouvertes (statut ouverte ou open)
  const openSessions = data
    .filter((session) => {
      const status = (session.status || '').toLowerCase()
      return status === 'ouverte' || status === 'open'
    })
    .sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

  return openSessions.slice(0, 6)
}

export default function RecentSessions() {
  const params = useParams<{ locale: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]
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
          <h2 className="mb-4 text-4xl font-bold text-cjblue">
            {locale === 'fr' ? 'Sessions ouvertes' : 'Open Sessions'}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {locale === 'fr' 
              ? 'Découvrez nos sessions de formation actuellement ouvertes aux inscriptions.' 
              : 'Discover our training sessions currently open for registration.'}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {sessions.map((session) => {
            const availableSpots = Math.max(0, (session.maxParticipants || 0) - (session.currentParticipants || 0))
            const title = session.adminMeta?.customTitle || session.formation.title
            const headerImage = session.adminMeta?.imageUrl || session.imageUrl || '/logo.png'

            return (
              <div key={session.id} className="group flex flex-col justify-between overflow-hidden rounded-xl border border-blue-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div>
                  <Link href={`/${locale}/formations/${session.formation.slug}`}>
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-cjblue to-blue-700">
                      <img
                        src={headerImage}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses(session.status)}`}>
                        {statusLabel(session.status, locale)}
                      </div>
                      <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                        {session.adminMeta?.sessionType || session.formation.categorie || t.defaultType}
                      </div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gray-400">
                      {formatDateRange(session.startDate, session.endDate, locale)}
                    </p>

                    <Link href={`/${locale}/formations/${session.formation.slug}`}>
                      <h3 className="mb-3 line-clamp-2 text-xl font-bold text-cjblue transition-colors hover:text-[var(--cj-red)]">
                        {title}
                      </h3>
                    </Link>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="font-semibold">{session.location || (locale === 'fr' ? 'À définir' : 'TBD')}</p>
                      <p>{formatLabel(session.format, locale)} · {session.startTime} - {session.endTime}</p>
                      <p className="text-emerald-700 font-medium">
                        {availableSpots} {t.spotsLabel} {session.maxParticipants}
                      </p>
                    </div>

                    <p className="line-clamp-3 text-sm text-gray-550">
                      {session.formation.description || t.fallbackDescription}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{locale === 'fr' ? 'Tarif' : 'Price'}</p>
                      <p className="text-xl font-extrabold text-cjblue">{formatPrice(session.price, locale)}</p>
                    </div>
                    <Link
                      href={
                        isLoggedIn
                          ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${session.formation.id}&sessionId=${session.id}`
                          : `/${locale}/espace-etudiants?formationId=${session.formation.id}&sessionId=${session.id}`
                      }
                      className="rounded-lg bg-[var(--cj-red)] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#bb111d] transition-colors"
                    >
                      {locale === 'fr' ? "S'inscrire" : 'Register'}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/formations`}
            className="inline-block rounded-lg bg-[var(--cj-blue)] px-8 py-3 font-semibold text-white transition-colors hover:bg-[var(--cj-red)]"
          >
            {locale === 'fr' ? 'Voir toutes les sessions' : 'View all sessions'}
          </Link>
        </div>
      </div>
    </section>
  )
}
