'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Enrollment {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  status: string
  motivationLetter?: string
  notes?: string
  startDate: string
  createdAt: string
  updatedAt: string
  matricule?: string
  formationId: number
  formation: {
    id: number
    title: string
    description: string
    categorie: string
  }
}

export default function AdminInscriptionsPage() {
  const { data: session } = useSession()
  const [inscriptions, setInscriptions] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInscription, setSelectedInscription] = useState<Enrollment | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchInscriptions()
  }, [])

  const fetchInscriptions = async () => {
    try {
      const response = await fetch('/api/admin/inscriptions')
      const data = await response.json()
      setInscriptions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateInscriptionStatus = async (id: number, status: string, notes?: string, matricule?: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/inscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status, notes, matricule })
      })

      if (response.ok) {
        const updated = await response.json()
        setInscriptions(prev => 
          prev.map(ins => ins.id === id ? updated : ins)
        )
        setSelectedInscription(null)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    } finally {
      setUpdating(false)
    }
  }

  const generateMatricule = (firstName: string, lastName: string, formationId: number): string => {
    const year = new Date().getFullYear()
    const initials = (firstName[0] + lastName[0]).toUpperCase()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `CJ${year}${formationId}${initials}${random}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'accepted': return 'Accepté'
      case 'rejected': return 'Rejeté'
      case 'confirmed': return 'Confirmé'
      case 'completed': return 'Terminé'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des inscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Gestion des inscriptions
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Consultez et gérez toutes les demandes d'inscription
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{inscriptions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {inscriptions.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Acceptées</p>
              <p className="text-2xl font-bold text-green-600">
                {inscriptions.filter(i => i.status === 'accepted').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">
                {inscriptions.filter(i => i.status === 'rejected').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inscriptions List */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidat
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formation
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inscriptions.map((inscription) => (
                <tr key={inscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {inscription.firstName} {inscription.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{inscription.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {inscription.formation.title}
                      </div>
                      <div className="text-sm text-gray-500">{inscription.formation.categorie}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {inscription.matricule ? (
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {inscription.matricule}
                      </span>
                    ) : (
                      <span className="text-gray-400">Non attribué</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inscription.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inscription.status)}`}>
                      {getStatusLabel(inscription.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedInscription(inscription)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de l'inscription
                </h2>
                <button
                  onClick={() => setSelectedInscription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Candidate Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations du candidat</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nom complet</p>
                      <p className="font-medium">{selectedInscription.firstName} {selectedInscription.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedInscription.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">{selectedInscription.phone || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-medium">{selectedInscription.address || 'Non spécifiée'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Matricule</p>
                      <p className="font-medium">
                        {selectedInscription.matricule ? (
                          <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {selectedInscription.matricule}
                          </span>
                        ) : (
                          <span className="text-gray-400">Non attribué</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formation Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Formation choisie</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{selectedInscription.formation.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedInscription.formation.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Catégorie: {selectedInscription.formation.categorie}</p>
                  </div>
                </div>

                {/* Motivation */}
                {selectedInscription.motivationLetter && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Lettre de motivation</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedInscription.motivationLetter}</p>
                    </div>
                  </div>
                )}

                {/* Current Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Statut actuel</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedInscription.status)}`}>
                    {getStatusLabel(selectedInscription.status)}
                  </span>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedInscription.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            const matricule = generateMatricule(
                              selectedInscription.firstName,
                              selectedInscription.lastName,
                              selectedInscription.formationId
                            )
                            updateInscriptionStatus(selectedInscription.id, 'accepted', undefined, matricule)
                          }}
                          disabled={updating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {updating ? 'Traitement...' : 'Accepter et attribuer matricule'}
                        </button>
                        <button
                          onClick={() => updateInscriptionStatus(selectedInscription.id, 'rejected')}
                          disabled={updating}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {updating ? 'Traitement...' : 'Rejeter'}
                        </button>
                      </>
                    )}
                    {selectedInscription.status === 'accepted' && (
                      <button
                        onClick={() => updateInscriptionStatus(selectedInscription.id, 'confirmed')}
                        disabled={updating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {updating ? 'Traitement...' : 'Confirmer'}
                      </button>
                    )}
                    {selectedInscription.status === 'confirmed' && (
                      <button
                        onClick={() => updateInscriptionStatus(selectedInscription.id, 'completed')}
                        disabled={updating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {updating ? 'Traitement...' : 'Marquer comme terminé'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
