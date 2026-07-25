'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  CalendarRange,
  Download,
  FileSpreadsheet,
  Layers3,
  MailIcon,
  Search,
  SlidersHorizontal,
  XCircle,
  Clock3,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import AdminEnrollmentTable, { type EnrollmentRow } from '@/components/AdminEnrollmentTable'
import BulkEmailSender from '@/components/BulkEmailSender'
import EnrollmentPreviewModal from '@/components/EnrollmentPreviewModal'
import AdminShell from '@/components/admin-portal/AdminShell'
import PaginationControls from '@/components/admin-portal/PaginationControls'
import {
  AdminBadge,
  AdminPanel,
  adminInputClassName,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminSelectClassName,
} from '@/components/admin-portal/ui'
import type { EnrollmentStatsSummary } from '@/components/EnrollmentStats'

// ─── Types ────────────────────────────────────────────────────────────────────

type Formation = { id: number; title: string }

type SessionItem = {
  id: number
  startDate: string
  endDate: string
  location?: string | null
  format: string
  status: string
  formationId: number
  formation?: {
    id: number
    title: string
  } | null
  adminMeta?: {
    customTitle?: string | null
  } | null
  customTitle?: string | null
}

type PaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

type FilterState = {
  status: string
  formationId: string
  sessionId: string
  accountStatus: string
  startDateFrom: string
  startDateTo: string
  search: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const INITIAL_FILTERS: FilterState = {
  status: '',
  formationId: '',
  sessionId: '',
  accountStatus: '',
  startDateFrom: '',
  startDateTo: '',
  search: '',
}

const INITIAL_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const EMPTY_STATS: EnrollmentStatsSummary = {
  total: 0,
  byStatus: {},
  byAccountStatus: {},
  byFormation: [],
}

const STATUS_FILTERS = [
  { label: 'Tous', value: '', tone: 'neutral' as const },
  { label: 'En attente', value: 'pending', tone: 'warning' as const },
  { label: 'Acceptées', value: 'accepted', tone: 'success' as const },
  { label: 'Confirmées', value: 'confirmed', tone: 'primary' as const },
  { label: 'Liste d\'attente', value: 'waitlist', tone: 'primary' as const },
  { label: 'Refusées', value: 'rejected', tone: 'danger' as const },
  { label: 'Annulées', value: 'cancelled', tone: 'danger' as const },
  { label: 'Terminées', value: 'completed', tone: 'neutral' as const },
]

// ─── Composant KPI Card ────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  onClick,
  active,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col gap-3 rounded-[28px] border p-5 text-left shadow-sm transition-all duration-200 ${
        active
          ? `${accent} border-transparent shadow-md scale-[1.02]`
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${active ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </p>
        <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${active ? 'text-white/80' : 'text-slate-500'}`}>
          {label}
        </p>
        {sub && (
          <p className={`mt-1 text-[11px] ${active ? 'text-white/70' : 'text-slate-400'}`}>{sub}</p>
        )}
      </div>
    </button>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [pagination, setPagination] = useState<PaginationState>(INITIAL_PAGINATION)
  const [stats, setStats] = useState<EnrollmentStatsSummary>(EMPTY_STATS)
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentRow | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [viewMode, setViewMode] = useState<'formation' | 'date'>('formation')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showBulkEmail, setShowBulkEmail] = useState(false)

  // ─── Chargement formations et sessions depuis l'API back-office ─────────────

  useEffect(() => {
    Promise.all([
      fetch('/api/formations', { cache: 'no-store' }).then((res) => res.json()).catch(() => []),
      fetch('/api/sessions', { cache: 'no-store' }).then((res) => res.json()).catch(() => []),
    ]).then(([formationsData, sessionsData]) => {
      setFormations(Array.isArray(formationsData) ? formationsData : [])
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
    })
  }, [])

  // ─── Initialisation des filtres depuis l'URL au chargement de la page ─────────

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search)
      const urlFormationId = params.get('formationId') || ''
      const urlSessionId = params.get('sessionId') || ''
      const urlStatus = params.get('status') || ''
      const urlSearch = params.get('search') || ''
      const urlAccountStatus = params.get('accountStatus') || ''
      const urlStartDateFrom = params.get('startDateFrom') || ''
      const urlStartDateTo = params.get('startDateTo') || ''

      if (
        urlFormationId ||
        urlSessionId ||
        urlStatus ||
        urlSearch ||
        urlAccountStatus ||
        urlStartDateFrom ||
        urlStartDateTo
      ) {
        setFilters((prev) => ({
          ...prev,
          formationId: urlFormationId,
          sessionId: urlSessionId,
          status: urlStatus,
          search: urlSearch,
          accountStatus: urlAccountStatus,
          startDateFrom: urlStartDateFrom,
          startDateTo: urlStartDateTo,
        }))
      }
    }
  }, [])

  // ─── Synchronisation de l'URL avec l'état des filtres ──────────────────────

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      let changed = false

      const filterKeys: Array<keyof FilterState> = [
        'status',
        'formationId',
        'sessionId',
        'accountStatus',
        'startDateFrom',
        'startDateTo',
        'search',
      ]

      filterKeys.forEach((key) => {
        const val = filters[key]
        if (val) {
          if (url.searchParams.get(key) !== val) {
            url.searchParams.set(key, val)
            changed = true
          }
        } else {
          if (url.searchParams.has(key)) {
            url.searchParams.delete(key)
            changed = true
          }
        }
      })

      if (changed) {
        window.history.replaceState(null, '', url.pathname + url.search)
      }
    }
  }, [filters])

  // ─── Chargement des inscriptions (DB -> API -> UI) ──────────────────────────

  const fetchEnrollments = useCallback(
    async (overrides?: Partial<PaginationState & FilterState>) => {
      setLoading(true)
      try {
        const merged = { ...filters, ...overrides }
        const page = overrides?.page ?? pagination.page
        const pageSize = overrides?.pageSize ?? pagination.pageSize

        const params = new URLSearchParams()
        if (merged.status) params.append('status', merged.status)
        if (merged.formationId) params.append('formationId', merged.formationId)
        if (merged.sessionId) params.append('sessionId', merged.sessionId)
        if (merged.accountStatus) params.append('accountStatus', merged.accountStatus)
        if (merged.startDateFrom) params.append('startDateFrom', merged.startDateFrom)
        if (merged.startDateTo) params.append('startDateTo', merged.startDateTo)
        if (merged.search) params.append('search', merged.search)
        params.append('page', String(page))
        params.append('pageSize', String(pageSize))

        const res = await fetch(`/api/enrollments?${params}`, { cache: 'no-store' })
        const data = await res.json()
        const rows: EnrollmentRow[] = Array.isArray(data?.enrollments) ? data.enrollments : []
        setEnrollments(rows)
        setPagination(data.pagination || INITIAL_PAGINATION)
        setStats(data.stats || EMPTY_STATS)
        return rows
      } catch {
        setEnrollments([])
        setPagination(INITIAL_PAGINATION)
        setStats(EMPTY_STATS)
        return []
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination.page, pagination.pageSize],
  )

  useEffect(() => {
    fetchEnrollments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.pageSize])

  // ─── Filtered Active Sessions (sans doublons et sans sessions annulées/archivées) ──

  const activeSessions = useMemo(() => {
    const seen = new Set<number>()
    return sessions.filter((s) => {
      if (!s || !s.id || seen.has(s.id)) return false
      seen.add(s.id)
      const status = (s.status || '').toLowerCase()
      return !['annulee', 'cancelled', 'deleted', 'archived', 'archive'].includes(status)
    })
  }, [sessions])

  // ─── Export ────────────────────────────────────────────────────────────────

  async function handleExport(format: 'excel' | 'csv') {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('format', format)
      const res = await fetch(`/api/enrollments/export?${params}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inscriptions_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      alert("Erreur lors de l'export")
    }
  }

  // ─── Helpers filtres ───────────────────────────────────────────────────────

  function setStatusFilter(value: string) {
    setFilters((prev) => ({ ...prev, status: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v.trim().length > 0).length,
    [filters],
  )

  const acceptedEnrollments = useMemo(
    () => enrollments.filter((e) => e.status === 'accepted'),
    [enrollments],
  )

  // ─── KPIs calculés ────────────────────────────────────────────────────────

  const acceptedTotal = (stats.byStatus.accepted || 0) + (stats.byStatus.confirmed || 0)
  const rejectedTotal = (stats.byStatus.rejected || 0) + (stats.byStatus.cancelled || 0)

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminShell title="Inscriptions">
      <div className="space-y-6">

        {/* ── En-tête ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inscriptions</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gérez les dossiers d'inscription, acceptez ou refusez les candidatures.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkEmail((v) => !v)}
              className={adminSecondaryButtonClassName}
            >
              <MailIcon className="h-4 w-4" />
              Email groupé
              {acceptedEnrollments.length > 0 && (
                <span className="ml-1 rounded-full bg-[var(--admin-primary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {acceptedEnrollments.length}
                </span>
              )}
            </button>
            <button type="button" onClick={() => handleExport('csv')} className={adminSecondaryButtonClassName}>
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button type="button" onClick={() => handleExport('excel')} className={adminSecondaryButtonClassName}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <Link
              href="/admin/enrollments/templates"
              className={adminSecondaryButtonClassName}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              Modèles email
            </Link>
          </div>
        </div>

        {/* ── KPIs cliquables ──────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={Layers3}
            label="Total"
            value={stats.total}
            sub="Tous statuts confondus"
            accent="bg-gradient-to-br from-slate-700 to-slate-900"
            onClick={() => setStatusFilter('')}
            active={filters.status === ''}
          />
          <KpiCard
            icon={Clock3}
            label="En attente"
            value={stats.byStatus.pending || 0}
            sub="Dossiers à traiter"
            accent="bg-gradient-to-br from-amber-500 to-orange-600"
            onClick={() => setStatusFilter('pending')}
            active={filters.status === 'pending'}
          />
          <KpiCard
            icon={BadgeCheck}
            label="Acceptées"
            value={acceptedTotal}
            sub="Acceptées + confirmées"
            accent="bg-gradient-to-br from-emerald-500 to-teal-600"
            onClick={() => setStatusFilter('accepted')}
            active={filters.status === 'accepted'}
          />
          <KpiCard
            icon={XCircle}
            label="Refusées"
            value={rejectedTotal}
            sub="Rejetées + annulées"
            accent="bg-gradient-to-br from-rose-500 to-red-600"
            onClick={() => setStatusFilter('rejected')}
            active={filters.status === 'rejected'}
          />
        </div>

        {/* ── Email groupé (collapsible) ────────────────────────────────────── */}
        {showBulkEmail && (
          <BulkEmailSender acceptedEnrollments={acceptedEnrollments} />
        )}

        {/* ── Zone de filtres ───────────────────────────────────────────────── */}
        <AdminPanel>
          {/* Ligne 1 : recherche + filtre dynamique formation/session + compte + boutons */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="enrollment-search"
                type="text"
                placeholder="Rechercher par nom, email ou formation..."
                value={filters.search}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className={`pl-11 ${adminInputClassName}`}
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtre dynamique : Formations ET Sessions publiées back-office */}
            <div className="w-full lg:w-72">
              <label htmlFor="enrollment-formation-session-filter" className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Formation ou Session
              </label>
              <select
                id="enrollment-formation-session-filter"
                value={
                  filters.sessionId
                    ? `session-${filters.sessionId}`
                    : filters.formationId
                    ? `formation-${filters.formationId}`
                    : ''
                }
                onChange={(e) => {
                  const val = e.target.value
                  if (val.startsWith('session-')) {
                    const sId = val.replace('session-', '')
                    setFilters((prev) => ({ ...prev, sessionId: sId, formationId: '' }))
                  } else if (val.startsWith('formation-')) {
                    const fId = val.replace('formation-', '')
                    setFilters((prev) => ({ ...prev, formationId: fId, sessionId: '' }))
                  } else {
                    setFilters((prev) => ({ ...prev, formationId: '', sessionId: '' }))
                  }
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className={adminSelectClassName}
              >
                <option value="">Toutes les formations & sessions</option>

                {formations.length > 0 && (
                  <optgroup label="── Formations (Toutes sessions) ──">
                    {formations.map((f) => (
                      <option key={`f-${f.id}`} value={`formation-${f.id}`}>
                        📚 {f.title}
                      </option>
                    ))}
                  </optgroup>
                )}

                {activeSessions.length > 0 && (
                  <optgroup label="── Sessions publiées (Filtre par session) ──">
                    {activeSessions.map((s) => {
                      const formationTitle = s.formation?.title || 'Formation'
                      const startDateFormatted = s.startDate
                        ? new Date(s.startDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : ''
                      const locationText = s.location || (s.format === 'distanciel' ? 'En ligne' : 'Présentiel')
                      const label = `🗓️ ${formationTitle} — Session du ${startDateFormatted} (${locationText})`
                      return (
                        <option key={`s-${s.id}`} value={`session-${s.id}`}>
                          {label}
                        </option>
                      )
                    })}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Compte étudiant */}
            <div className="w-full lg:w-48">
              <label htmlFor="enrollment-account-filter" className="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compte étudiant
              </label>
              <select
                id="enrollment-account-filter"
                value={filters.accountStatus}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, accountStatus: e.target.value }))
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                className={adminSelectClassName}
              >
                <option value="">Tous les comptes</option>
                <option value="pending_creation">Compte à créer</option>
                <option value="active">Compte actif</option>
                <option value="created">Compte créé</option>
                <option value="suspended">Compte suspendu</option>
              </select>
            </div>

            {/* Bouton filtres avancés + reset */}
            <div className="flex gap-2">
              <button
                type="button"
                id="toggle-advanced-filters"
                onClick={() => setShowAdvancedFilters((v) => !v)}
                className={adminSecondaryButtonClassName}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Dates
                {showAdvancedFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  id="reset-filters"
                  onClick={resetFilters}
                  className={adminSecondaryButtonClassName}
                  title="Réinitialiser les filtres"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtres avancés : dates */}
          {showAdvancedFilters && (
            <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date-from" className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Date de début — du
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={filters.startDateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDateFrom: e.target.value }))}
                  className={adminInputClassName}
                />
              </div>
              <div>
                <label htmlFor="date-to" className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Date de début — au
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={filters.startDateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDateTo: e.target.value }))}
                  className={adminInputClassName}
                />
              </div>
            </div>
          )}

          {/* Ligne 2 : filtres rapides par statut (pills) */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <span className="self-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Statut :
            </span>
            {STATUS_FILTERS.map((sf) => {
              const isActive = filters.status === sf.value
              return (
                <button
                  key={sf.value}
                  type="button"
                  id={`filter-status-${sf.value || 'all'}`}
                  onClick={() => setStatusFilter(sf.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)] hover:text-[var(--admin-primary)]'
                  }`}
                >
                  {sf.label}
                  {sf.value && stats.byStatus[sf.value] !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {stats.byStatus[sf.value]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Résumé des filtres actifs */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actifs :</span>
              {filters.search && (
                <AdminBadge tone="neutral">Recherche : {filters.search}</AdminBadge>
              )}
              {filters.sessionId && (
                <AdminBadge tone="primary">
                  Session : {
                    activeSessions.find((s) => String(s.id) === filters.sessionId)?.formation?.title || 'Session #' + filters.sessionId
                  } ({
                    activeSessions.find((s) => String(s.id) === filters.sessionId)?.startDate
                      ? new Date(activeSessions.find((s) => String(s.id) === filters.sessionId)!.startDate).toLocaleDateString('fr-FR')
                      : ''
                  })
                </AdminBadge>
              )}
              {filters.formationId && !filters.sessionId && (
                <AdminBadge tone="primary">
                  Formation : {formations.find((f) => String(f.id) === filters.formationId)?.title || filters.formationId}
                </AdminBadge>
              )}
              {filters.accountStatus && (
                <AdminBadge tone="primary">Compte : {filters.accountStatus}</AdminBadge>
              )}
              {filters.startDateFrom && (
                <AdminBadge tone="neutral">Du : {filters.startDateFrom}</AdminBadge>
              )}
              {filters.startDateTo && (
                <AdminBadge tone="neutral">Au : {filters.startDateTo}</AdminBadge>
              )}
            </div>
          )}
        </AdminPanel>

        {/* ── Barre d'info + toggles vue ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{pagination.totalItems}</span>
            résultat{pagination.totalItems !== 1 ? 's' : ''}
            {filters.status && (
              <AdminBadge tone="success">
                Filtre statut : {STATUS_FILTERS.find((s) => s.value === filters.status)?.label}
              </AdminBadge>
            )}
            <span className="text-slate-400">
              Page {pagination.page} / {pagination.totalPages} · {pagination.pageSize} par page
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              id="view-formation"
              onClick={() => setViewMode('formation')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'formation'
                  ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)]'
              }`}
            >
              <Layers3 className="h-3.5 w-3.5" />
              Par formation
            </button>
            <button
              type="button"
              id="view-date"
              onClick={() => setViewMode('date')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'date'
                  ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[var(--admin-primary-200)] hover:bg-[var(--admin-primary-50)]'
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Par date
            </button>
          </div>
        </div>

        {/* ── Tableau ───────────────────────────────────────────────────────── */}
        {loading ? (
          <AdminPanel>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--admin-primary)]" />
              <p className="mt-4 text-sm font-medium text-slate-500">Chargement des inscriptions...</p>
            </div>
          </AdminPanel>
        ) : (
          <AdminEnrollmentTable
            enrollments={enrollments}
            groupBy={viewMode}
            onPreview={(enrollment) => {
              setSelectedEnrollment(enrollment)
              setShowPreview(true)
            }}
          />
        )}

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        <PaginationControls
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
        />

        {/* ── Modal de détail ───────────────────────────────────────────────── */}
        {showPreview && selectedEnrollment ? (
          <EnrollmentPreviewModal
            enrollment={selectedEnrollment}
            onClose={() => {
              setShowPreview(false)
              setSelectedEnrollment(null)
            }}
            onStatusChange={async () => {
              const fresh = await fetchEnrollments()
              setSelectedEnrollment(fresh.find((e) => e.id === selectedEnrollment.id) || null)
            }}
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
