'use client'

import { useEffect, useState } from 'react'
import AdminEnrollmentTable, { type EnrollmentRow } from '@/components/AdminEnrollmentTable'
import BulkEmailSender from '@/components/BulkEmailSender'
import EnrollmentFilters from '@/components/EnrollmentFilters'
import EnrollmentStats, { type EnrollmentStatsSummary } from '@/components/EnrollmentStats'
import EnrollmentPreviewModal from '@/components/EnrollmentPreviewModal'
import AdminShell from '@/components/admin-portal/AdminShell'
import PaginationControls from '@/components/admin-portal/PaginationControls'

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
      const nextFilters = {
        ...filters,
        ...options,
      }
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

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('format', format)

      const response = await fetch(`/api/enrollments/export?${params.toString()}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inscriptions_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      alert("Erreur lors de l'export")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePreview = (enrollment: EnrollmentRow) => {
    setSelectedEnrollment(enrollment)
    setShowPreview(true)
  }

  return (
    <AdminShell title="Gestion des inscriptions">
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-cjblue">Gestion des inscriptions</h2>
            <p className="mt-1 text-sm text-gray-600">
              Total filtre: {stats.total} inscription{stats.total > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
            >
              Export Excel
            </button>
            <button
              onClick={handlePrint}
              className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
            >
              Imprimer
            </button>
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

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('formation')}
            className={`rounded-lg px-4 py-2 transition-colors ${
              viewMode === 'formation' ? 'bg-cjblue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Vue par formation
          </button>
          <button
            onClick={() => setViewMode('date')}
            className={`rounded-lg px-4 py-2 transition-colors ${
              viewMode === 'date' ? 'bg-cjblue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Vue par date
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-cjblue" />
            <p className="mt-4 text-gray-600">Chargement des inscriptions...</p>
          </div>
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
