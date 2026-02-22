'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  Award, 
  Download, 
  QrCode, 
  Share2, 
  Eye, 
  Calendar, 
  User, 
  BookOpen,
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Star, 
  Shield,
  ExternalLink,
  AlertCircle,
  Copy,
  Smartphone,
  Filter,
  Search,
  ChevronRight,
  BarChart3,
  Target,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  DownloadCloud,
  FileText,
  Settings,
  Users,
  Activity,
  CheckSquare,
  XSquare,
  AlertTriangle
} from 'lucide-react'
import { 
  generateCertificateQRCodeDisplay, 
  downloadCertificateQRCode, 
  shareCertificateQRCode,
  getCertificateTypeColor,
  formatCertificateDate,
  validateCertificateRequest,
  isCertificateValid,
  getCertificateStats,
  searchCertificates,
  exportCertificateData
} from '@/lib/certificates/qr-code/simple'
import {
  generateCertificatePDF,
  downloadCertificatePDF,
  printCertificatePDF,
  shareCertificatePDF,
  emailCertificatePDF,
  generateBatchCertificatesPDF,
  generateCertificateStatsPDF,
  certificateTemplates
} from '@/lib/certificates/pdf/services'

// Interface qui correspond au schéma Prisma CJ DTC
interface Certificate {
  id: number
  code: string
  holderName: string
  formationId: number | null
  sessionId: number | null
  enrollmentId: number | null
  type: string
  issuedAt: string
  issuedBy: string | null
  verified: boolean
  userId: string | null
}

// Formation mock data (would come from API)
const mockFormations = [
  { id: 1, title: 'Management des Ressources Humaines', category: 'Certification' },
  { id: 2, title: 'Leadership et Management d\'Équipe', category: 'Masterclass' },
  { id: 3, title: 'Digital Marketing Stratégique', category: 'Workshop' }
]

