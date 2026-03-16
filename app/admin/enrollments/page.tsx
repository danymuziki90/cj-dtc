'use client'

import { useEffect, useState } from 'react'
import { CalendarRange, Download, FileSpreadsheet, Layers3, Printer } from 'lucide-react'
import AdminEnrollmentTable, { type EnrollmentRow } from '@/components/AdminEnrollmentTable'
import BulkEmailSender from '@/components/BulkEmailSender'
import EnrollmentFilters from '@/components/EnrollmentFilters'
import EnrollmentStats, { type EnrollmentStatsSummary } from '@/components/EnrollmentStats'
import EnrollmentPreviewModal from '@/components/EnrollmentPreviewModal'
import AdminShell from '@/components/admin-portal/AdminShell'
import PaginationControls from '@/components/admin-portal/PaginationControls'
import {
  AdminBadge,
  AdminPanel,
  AdminPanelHeader,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
} from '@/components/admin-portal/ui'

type Formation = {
  id: number
  title: string
}

type PaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const initialFilters = {
  status: '',
  formationId: '',
  paymentStatus: '',
  startDateFrom: '',
  startDateTo: '',
  search: '',
}

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const emptyStats: EnrollmentStatsSummary = {
  total: 0,
  byStatus: {},
  byPaymentStatus: {},
  revenue: {
    totalAmount: 0,
    paidAmount: 0,
  },
  byFormation: [],
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [stats, setStats] = useState<EnrollmentStatsSummary>(emptyStats)
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentRow | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [viewMode, setViewMode] = useState<'formation' | 'date'>('formation')

  async function fetchFormations() {
    try {
      const response = await fetch('/api/formations', { cache: 'no-store' })
      const data = await response.json()
      setFormations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
      setFormations([])
    }
  }

  async function fetchEnrollments(options?: Partial<PaginationState & typeof filters>) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const nextFilters = { ...filters, ...options }
      const page = options?.page ?? pagination.page
      const pageSize = options?.pageSize ?? pagination.pageSize

      if (nextFilters.status) params.append('status', nextFilters.status)
      if (nextFilters.formationId) params.append('formationId', nextFilters.formationId)
      if (nextFilters.paymentStatus) params.append('paymentStatus', nextFilters.paymentStatus)
      if (nextFilters.startDateFrom) params.append('startDateFrom', nextFilters.startDateFrom)
      if (nextFilters.startDateTo) params.append('startDateTo', nextFilters.startDateTo)
      if (nextFilters.search) params.append('search', nextFilters.search)
      params.append('page', String(page))
      params.append('pageSize', String(pageSize))

      const response = await fetch(`/api/enrollments?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()
      const nextEnrollments = Array.isArray(data?.enrollments) ? data.enrollments : []
      setEnrollments(nextEnrollments)
      setPagination(data.pagination || initialPagination)
      setStats(data.stats || emptyStats)
      return nextEnrollments as EnrollmentRow[]
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error)
      setEnrollments([])
      setPagination(initialPagination)
      setStats(emptyStats)
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFormations()
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [filters, pagination.page, pagination.pageSize])

  async function handleExport(format: 'excel' | 'csv') {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('format', format)

      const response = await fetch(`/api/enrollments/export?${params.toString()}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `inscriptions_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      alert("Erreur lors de l'export")
    }
  }

  function handlePreview(enrollment: EnrollmentRow) {
    setSelectedEnrollment(enrollment)
    setShowPreview(true)
  }

  return (
    <AdminShell title="Gestion des inscriptions">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-[26px] border border-slate-200 bg-white/92 px-5 py-4 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.28)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => handleExport('csv')} className={adminSecondaryButtonClassName}>
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button type="button" onClick={() => handleExport('excel')} className={adminSecondaryButtonClassName}>
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </button>
            <button type="button" onClick={() => window.print()} className={adminPrimaryButtonClassName}>
              <Printer className="h-4 w-4" />
              Imprimer
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="primary">{pagination.totalItems} dossier(s)</AdminBadge>
            <AdminBadge tone="neutral">{viewMode === 'formation' ? 'Vue formation' : 'Vue date'}</AdminBadge>
            <AdminBadge tone="success">{formations.length} formation(s)</AdminBadge>
          </div>
        </div>

        <EnrollmentStats summary={stats} />

        <EnrollmentFilters
          filters={filters}
          formations={formations}
          onFiltersChange={(nextFilters) => {
            setFilters(nextFilters)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
          onReset={() => {
            setFilters(initialFilters)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
        />

        <BulkEmailSender acceptedEnrollments={enrollments.filter((item) => item.status === 'accepted')} />

        <AdminPanel>
          <AdminPanelHeader
            eyebrow="Presentation"
            title="Choisir l'angle de lecture"
            description="Passez d'une segmentation par formation a une vue calendrier selon le type de pilotage souhaite."
            actions={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('formation')}
                  className={viewMode === 'formation' ? adminPrimaryButtonClassName : adminSecondaryButtonClassName}
                >
                  <Layers3 className="h-4 w-4" />
                  Vue par formation
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('date')}
                  className={viewMode === 'date' ? adminPrimaryButtonClassName : adminSecondaryButtonClassName}
                >
                  <CalendarRange className="h-4 w-4" />
                  Vue par date
                </button>
              </div>
            }
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <AdminBadge tone="primary">Page {pagination.page} / {pagination.totalPages}</AdminBadge>
            <AdminBadge tone="neutral">{pagination.pageSize} lignes par page</AdminBadge>
            <AdminBadge tone="success">{stats.total} dossier(s) totalises</AdminBadge>
          </div>
        </AdminPanel>

        {loading ? (
          <AdminPanel>
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--admin-primary)]" />
              <p className="mt-4 text-sm text-slate-600">Chargement des inscriptions...</p>
            </div>
          </AdminPanel>
        ) : (
          <AdminEnrollmentTable enrollments={enrollments} groupBy={viewMode} onPreview={handlePreview} />
        )}

        <PaginationControls
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
        />

        {showPreview && selectedEnrollment ? (
          <EnrollmentPreviewModal
            enrollment={selectedEnrollment}
            onClose={() => {
              setShowPreview(false)
              setSelectedEnrollment(null)
            }}
            onStatusChange={async () => {
              const freshEnrollments = await fetchEnrollments()
              const updatedEnrollment = freshEnrollments.find((item) => item.id === selectedEnrollment.id) || null
              setSelectedEnrollment(updatedEnrollment)
            }}
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
