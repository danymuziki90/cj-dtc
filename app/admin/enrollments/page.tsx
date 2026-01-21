'use client'

import { useState, useEffect } from 'react'
import AdminEnrollmentTable from '../../../components/AdminEnrollmentTable'
import BulkEmailSender from '../../../components/BulkEmailSender'
import EnrollmentFilters from '../../../components/EnrollmentFilters'
import EnrollmentStats from '../../../components/EnrollmentStats'
import EnrollmentPreviewModal from '../../../components/EnrollmentPreviewModal'

interface Enrollment {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  startDate: string
  status: string
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  createdAt: string
  motivationLetter?: string
  notes?: string
  formation: {
    id: number
    title: string
    slug: string
  }
}

interface Formation {
  id: number
  title: string
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    formationId: '',
    paymentStatus: '',
    startDateFrom: '',
    startDateTo: '',
    search: ''
  })
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [viewMode, setViewMode] = useState<'formation' | 'date'>('formation')

  useEffect(() => {
    fetchFormations()
    fetchEnrollments()
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [filters])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      const data = await response.json()
      setFormations(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.formationId) params.append('formationId', filters.formationId)
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters.startDateFrom) params.append('startDateFrom', filters.startDateFrom)
      if (filters.startDateTo) params.append('startDateTo', filters.startDateTo)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/enrollments?${params}`)
      const data = await response.json()
      setEnrollments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('format', format)

      const response = await fetch(`/api/enrollments/export?${params}`)
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
      console.error('Erreur lors de l\'export:', error)
      alert('Erreur lors de l\'export')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePreview = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowPreview(true)
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        enrollment.firstName.toLowerCase().includes(search) ||
        enrollment.lastName.toLowerCase().includes(search) ||
        enrollment.email.toLowerCase().includes(search) ||
        enrollment.formation.title.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-cjblue">Gestion des Inscriptions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredEnrollments.length} inscription{filteredEnrollments.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            📊 Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            🖨️ Imprimer
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <EnrollmentStats enrollments={filteredEnrollments} />

      {/* Filtres */}
      <EnrollmentFilters
        filters={filters}
        formations={formations}
        onFiltersChange={setFilters}
        onReset={() => setFilters({
          status: '',
          formationId: '',
          paymentStatus: '',
          startDateFrom: '',
          startDateTo: '',
          search: ''
        })}
      />

      {/* Section Email en masse */}
      <div className="mb-6">
        <BulkEmailSender
          acceptedEnrollments={filteredEnrollments.filter(e => e.status === 'accepted')}
        />
      </div>

      {/* Sélecteur de vue */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setViewMode('formation')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'formation'
              ? 'bg-cjblue text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vue par Formation
        </button>
        <button
          onClick={() => setViewMode('date')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'date'
              ? 'bg-cjblue text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vue par Date
        </button>
      </div>

      {/* Table des inscriptions */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des inscriptions...</p>
        </div>
      ) : (
        <AdminEnrollmentTable
          enrollments={filteredEnrollments}
          groupBy={viewMode}
          onPreview={handlePreview}
        />
      )}

      {/* Modal de prévisualisation */}
      {showPreview && selectedEnrollment && (
        <EnrollmentPreviewModal
          enrollment={selectedEnrollment}
          onClose={() => {
            setShowPreview(false)
            setSelectedEnrollment(null)
          }}
          onStatusChange={() => {
            fetchEnrollments()
            setShowPreview(false)
            setSelectedEnrollment(null)
          }}
        />
      )}
    </div>
  )
}