export default function AdminCertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    holderName: '',
    formationId: 1,
    type: 'COMPLETION',
    issuedAt: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all')
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({})
  const [pdfs, setPdfs] = useState<Record<number, string>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedCertificatesForBatch, setSelectedCertificatesForBatch] = useState<number[]>([])
  const [showBatchActions, setShowBatchActions] = useState(false)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      // Mock data - would come from API
      const mockCertificates: Certificate[] = [
        {
          id: 1,
          code: 'CJ-DTC-2024-0001',
          holderName: 'Marie Mwamba',
          formationId: 1,
          sessionId: 1,
          enrollmentId: 1,
          type: 'COMPLETION',
          issuedAt: '2024-01-20T00:00:00Z',
          issuedBy: 'CJ DTC',
          verified: true,
          userId: 'user-1'
        },
        {
          id: 2,
          code: 'CJ-DTC-2024-0002',
          holderName: 'Jean-Pierre Lukoki',
          formationId: 2,
          sessionId: 2,
          enrollmentId: 2,
          type: 'EXCELLENCE',
          issuedAt: '2024-01-25T00:00:00Z',
          issuedBy: 'CJ DTC',
          verified: true,
          userId: 'user-2'
        },
        {
          id: 3,
          code: 'CJ-DTC-2023-0003',
          holderName: 'Sarah Kabeya',
          formationId: 3,
          sessionId: 3,
          enrollmentId: 3,
          type: 'COMPLETION',
          issuedAt: '2023-12-15T00:00:00Z',
          issuedBy: 'CJ DTC',
          verified: false,
          userId: 'user-3'
        },
        {
          id: 4,
          code: 'CJ-DTC-2023-0004',
          holderName: 'Pierre Nkoy',
          formationId: 1,
          sessionId: 4,
          enrollmentId: 4,
          type: 'MASTERCLASS',
          issuedAt: '2023-11-10T00:00:00Z',
          issuedBy: 'CJ DTC',
          verified: true,
          userId: 'user-4'
        }
      ]
      setCertificates(mockCertificates)
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (certificate: Certificate) => {
    try {
      const qrCode = await generateCertificateQRCodeDisplay(certificate)
      setQrCodes(prev => ({
        ...prev,
        [certificate.id]: qrCode
      }))
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error)
    }
  }

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      const qrCode = qrCodes[certificate.id] || await generateCertificateQRCodeDisplay(certificate)
      downloadCertificateQRCode(qrCode, `certificat-${certificate.code}.png`)
    } catch (error) {
      console.error('Erreur lors du téléchargement du certificat:', error)
    }
  }

  const shareCertificate = async (certificate: Certificate) => {
    try {
      const shareData = shareCertificateQRCode(certificate.code)
      if (navigator.share) {
        await navigator.share({
          title: `Certificat - ${certificate.holderName}`,
          text: 'Vérifiez mon certificat en ' + certificate.type,
          url: `https://cjdtc.com/verification/${certificate.code}`
        })
      } else {
        navigator.clipboard.writeText(shareData)
        alert('Lien de partage copié dans le presse-papiers!')
      }
    } catch (error) {
      console.error('Erreur lors du partage du certificat:', error)
    }
  }

  const copyVerificationUrl = (certificate: Certificate) => {
    const url = `https://cjdtc.com/verification/${certificate.code}`
    navigator.clipboard.writeText(url)
    alert('Lien de vérification copié dans le presse-papiers!')
  }

  const verifyCertificate = async (certificate: Certificate) => {
    try {
      const response = await fetch(`/api/certificates/verify-simple/${certificate.code}`)
      const data = await response.json()
      
      if (response.ok) {
        alert('Certificat vérifié avec succès!')
      } else {
        alert('Erreur lors de la vérification: ' + (data.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      alert('Erreur lors de la vérification')
    }
  }

  // PDF Functions for Admin
  const generateCertificatePDF = async (certificate: Certificate, template: string = 'classic') => {
    try {
      const response = await fetch(`/api/certificates/pdf/generate/${certificate.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: template,
          includeQRCode: true
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setPdfs(prev => ({
          ...prev,
          [certificate.id]: data.pdf.data
        }))
        return data.pdf.data
      } else {
        throw new Error(data.error || 'Erreur lors de la génération du PDF')
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      throw error
    }
  }

  const downloadCertificatePDF = async (certificate: Certificate, template: string = 'classic') => {
    try {
      const pdfData = pdfs[certificate.id] || await generateCertificatePDF(certificate, template)
      downloadCertificatePDF(pdfData, `certificat-${certificate.code}.pdf`)
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error)
      alert('Erreur lors du téléchargement du PDF')
    }
  }

  const printCertificatePDF = async (certificate: Certificate, template: string = 'classic') => {
    try {
      const pdfData = pdfs[certificate.id] || await generateCertificatePDF(certificate, template)
      printCertificatePDF(pdfData)
    } catch (error) {
      console.error('Erreur lors de l\'impression du PDF:', error)
      alert('Erreur lors de l\'impression du PDF')
    }
  }

  const shareCertificatePDF = async (certificate: Certificate) => {
    try {
      const pdfData = pdfs[certificate.id] || await generateCertificatePDF(certificate)
      await shareCertificatePDF(pdfData, certificate)
    } catch (error) {
      console.error('Erreur lors du partage du PDF:', error)
      alert('Erreur lors du partage du PDF')
    }
  }

  const emailCertificatePDF = async (certificate: Certificate) => {
    try {
      const pdfData = pdfs[certificate.id] || await generateCertificatePDF(certificate)
      emailCertificatePDF(pdfData, certificate)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du PDF par email:', error)
      alert('Erreur lors de l\'envoi du PDF par email')
    }
  }

  const generateBatchCertificatesPDF = async () => {
    try {
      const selectedCertificatesData = certificates.filter(c => selectedCertificatesForBatch.includes(c.id))
      const formations = mockFormations
      
      const batchPdf = await generateBatchCertificatesPDF(selectedCertificatesData, formations)
      downloadCertificatePDF(batchPdf, `certificats-batch-${Date.now()}.pdf`)
      
      alert(`${selectedCertificatesForBatch.length} certificats générés avec succès!`)
      setSelectedCertificatesForBatch([])
      setShowBatchActions(false)
    } catch (error) {
      console.error('Erreur lors de la génération en lot:', error)
      alert('Erreur lors de la génération en lot')
    }
  }

  const generateStatsPDF = async () => {
    try {
      const formations = mockFormations
      const statsPdf = await generateCertificateStatsPDF(certificates, formations)
      downloadCertificatePDF(statsPdf, `stats-certificats-${Date.now()}.pdf`)
      
      alert('Rapport de statistiques généré avec succès!')
    } catch (error) {
      console.error('Erreur lors de la génération des statistiques:', error)
      alert('Erreur lors de la génération des statistiques')
    }
  }

  const toggleCertificateSelection = (certificateId: number) => {
    setSelectedCertificatesForBatch(prev => 
      prev.includes(certificateId) 
        ? prev.filter(id => id !== certificateId)
        : [...prev, certificateId]
    )
  }

  const selectAllCertificates = () => {
    setSelectedCertificatesForBatch(certificates.map(c => c.id))
  }

  const clearSelection = () => {
    setSelectedCertificatesForBatch([])
  }

  const getFormationTitle = (formationId: number | null) => {
    const formation = mockFormations.find(f => f.id === formationId)
    return formation?.title || 'Formation non spécifiée'
  }

  const getFormationCategory = (formationId: number | null) => {
    const formation = mockFormations.find(f => f.id === formationId)
    return formation?.category || 'Non spécifiée'
  }

  const getStatusColor = (certificate: Certificate) => {
    if (isCertificateValid(certificate)) {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (certificate: Certificate) => {
    if (isCertificateValid(certificate)) {
      return 'Validé'
    }
    return 'Non validé'
  }

  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = !searchTerm || 
      certificate.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
      (filter === 'verified' && certificate.verified) ||
      (filter === 'unverified' && !certificate.verified)
    
    const matchesType = selectedType === 'all' || certificate.type === selectedType
    
    return matchesSearch && matchesFilter && matchesType
  })

  const certificateTypes = [
    { id: 'all', name: 'Tous les types', count: certificates.length },
    { id: 'COMPLETION', name: 'Complétion', count: certificates.filter(c => c.type === 'COMPLETION').length },
    { id: 'EXCELLENCE', name: 'Excellence', count: certificates.filter(c => c.type === 'EXCELLENCE').length },
    { id: 'MASTERCLASS', name: 'Masterclass', count: certificates.filter(c => c.type === 'MASTERCLASS').length },
    { id: 'WORKSHOP', name: 'Workshop', count: certificates.filter(c => c.type === 'WORKSHOP').length },
    { id: 'SPECIALIZATION', name: 'Spécialisation', count: certificates.filter(c => c.type === 'SPECIALIZATION').length }
  ]

  const stats = {
    total: certificates.length,
    verified: certificates.filter(c => c.verified).length,
    unverified: certificates.filter(c => !c.verified).length,
    issuedThisMonth: certificates.filter(c => {
      const certDate = new Date(c.issuedAt)
      const now = new Date()
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear()
    }).length,
    averageScore: 0 // Would calculate from actual data
  }

  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newCertificate = await response.json()
        setCertificates(prev => [newCertificate, ...prev])
        setShowCreateForm(false)
        setFormData({
          studentEmail: '',
          formationId: 1,
          grade: 0,
          completionDate: ''
        })
      }
    } catch (error) {
      console.error('Erreur lors de la génération du certificat:', error)
    }
  }

  const handleUpdateCertificateStatus = async (certificateId: number, status: string) => {
    try {
      const response = await fetch('/api/admin/certificates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ certificateId, status })
      })

      if (response.ok) {
        setCertificates(prev => prev.map(cert => 
          cert.id === certificateId ? { ...cert, status: status as any } : cert
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600'
    if (grade >= 12) return 'text-blue-600'
    if (grade >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des certificats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="mb-8 sm:mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Gestion des Certificats
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Générez et gérez les certificats des étudiants
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Générer un certificat
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total certificats</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Générés</p>
              <p className="text-2xl font-bold text-blue-600">
                {certificates.filter(c => c.status === 'generated').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Téléchargés</p>
              <p className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.status === 'downloaded').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vérifiés</p>
              <p className="text-2xl font-bold text-purple-600">
                {certificates.filter(c => c.status === 'verified').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Révoqués</p>
              <p className="text-2xl font-bold text-red-600">
                {certificates.filter(c => c.status === 'revoked').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom, email, formation..."
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              id="status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="generated">Générés</option>
              <option value="downloaded">Téléchargés</option>
              <option value="verified">Vérifiés</option>
              <option value="revoked">Révoqués</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredCertificates.length}</span> certificat(s) trouvé(s)
            </div>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-6">
        {filteredCertificates.map((certificate) => (
          <div key={certificate.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Certificat - {certificate.formationTitle}
                  </h3>
                  <p className="text-gray-600 mb-2">{certificate.formationCategorie}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>👤 {certificate.studentName}</span>
                    <span>📅 {certificate.studentEmail}</span>
                    <span>📅 {new Date(certificate.completionDate).toLocaleDateString('fr-FR')}</span>
                    <span>📊 Note: <span className={`font-bold ${getGradeColor(certificate.grade)}`}>{certificate.grade}/20</span></span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(certificate)}`}>
                    {getStatusLabel(certificate)}
                  </span>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Informations du certificat</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-sm text-gray-600">ID unique:</p>
                    <p className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {selectedCertificate?.uniqueId}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date de génération:</span>
                    <p className="font-medium">{new Date(certificate.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Délivré par:</span>
                    <p className="font-medium">{certificate.issuedBy}</p>
                  </div>
                  {certificate.revokedAt && (
                    <div>
                      <span className="text-gray-600">Date de révocation:</span>
                      <p className="font-medium text-red-600">
                        {new Date(certificate.revokedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Code QR de vérification</h4>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Scannez ce code QR pour vérifier l'authenticité
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setSelectedCertificate(certificate)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir les détails
                </button>
                <button
                  onClick={() => {
                    // Simuler le téléchargement
                  const link = document.createElement('a')
                  link.href = certificate.certificateUrl
                  link.download = `certificat-${certificate.uniqueId}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)

                  // Mettre à jour le statut
                  setCertificates(prev => prev.map(cert => 
                    cert.id === certificate.id 
                      ? { ...cert, status: 'downloaded' as const }
                      : cert
                  ))
                }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Télécharger
                </button>
                <button
                  onClick={() => {
                    // Simuler la vérification
                    navigator.clipboard.writeText(certificate.uniqueId)
                    alert('Code de vérification copié dans le presse-papiers!')
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Copier le code
                </button>
                {certificate.status === 'generated' && (
                  <button
                    onClick={() => handleUpdateCertificateStatus(certificate.id, 'downloaded')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Marquer comme téléchargé
                  </button>
                )}
                {certificate.status === 'downloaded' && (
                  <button
                    onClick={() => handleUpdateCertificateStatus(certificate.id, 'verified')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Marquer comme vérifié
                  </button>
                )}
                {certificate.status === 'verified' && (
                  <button
                    onClick={() => handleUpdateCertificateStatus(certificate.id, 'revoked')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Révoquer
                  </button>
                )}
                {certificate.status === 'revoked' && (
                  <button
                    onClick={() => handleUpdateCertificateStatus(certificate.id, 'generated')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Réactiver
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCertificates.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <span className="text-6xl mb-4 block">🎓</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun certificat disponible</h3>
          <p className="text-gray-600">
            {filter !== 'all' 
              ? 'Essayez de modifier le filtre pour voir plus de certificats.'
              : 'Aucun certificat n\'a été généré pour le moment.'
            }
          </p>
        </div>
      )}

      {/* Create Certificate Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Générer un certificat
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleGenerateCertificate} className="space-y-6">
                <div>
                  <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email de l'étudiant *
                  </label>
                  <select
                    id="studentEmail"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez un étudiant</option>
                    <option value="alice.dupont@example.com">alice.dupont@example.com</option>
                    <option value="bob.martin@example.com">bob.martin@example.com</option>
                    <option value="carol.johnson@example.com">carol.johnson@example.com</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="formationId" className="block text-sm font-medium text-gray-700 mb-2">
                    Formation *
                  </label>
                  <select
                    id="formationId"
                    value={formData.formationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, formationId: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={1}>Développement Web</option>
                    <option value={2}>Marketing Digital</option>
                    <option value={3}>Gestion de Projet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    Note finale *
                  </label>
                  <input
                    type="number"
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="20"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de complétion *
                  </label>
                  <input
                    type="date"
                    id="completionDate"
                    value={formData.completionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Générer le certificat
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails du certificat
                </h2>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border-2 border-blue-200">
                  <div className="text-center mb-6">
                    <span className="text-6xl mb-4 block">🎓</span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">CERTIFICAT DE RÉUSSITE</h3>
                    <p className="text-gray-600">CJ DTC - Centre de Formation Professionnelle</p>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-700 mb-2">
                      <strong>Certifie que</strong>
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedCertificate.studentName}
                    </p>
                    <p className="text-gray-600">{selectedCertificate.studentEmail}</p>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-700 mb-2">
                      <strong>A réussi avec succès la formation</strong>
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedCertificate.formationTitle}
                    </p>
                    <p className="text-gray-600">{selectedCertificate.formationCategorie}</p>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-lg text-gray-700 mb-2">
                      <strong>Avec la note de</strong>
                    </p>
                    <p className={`text-3xl font-bold ${getGradeColor(selectedCertificate.grade)}`}>
                      {selectedCertificate.grade}/20
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      <p>Date de complétion</p>
                      <p className="font-medium">
                        {new Date(selectedCertificate.completionDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>ID unique</p>
                      <p className="font-mono text-xs">
                        {selectedCertificate.uniqueId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      // Simuler le téléchargement
                      const link = document.createElement('a')
                      link.href = selectedCertificate.certificateUrl
                      link.download = `certificat-${selectedCertificate.uniqueId}.pdf`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)

                      // Mettre à jour le statut
                      setCertificates(prev => prev.map(cert => 
                        cert.id === selectedCertificate.id 
                          ? { ...cert, status: 'downloaded' as const }
                          : cert
                      ))
                      setSelectedCertificate(null)
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📥 Télécharger le PDF
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCertificate(null)
                      // setVerificationCode(selectedCertificate.uniqueId)
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔍 Vérifier ce certificat
                  </button>
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
