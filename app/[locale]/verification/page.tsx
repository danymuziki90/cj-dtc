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
  Download,
  Share2,
  QrCode,
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

export default function VerificationPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [recentVerifications, setRecentVerifications] = useState([])

  // Mock data - would come from API
  const mockCertificate = {
    id: 'CERT-2024-001',
    certificateNumber: 'CJ-DTC-2024-0001',
    qrCode: 'CJ-DTC-2024-0001',
    verificationUrl: 'https://cjdtc.com/verification/CJ-DTC-2024-0001',
    holderName: 'Marie Mwamba',
    holderEmail: 'marie.mwamba@email.com',
    formationId: '1',
    formationTitle: 'Management des Ressources Humaines',
    formationType: 'Certification',
    sessionId: '1',
    sessionTitle: 'Management RH - Session 3',
    instructor: 'Dr. Marie Mwamba',
    instructorTitle: 'Expert en RH internationale',
    type: 'COMPLETION',
    status: 'ISSUED',
    grade: 'A',
    score: 92,
    credits: 15,
    issuedAt: '2024-01-20',
    validUntil: '2027-01-20',
    issuedBy: 'Admin CJ DTC',
    pdfUrl: '/certificates/CJ-DTC-2024-0001.pdf',
    blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
    digitalSignature: 'SIG_2024_001_ABC123',
    verificationCount: 15,
    lastVerifiedAt: '2024-01-28',
    description: 'Certification en Management des Ressources Humaines attestant la maîtrise des stratégies RH modernes adaptées au contexte africain.',
    objectives: [
      'Développer une stratégie RH alignée sur les objectifs business',
      'Maîtriser la gestion des talents et de la performance',
      'Implémenter des systèmes de rémunération équitables',
      'Gérer le changement et la transformation organisationnelle'
    ],
    skills: [
      'Stratégie RH',
      'Gestion des talents',
      'Rémunération et avantages',
      'Transformation organisationnelle',
      'Leadership RH',
      'Analyse de données RH'
    ]
  }

  const stats = {
    totalCertificates: 89,
    issuedThisMonth: 12,
    verificationCount: 1247,
    averageScore: 87.5,
    completionRate: 95,
    satisfactionRate: 4.8
  }

  const handleVerifyCertificate = async () => {
    if (!certificateNumber.trim()) {
      setVerificationResult({
        success: false,
        error: 'Veuillez entrer un numéro de certificat valide'
      })
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock verification - in real implementation, this would call an API
    if (certificateNumber === 'CJ-DTC-2024-0001' || certificateNumber === 'CJ-DTC-2024-0002') {
      setVerificationResult({
        success: true,
        certificate: mockCertificate
      })
      
      // Add to recent verifications
      setRecentVerifications(prev => [
        {
          id: Date.now(),
          certificateNumber,
          verifiedAt: new Date().toISOString(),
          holderName: mockCertificate.holderName,
          formationTitle: mockCertificate.formationTitle
        },
        ...prev.slice(0, 4) // Keep only last 5
      ])
    } else {
      setVerificationResult({
        success: false,
        error: 'Certificat non trouvé. Veuillez vérifier le numéro et réessayer.'
      })
    }
    
    setIsLoading(false)
  }

  const handleDownloadCertificate = (certificate) => {
    // In real implementation, this would download the PDF
    console.log('Downloading certificate:', certificate.certificateNumber)
    window.open(certificate.pdfUrl, '_blank')
  }

  const handleShareCertificate = (certificate) => {
    // In real implementation, this would share the certificate
    const shareUrl = certificate.verificationUrl
    if (navigator.share) {
      navigator.share({
        title: `Certificat - ${certificate.holderName}`,
        text: `Vérifiez mon certificat en ${certificate.formationTitle}`,
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Lien de vérification copié dans le presse-papiers!')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED': return 'bg-green-100 text-green-800'
      case 'VERIFIED': return 'bg-blue-100 text-blue-800'
      case 'REVOKED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

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
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Vérification de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Certificats
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Vérifiez l'authenticité des certificats CJ DTC grâce à notre système de vérification sécurisé avec QR codes
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCertificates}</div>
                <div className="text-sm text-gray-600">Certificats émis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.issuedThisMonth}</div>
                <div className="text-sm text-gray-600">Ce mois</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.verificationCount}</div>
                <div className="text-sm text-gray-600">Vérifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.averageScore}%</div>
                <div className="text-sm text-gray-600">Score moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600">Taux de réussite</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{stats.satisfactionScore}</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vérifier un Certificat
            </h2>
            <p className="text-gray-600">
              Entrez le numéro de certificat ou scannez le QR code pour vérifier l'authenticité
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Numéro de certificat (ex: CJ-DTC-2024-0001)"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyCertificate()}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              <button
                onClick={handleVerifyCertificate}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Vérification en cours...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Vérifier le certificat</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Code Scanner Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <QrCode className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Scanner QR Code</h4>
                  <p className="text-sm text-blue-700">
                    Vous pouvez également scanner le QR code sur le certificat pour une vérification instantanée
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="mb-12">
            {verificationResult.success ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8" />
                      <div>
                        <h3 className="text-2xl font-bold">Certificat Valide</h3>
                        <p className="text-green-100">L'authenticité du certificat a été confirmée</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-100">Vérifié le</div>
                      <div className="text-lg font-semibold">
                        {new Date().toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column - Certificate Info */}
                    <div>
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Informations du Certificat
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Numéro de certificat</span>
                            <span className="font-medium text-gray-900">
                              {verificationResult.certificate.certificateNumber}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Type de certificat</span>
                            <span className="font-medium text-gray-900">
                              {verificationResult.certificate.type}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Statut</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(verificationResult.certificate.status)}`}>
                              {verificationResult.certificate.status}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Note</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(verificationResult.certificate.grade)}`}>
                              {verificationResult.certificate.grade} ({verificationResult.certificate.score}%)
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Crédits</span>
                            <span className="font-medium text-gray-900">
                              {verificationResult.certificate.credits}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Date d'émission</span>
                            <span className="font-medium text-gray-900">
                              {new Date(verificationResult.certificate.issuedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Validité</span>
                            <span className="font-medium text-gray-900">
                              {new Date(verificationResult.certificate.validUntil).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Émis par</span>
                            <span className="font-medium text-gray-900">
                              {verificationResult.certificate.issuedBy}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Code QR de Vérification
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
                            <QrCode className="w-24 h-24 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 text-center mt-2">
                          {verificationResult.certificate.qrCode}
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Holder & Formation Info */}
                    <div>
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Titulaire du Certificat
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 text-lg">
                                {verificationResult.certificate.holderName}
                              </h5>
                              <p className="text-gray-600">{verificationResult.certificate.holderEmail}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Formation
                        </h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-900 text-lg mb-2">
                            {verificationResult.certificate.formationTitle}
                          </h5>
                          <p className="text-gray-600 text-sm mb-2">
                            {verificationResult.certificate.formationType}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>Instructeur: {verificationResult.certificate.instructor}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Compétences Acquises
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {verificationResult.certificate.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleDownloadCertificate(verificationResult.certificate)}
                          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Télécharger PDF</span>
                        </button>
                        <button
                          onClick={() => handleShareCertificate(verificationResult.certificate)}
                          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Partager</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Verification */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-600" />
                        <div>
                          <h5 className="font-medium text-gray-900">Vérification Blockchain</h5>
                          <p className="text-sm text-gray-600">
                            Ce certificat est enregistré sur la blockchain pour une traçabilité immuable
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Hash Blockchain</p>
                        <p className="text-xs font-mono text-gray-700">
                          {verificationResult.certificate.blockchainHash.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-4">
                    Certificat Non Valide
                  </h3>
                  <p className="text-red-700 mb-6">
                    {verificationResult.error}
                  </p>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">
                      Que faire si vous pensez qu'il s'agit d'une erreur ?
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1 text-left">
                      <li>• Vérifiez que le numéro de certificat est correct</li>
                      <li>• Assurez-vous que le certificat a été émis par CJ DTC</li>
                      <li>• Contactez notre support si le problème persiste</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Verifications */}
        {recentVerifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Vérifications Récentes
            </h3>
            <div className="space-y-4">
              {recentVerifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{verification.certificateNumber}</p>
                      <p className="text-sm text-gray-600">
                        {verification.holderName} - {verification.formationTitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(verification.verifiedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Pourquoi Faire Confiance à Nos Certificats ?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sécurité Maximale</h4>
              <p className="text-sm text-gray-600">
                Chaque certificat est protégé par cryptographie et enregistré sur la blockchain
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Vérification Instantanée</h4>
              <p className="text-sm text-gray-600">
                Scannez le QR code ou entrez le numéro pour une vérification immédiate
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
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

      {/* Footer */}
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
              Système de Vérification de Certificats Sécurisé
            </p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:verification@cjdtc.com" className="text-gray-400 hover:text-white">
                Contact Support
              </a>
              <a href="/fr/a-propos" className="text-gray-400 hover:text-white">
                À Propos
              </a>
              <a href="/fr/contact" className="text-gray-400 hover:text-white">
                Contact
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-8">
              © 2024 CJ DTC. Tous droits réservés. | Certificats vérifiés en temps réel
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
