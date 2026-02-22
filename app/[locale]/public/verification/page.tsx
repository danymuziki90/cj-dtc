'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Award, 
  CheckCircle, 
  X, 
  Calendar, 
  User, 
  BookOpen,
  Shield,
  Globe,
  Flag,
  ExternalLink,
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  Target
} from 'lucide-react'

// QR Code services
import { 
  generateCertificateQRCodeDisplay, 
  downloadCertificateQRCode, 
  shareCertificateQRCode,
  getCertificateTypeColor,
  formatCertificateDate,
  validateCertificateRequest,
  isCertificateValid
} from '@/lib/certificates/qr-code/simple'

// Certificate interface (simplified for public verification)
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

// Formation mock data
const mockFormations = [
  { id: 1, title: 'Management des Ressources Humaines', category: 'Certification', description: 'Formation complète en management RH' },
  { id: 2, title: 'Leadership et Management d\'Équipe', category: 'Masterclass', description: 'Leadership transformationnel' },
  { id: 3, title: 'Digital Marketing Stratégique', category: 'Workshop', description: 'Marketing digital avancé' }
]

export default function VerificationPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  const verifyCertificate = async () => {
    if (!verificationCode.trim()) return

    setVerifying(true)
    try {
      const response = await fetch(`/api/certificates/verify-simple/${verificationCode}`)
      const data = await response.json()
      
      if (response.ok) {
        setVerificationResult(data)
        setShowCertificateModal(true)
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

  const copyVerificationUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('Lien de vérification copié dans le presse-papiers!')
  }

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      const qrCode = await generateCertificateQRCodeDisplay(certificate)
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

  const stats = {
    total: 89,
    verified: 72,
    issuedThisMonth: 12,
    verificationCount: 1247,
    averageScore: 87.5,
    completionRate: 95,
    satisfactionRate: 4.8
  }

  const recentVerificationsData = [
    { id: '1', certificateNumber: 'CJ-DTC-2024-0001', holderName: 'Marie Mwamba', verifiedAt: '2024-01-28T15:30:00Z', verificationCount: 15 },
    { id: '2', certificateNumber: 'CJ-DTC-2024-0002', holderName: 'Jean-Pierre Lukoki', verifiedAt: '2024-01-27T14:30:00Z', verificationCount: 8 },
    { id: '3', certificateNumber: 'CJ-DTC-2023-0003', holderName: 'Sarah Kabeya', verifiedAt: '2024-01-26T10:30:00Z', verificationCount: 23 }
  ]
  const recentVerifications = recentVerificationsData.map((verification) => (
    <div key={verification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-900 font-medium">
            {verification.verifiedAt ? new Date(verification.verifiedAt).toLocaleDateString('fr-FR') : 'Non vérifié'}
          </p>
          <p className="text-xs text-gray-500">{verification.certificateNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">#{verification.verificationCount} vérifications</p>
        </div>
      </div>
    </div>
  ))

  const certificateModal = showCertificateModal && selectedCertificate ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Détails du certificat</h2>
            <button onClick={() => setShowCertificateModal(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border-2 border-blue-200">
              <div className="text-center mb-6">
                <span className="text-6xl mb-4 block">🎓</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">CERTIFICAT DE RÉUSSITE</h3>
                <p className="text-gray-600">CJ DTC - Centre de Formation Professionnelle</p>
              </div>
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-2"><strong>Certifie que</strong></p>
                <p className="text-xl font-bold text-gray-900">{selectedCertificate.holderName}</p>
                <p className="text-gray-600">{selectedCertificate.userId}</p>
              </div>
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-2"><strong>A réussi avec succès la formation</strong></p>
                <p className="text-xl font-bold text-blue-600">{getFormationTitle(selectedCertificate.formationId)}</p>
                <p className="text-gray-600">{getFormationCategory(selectedCertificate.formationId)}</p>
              </div>
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-2"><strong>Type de certificat</strong></p>
                <p className="text-xl font-bold text-purple-600">{selectedCertificate.type}</p>
              </div>
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-2"><strong>Date d'émission</strong></p>
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
                  <p className="font-mono text-xs">{selectedCertificate.code}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-6">
            <button onClick={() => downloadCertificate(selectedCertificate)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5 mr-2" /> Télécharger le QR Code
            </button>
            <button onClick={() => { setSelectedCertificate(null); setVerificationCode(selectedCertificate.code); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 mr-2" /> Vérifier ce certificat
            </button>
            <button onClick={() => setSelectedCertificate(null)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <QrCode className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Vérification de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                Certificats
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Vérifiez l'authenticité des certificats CJ DTC grâce à notre système de vérification sécurisé avec QR codes
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
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
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.averageScore}%</h3>
                <p className="text-sm text-gray-600">Score Moyen</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Verification Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vérification Publique</h2>
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Scanner QR Code</h3>
                <p className="text-sm text-gray-600">Scannez instantanément</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Télécharger</h3>
                <p className="text-sm text-gray-600">Téléchargez vos certificats</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Partager</h3>
                <p className="text-sm text-gray-600">Partagez vos certificats</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mb-4">
                  <ExternalLink className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vérification Publique</h3>
                <p className="text-sm text-gray-600">Vérifiez n'importe quel certificat</p>
              </div>
            </div>
          </div>

          {/* Recent Verifications */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Vérifications Récentes</h3>
            <div className="space-y-4">
              {recentVerifications}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Pourquoi Faire Confiance à Nos Certificats ?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sécurité Maximale</h4>
                <p className="text-sm text-gray-600">
                  Chaque certificat est protégé par cryptographie et enregistré sur la blockchain
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Vérification Instantanée</h4>
                <p className="text-sm text-gray-600">
                  Scannez le QR code pour une vérification instantanée
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Reconnaissance Internationale</h4>
                <p className="text-sm text-gray-600">
                  Nos certificats sont reconnus par les entreprises et institutions mondiales
                </p>
              </div>
              </div>
            </div>
        </main>
        {certificateModal}
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
