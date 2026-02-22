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
  Target
} from 'lucide-react'
import { 
  generateCertificateQRCodeDisplay, 
  downloadCertificateQRCode, 
  shareCertificateQRCode,
  getCertificateTypeColor,
  formatCertificateDate,
  validateCertificateRequest,
  isCertificateValid
} from '@/lib/certificates/qr-code/simple'
import {
  generateCertificatePDF,
  downloadCertificatePDF,
  printCertificatePDF,
  shareCertificatePDF,
  emailCertificatePDF,
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

export default function CertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({})
  const [pdfs, setPdfs] = useState<Record<number, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('classic')

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
          verified: true,
          userId: 'user-3'
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

  const copyVerificationUrl = (certificate: Certificate) => {
    const url = `https://cjdtc.com/verification/${certificate.code}`
    navigator.clipboard.writeText(url)
    alert('Lien de vérification copié dans le presse-papiers!')
  }

  const verifyCertificate = async () => {
    if (!verificationCode.trim()) return

    setVerifying(true)
    try {
      const response = await fetch(`/api/certificates/verify-simple/${verificationCode}`)
      const data = await response.json()
      
      if (response.ok) {
        setVerificationResult(data)
      } else {
        setVerificationResult({ error: data.error || 'Certificat non trouvé' })
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      setVerificationResult({ error: 'Erreur lors de la vérification' })
    } finally {
      setVerifying(false)
    }
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
      return 'Valide'
    }
    return 'Non valide'
  }

  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = !searchQuery || 
      certificate.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.code.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === 'all' || certificate.type === selectedType
    
    return matchesSearch && matchesType
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
    issuedThisMonth: certificates.filter(c => {
      const certDate = new Date(c.issuedAt)
      const now = new Date()
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear()
    }).length,
    averageScore: 0 // Would calculate from actual data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement de vos certificats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/fr/student" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ChevronRight className="w-5 h-5 rotate-180" />
                <span>Retour</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Mes Certificats</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un certificat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                <span>Filtres</span>
                {(selectedType !== 'all' || searchQuery) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 bg-white">
              <div className="px-6 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de certificat</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {certificateTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-sm text-gray-600">Total Certificats</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.verified}</h3>
              <p className="text-sm text-gray-600">Certificats Validés</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.issuedThisMonth}</h3>
              <p className="text-sm text-gray-600">Ce mois</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <BarChart3 className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.averageScore}%</h3>
              <p className="text-sm text-gray-600">Score Moyen</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Verification Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vérification publique</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="verification" className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                id="verification"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le code unique du certificat"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={verifyCertificate}
                disabled={verifying || !verificationCode.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {verifying ? (
                  <span className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Vérification...</span>
                  </span>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Vérifier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              verificationResult.error 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              {verificationResult.error ? (
                <div className="text-red-700">
                  <p className="font-semibold">❌ Erreur</p>
                  <p className="text-sm">{verificationResult.error}</p>
                </div>
              ) : (
                <div className="text-green-700">
                  <p className="font-semibold">✅ Certificat valide</p>
                  <div className="mt-2 text-sm">
                    <p><strong>Nom:</strong> {verificationResult.certificate?.holderName}</p>
                    <p><strong>Formation:</strong> {verificationResult.certificate?.formationId ? getFormationTitle(verificationResult.certificate.formationId) : 'Non spécifiée'}</p>
                    <p><strong>Type:</strong> {verificationResult.certificate?.type}</p>
                    <p><strong>Date:</strong> {verificationResult.certificate?.issuedAt ? formatCertificateDate(verificationResult.certificate.issuedAt) : 'Non spécifiée'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certificates List */}
        <div className="space-y-6">
          {filteredCertificates.map((certificate) => (
            <div key={certificate.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Certificat - {getFormationTitle(certificate.formationId)}
                    </h3>
                    <p className="text-gray-600 mb-2">{getFormationCategory(certificate.formationId)}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>👤 {certificate.holderName}</span>
                      <span>📅 {certificate.issuedAt ? formatCertificateDate(certificate.issuedAt) : 'Non spécifiée'}</span>
                      <span>🏷️ {certificate.type}</span>
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
                      <span className="text-gray-600">Code unique:</span>
                      <p className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {certificate.code}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date d'émission:</span>
                      <p className="font-medium">{certificate.issuedAt ? formatCertificateDate(certificate.issuedAt) : 'Non spécifiée'}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Code QR de vérification</h4>
                  <div className="flex items-center justify-center">
                    {qrCodes[certificate.id] ? (
                      <img 
                        src={qrCodes[certificate.id]} 
                        alt={`QR Code pour ${certificate.code}`} 
                        className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
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
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les détails
                  </button>
                  <button
                    onClick={() => generateQRCode(certificate)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Générer QR Code
                  </button>
                  <button
                    onClick={() => downloadCertificatePDF(certificate)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                  </button>
                  <button
                    onClick={() => printCertificatePDF(certificate)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Imprimer
                  </button>
                  <button
                    onClick={() => shareCertificatePDF(certificate)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager PDF
                  </button>
                  <button
                    onClick={() => emailCertificatePDF(certificate)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer
                  </button>
                  <button
                    onClick={() => copyVerificationUrl(certificate)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier URL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCertificates.length === 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">🎓</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun certificat disponible</h3>
            <p className="text-gray-600">
              Vous n'avez pas encore de certificat. Terminez vos formations pour en obtenir.
            </p>
          </div>
        )}

        {/* Certificate Detail Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                        {selectedCertificate.holderName}
                      </p>
                      <p className="text-gray-600">{selectedCertificate.userId}</p>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-lg text-gray-700 mb-2">
                        <strong>A réussi avec succès la formation</strong>
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {getFormationTitle(selectedCertificate.formationId)}
                      </p>
                      <p className="text-gray-600">{getFormationCategory(selectedCertificate.formationId)}</p>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-lg text-gray-700 mb-2">
                        <strong>Type de certificat</strong>
                      </p>
                      <p className="text-xl font-bold text-purple-600">
                        {selectedCertificate.type}
                      </p>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-lg text-gray-700 mb-2">
                        <strong>Date d'émission</strong>
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedCertificate.issuedAt ? formatCertificateDate(selectedCertificate.issuedAt) : 'Non spécifiée'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div>
                        <p>Date d'émission</p>
                        <p className="font-medium">
                          {selectedCertificate.issuedAt ? formatCertificateDate(selectedCertificate.issuedAt) : 'Non spécifiée'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>ID unique</p>
                        <p className="font-mono text-xs">
                          {selectedCertificate.code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Code QR de vérification</h4>
                  <div className="flex items-center justify-center">
                    {qrCodes[selectedCertificate.id] ? (
                      <img 
                        src={qrCodes[selectedCertificate.id]} 
                        alt={`QR Code pour ${selectedCertificate.code}`} 
                        className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Scannez ce code QR pour vérifier l'authenticité
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => downloadCertificate(selectedCertificate)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger le QR Code
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCertificate(null)
                      setVerificationCode(selectedCertificate.code)
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Vérifier ce certificat
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
        )}

      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Flag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">CJ DTC</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Système de Certificats Sécurisé
            </p>
            <div className="flex justify-center space-x-6">
              <a href="/fr/a-propos" className="text-gray-400 hover:text-white">
                À Propos
              </a>
              <a href="/fr/contact" className="text-gray-400 hover:text-white">
                Contact
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-8">
              © 2024 CJ DTC. Tous droits réservés. | Certificats générés en temps réel
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
