'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Certificate {
  id: number
  studentName: string
  studentEmail: string
  formationTitle: string
  formationCategorie: string
  completionDate: string
  grade: number
  uniqueId: string
  qrCodeUrl: string
  certificateUrl: string
  status: 'generated' | 'downloaded' | 'verified' | 'revoked'
  createdAt: string
  issuedBy: string
  revokedAt?: string
}

export default function AdminCertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    studentEmail: '',
    formationId: 1,
    grade: 0,
    completionDate: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'generated' | 'downloaded' | 'verified' | 'revoked'>('all')

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/admin/certificates')
      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error)
    } finally {
      setLoading(false)
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800'
      case 'downloaded': return 'bg-green-100 text-green-800'
      case 'verified': return 'bg-purple-100 text-purple-800'
      case 'revoked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'generated': return 'Généré'
      case 'downloaded': return 'Téléchargé'
      case 'verified': return 'Vérifié'
      case 'revoked': return 'Révoqué'
      default: return status
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600'
    if (grade >= 12) return 'text-blue-600'
    if (grade >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = `${cert.studentName} ${cert.studentEmail} ${cert.formationTitle}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filter === 'all' || cert.status === filter
    return matchesSearch && matchesStatus
  })

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
