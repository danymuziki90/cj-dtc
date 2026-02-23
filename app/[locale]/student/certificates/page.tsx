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
  Smartphone
} from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'
import {
  generateCertificateQRCodeDisplay,
  downloadCertificateQRCode,
  shareCertificateQRCode,
  getCertificateTypeColor,
  getGradeColor,
  formatCertificateDate
} from '@/lib/certificates/qr-code/simple'

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

export default function StudentCertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({})

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800'
      case 'downloaded': return 'bg-green-100 text-green-800'
      case 'verified': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'generated': return 'Généré'
      case 'downloaded': return 'Téléchargé'
      case 'verified': return 'Vérifié'
      default: return status
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
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Mes Certificats
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Consultez, téléchargez et vérifiez vos certificats
        </p>
      </div>

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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H2a8 8 0 0 0 6 0z"></path>
                  </svg>
                  Vérification...
                </span>
              ) : (
                'Vérifier'
              )}
            </button>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`mt-6 p-4 rounded-lg ${verificationResult.error
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
                  <p><strong>Nom:</strong> {verificationResult.studentName}</p>
                  <p><strong>Formation:</strong> {verificationResult.formationTitle}</p>
                  <p><strong>Note:</strong> {verificationResult.grade}/20</p>
                  <p><strong>Date:</strong> <FormattedDate date={verificationResult.completionDate} /></p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificates List */}
      <div className="space-y-6">
        {certificates.map((certificate) => (
          <div key={certificate.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
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
                    <span>📅 <FormattedDate date={certificate.completionDate} /></span>
                    <span>📊 Note: <span className={`font-bold ${getGradeColor(certificate.grade)}`}>{certificate.grade}/20</span></span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(certificate.status)}`}>
                    {getStatusLabel(certificate.status)}
                  </span>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Informations du certificat</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID unique:</span>
                    <p className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {certificate.uniqueId}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date de génération:</span>
                    <p className="font-medium"><FormattedDate date={certificate.createdAt} /></p>
                  </div>
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
                  onClick={() => downloadCertificate(certificate)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📥 Télécharger
                </button>
                <button
                  onClick={() => setVerificationCode(certificate.uniqueId)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  🔍 Vérifier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {certificates.length === 0 && (
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
                        <FormattedDate date={selectedCertificate.completionDate} />
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
                    onClick={() => downloadCertificate(selectedCertificate)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📥 Télécharger le PDF
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCertificate(null)
                      setVerificationCode(selectedCertificate.uniqueId)
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
