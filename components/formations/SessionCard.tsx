'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, Clock3, MapPinIcon, Users, Monitor, Layers } from 'lucide-react'

export type SessionItem = {
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
  imageUrl?: string | null
  adminMeta?: { imageUrl?: string | null }
}

type Props = {
  session: SessionItem
  locale: 'fr' | 'en'
}

function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDateRange(start: string, end: string, locale: string) {
  const fmt = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`
}

function getDurationDays(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.ceil(diff / 86400000) + 1)
}

function normalizeFormat(format: string) {
  const v = format.toLowerCase()
  if (v.includes('distanciel') || v.includes('ligne') || v.includes('online')) return 'en_ligne'
  if (v.includes('hybride')) return 'hybride'
  return 'presentiel'
}

const FORMAT_LABELS: Record<string, { fr: string; en: string }> = {
  presentiel: { fr: 'Présentiel', en: 'On-site' },
  en_ligne:   { fr: 'En ligne',   en: 'Online'  },
  hybride:    { fr: 'Hybride',    en: 'Hybrid'  },
}

const FORMAT_ICONS = {
  presentiel: MapPinIcon,
  en_ligne:   Monitor,
  hybride:    Layers,
}

export default function SessionCard({ session: s, locale }: Props) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/student/auth/me')
      .then((res) => {
        if (res.ok) setIsLoggedIn(true)
      })
      .catch(() => {})
  }, [])

  const available = Math.max(0, s.maxParticipants - (s.currentParticipants || 0))
  const isFull = available <= 0
  const fmt = normalizeFormat(s.format)
  const FormatIcon = FORMAT_ICONS[fmt as keyof typeof FORMAT_ICONS] ?? MapPinIcon
  const formatLabel = FORMAT_LABELS[fmt]?.[locale] ?? s.format
  const image = s.adminMeta?.imageUrl || s.imageUrl || '/logo.png'
  const days = getDurationDays(s.startDate, s.endDate)
  const daysLabel = `${days} ${days > 1 ? (locale === 'fr' ? 'jours' : 'days') : (locale === 'fr' ? 'jour' : 'day')}`

  // Badges urgency
  const daysUntilStart = Math.ceil((new Date(s.startDate).getTime() - Date.now()) / 86400000)
  const isLastWeek = daysUntilStart <= 7 && daysUntilStart >= 0 && !isFull && available > 5
  const isAlmostFull = !isFull && available > 0 && available <= 5
  const isConfirmed = !isFull && s.currentParticipants >= Math.floor(s.maxParticipants * 0.5)

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--cj-blue)] via-[#0B3A8E] to-[var(--cj-red)]" />

      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 flex-shrink-0">
        <img
          src={image}
          alt={s.formation.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--cj-blue)] shadow-sm">
            {s.formation.categorie?.replace(/-/g, ' ') || (locale === 'fr' ? 'Formation' : 'Training')}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
            <FormatIcon className="h-3 w-3" />
            {formatLabel}
          </span>
          {isAlmostFull && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow">
              {locale === 'fr'
                ? `${available} place${available > 1 ? 's' : ''} restante${available > 1 ? 's' : ''}`
                : `${available} spot${available > 1 ? 's' : ''} left`}
            </span>
          )}
          {isLastWeek && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow">
              {locale === 'fr' ? 'Dernière semaine' : 'Last week'}
            </span>
          )}
          {isConfirmed && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow">
              {locale === 'fr' ? 'Session confirmée' : 'Confirmed'}
            </span>
          )}
          {isFull && (
            <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-white shadow">
              {locale === 'fr' ? 'Complet' : 'Full'}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-[var(--cj-blue)] line-clamp-2 mb-3">
          {s.formation.title}
        </h3>

        {/* Meta grid */}
        <dl className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              {locale === 'fr' ? 'Date' : 'Date'}
            </dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--cj-blue)]">
              {formatDateRange(s.startDate, s.endDate, locale)}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Clock3 className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              {locale === 'fr' ? 'Durée' : 'Duration'}
            </dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--cj-blue)]">
              {s.startTime} – {s.endTime}
              <span className="ml-1 text-slate-500">({daysLabel})</span>
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <MapPinIcon className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              {locale === 'fr' ? 'Lieu' : 'Location'}
            </dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--cj-blue)] truncate">{s.location}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Users className="h-3.5 w-3.5 text-[var(--cj-blue)]" />
              {locale === 'fr' ? 'Places' : 'Seats'}
            </dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--cj-blue)]">
              {isFull
                ? (locale === 'fr' ? "Liste d'attente" : 'Waitlist')
                : `${available} ${locale === 'fr' ? 'disponible(s)' : 'available'}`}
            </dd>
          </div>
        </dl>

        {/* Seats bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1 text-xs text-slate-500">
            <span>{s.currentParticipants}/{s.maxParticipants} {locale === 'fr' ? 'inscrits' : 'registered'}</span>
            <span>{Math.round((s.currentParticipants / s.maxParticipants) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200">
            <div
              className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-500' : available <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, Math.round((s.currentParticipants / s.maxParticipants) * 100))}%` }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{formatLabel}</p>
            <p className="text-xl font-bold text-[var(--cj-blue)]">{formatPrice(s.price, locale)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/formations/${s.formation.slug}`}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)]"
            >
              {locale === 'fr' ? 'Détails' : 'Details'}
            </Link>
            <button
              type="button"
              onClick={() => {
                if (isLoggedIn) {
                  router.push(`/${locale}/espace-etudiants/confirm-inscription?formationId=${s.formationId}&sessionId=${s.id}`)
                } else {
                  router.push(`/${locale}/espace-etudiants?formationId=${s.formationId}&sessionId=${s.id}`)
                }
              }}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isFull
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-[var(--cj-blue)] text-white hover:bg-[#0B3A8E]'
              }`}
            >
              {isFull
                ? (locale === 'fr' ? "Liste d'attente" : 'Waitlist')
                : (locale === 'fr' ? "S'inscrire" : 'Register')}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
