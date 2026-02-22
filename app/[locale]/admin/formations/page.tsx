'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Formation {
  id: number
  title: string
  description: string
  categorie: string
  duree: string
  modules: string
  methodes: string
  certification: string
  statut: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  _count: {
    enrollments: number
  }
}

export default function AdminFormationsPage() {
  const { data: session } = useSession()
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categorie: '',
    duree: '',
    modules: '',
    methodes: '',
    certification: '',
    statut: 'brouillon'
  })

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      const data = await response.json()
      setFormations(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFormation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newFormation = await response.json()
        setFormations(prev => [newFormation, ...prev])
        setShowCreateForm(false)
        setFormData({
          title: '',
          description: '',
          categorie: '',
          duree: '',
          modules: '',
          methodes: '',
          certification: '',
          statut: 'brouillon'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error)
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/formations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: newStatus })
      })

      if (response.ok) {
        const updatedFormation = await response.json()
        setFormations(prev => 
          prev.map(f => f.id === id ? updatedFormation : f)
        )
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const handleDeleteFormation = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return
    }

    try {
      const response = await fetch(`/api/formations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFormations(prev => prev.filter(f => f.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error)
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'bg-gray-100 text-gray-800'
      case 'publie': return 'bg-green-100 text-green-800'
      case 'archive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'Brouillon'
      case 'publie': return 'Publié'
      case 'archive': return 'Archivé'
      default: return statut
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des formations...</p>
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
            Gestion des formations
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Créez et gérez les programmes de formation
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle formation
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total formations</p>
              <p className="text-2xl font-bold text-gray-900">{formations.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Publiées</p>
              <p className="text-2xl font-bold text-green-600">
                {formations.filter(f => f.statut === 'publie').length}
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
              <p className="text-sm text-gray-600">Brouillons</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formations.filter(f => f.statut === 'brouillon').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total inscrits</p>
              <p className="text-2xl font-bold text-purple-600">
                {formations.reduce((sum, f) => sum + f._count.enrollments, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formations List */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formation
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrits
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
              {formations.map((formation) => (
                <tr key={formation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formation.title}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {formation.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formation.categorie}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formation.duree}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formation._count.enrollments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(formation.statut)}`}>
                      {getStatusLabel(formation.statut)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedFormation(formation)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Voir détails
                      </button>
                      
                      {formation.statut === 'brouillon' && (
                        <button
                          onClick={() => handleUpdateStatus(formation.id, 'publie')}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Publier
                        </button>
                      )}
                      
                      {formation.statut === 'publie' && (
                        <button
                          onClick={() => handleUpdateStatus(formation.id, 'archive')}
                          className="text-orange-600 hover:text-orange-900 font-medium"
                        >
                          Archiver
                        </button>
                      )}
                      
                      {formation.statut === 'archive' && (
                        <button
                          onClick={() => handleUpdateStatus(formation.id, 'publie')}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Réactiver
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteFormation(formation.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Formation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nouvelle formation
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

              <form onSubmit={handleCreateFormation} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      id="categorie"
                      value={formData.categorie}
                      onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="duree" className="block text-sm font-medium text-gray-700 mb-2">
                      Durée
                    </label>
                    <input
                      type="text"
                      id="duree"
                      value={formData.duree}
                      onChange={(e) => setFormData(prev => ({ ...prev, duree: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ex: 3 mois, 40h"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="modules" className="block text-sm font-medium text-gray-700 mb-2">
                    Modules
                  </label>
                  <textarea
                    id="modules"
                    value={formData.modules}
                    onChange={(e) => setFormData(prev => ({ ...prev, modules: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Liste des modules..."
                  />
                </div>

                <div>
                  <label htmlFor="methodes" className="block text-sm font-medium text-gray-700 mb-2">
                    Méthodes pédagogiques
                  </label>
                  <textarea
                    id="methodes"
                    value={formData.methodes}
                    onChange={(e) => setFormData(prev => ({ ...prev, methodes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Méthodes d'enseignement..."
                  />
                </div>

                <div>
                  <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-2">
                    Certification
                  </label>
                  <input
                    type="text"
                    id="certification"
                    value={formData.certification}
                    onChange={(e) => setFormData(prev => ({ ...prev, certification: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type de certification..."
                  />
                </div>

                <div>
                  <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    id="statut"
                    value={formData.statut}
                    onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                    <option value="archive">Archivé</option>
                  </select>
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
                    Créer la formation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Formation Detail Modal */}
      {selectedFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedFormation.title}
                </h2>
                <button
                  onClick={() => setSelectedFormation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Catégorie</p>
                      <p className="font-medium">{selectedFormation.categorie}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Durée</p>
                      <p className="font-medium">{selectedFormation.duree}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedFormation.statut)}`}>
                        {getStatusLabel(selectedFormation.statut)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nombre d'inscrits</p>
                      <p className="font-medium">{selectedFormation._count.enrollments}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700">{selectedFormation.description}</p>
                </div>

                {selectedFormation.modules && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Modules</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedFormation.modules}</p>
                  </div>
                )}

                {selectedFormation.methodes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Méthodes pédagogiques</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedFormation.methodes}</p>
                  </div>
                )}

                {selectedFormation.certification && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Certification</h3>
                    <p className="text-gray-700">{selectedFormation.certification}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Link
                    href={`/admin/inscriptions?formation=${selectedFormation.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir les inscriptions
                  </Link>
                  <button
                    onClick={() => setSelectedFormation(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
