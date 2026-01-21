'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'

interface Submission {
  id: number
  title: string
  fileName: string
  filePath: string
  fileSize: number
  status: string
  submittedAt: string
  feedback: string | null
  formation: {
    id: number
    title: string
  }
}

interface Formation {
  id: number
  title: string
}

export default function TravauxPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    formationId: '',
    file: null as File | null
  })

  useEffect(() => {
    fetchFormations()
    fetchSubmissions()
  }, [])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      // Extraire les formations uniques des inscriptions
      const uniqueFormations = Array.from(
        new Map(data.map((e: any) => [e.formation.id, e.formation])).values()
      ) as Formation[]
      setFormations(uniqueFormations)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      // Pour l'instant, on simule avec des données vides
      // À remplacer par une vraie API quand le modèle StudentSubmission sera créé
      setSubmissions([])
    } catch (error) {
      console.error('Erreur lors du chargement des travaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file || !formData.title || !formData.formationId) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setUploading(true)
    try {
      const submitData = new FormData()
      submitData.append('file', formData.file)
      submitData.append('title', formData.title)
      submitData.append('formationId', formData.formationId)

      // TODO: Créer l'API route /api/student-submissions
      const response = await fetch('/api/student-submissions', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        alert('Travail soumis avec succès!')
        setShowForm(false)
        setFormData({ title: '', formationId: '', file: null })
        fetchSubmissions()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error || 'Erreur lors de la soumission'}`)
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Erreur lors de la soumission du travail')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: 'Soumis',
      reviewed: 'En révision',
      approved: 'Approuvé',
      rejected: 'Rejeté'
    }
    return labels[status] || status
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Soumission des travaux' }
      ]} />

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-cjblue mb-4">Soumission des Travaux</h1>
            <p className="text-lg text-gray-700">
              Déposez vos travaux pratiques, dossiers et préparations de soutenance.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Annuler' : '+ Nouveau Travail'}
          </button>
        </div>

        {/* Formulaire de soumission */}
        {showForm && (
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Soumettre un Travail</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre du travail *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Ex: TP1 - Gestion des ressources humaines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Formation *</label>
                <select
                  required
                  value={formData.formationId}
                  onChange={(e) => setFormData({ ...formData, formationId: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">Sélectionner une formation</option>
                  {formations.map((formation) => (
                    <option key={formation.id} value={formation.id.toString()}>
                      {formation.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fichier *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full border rounded-lg px-4 py-2"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                />
                {formData.file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Fichier sélectionné: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-cjblue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Envoi en cours...' : 'Soumettre'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des travaux soumis */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des travaux...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Aucun travail soumis pour le moment.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-cjblue hover:underline"
            >
              Soumettre votre premier travail
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-cjblue mb-2">{submission.title}</h3>
                    <p className="text-sm text-gray-600">
                      Formation: {submission.formation.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Soumis le: {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                    {getStatusLabel(submission.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Fichier:</span> {submission.fileName} ({formatFileSize(submission.fileSize)})
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/${submission.filePath}`}
                      download={submission.fileName}
                      className="text-cjblue hover:underline text-sm"
                    >
                      Télécharger
                    </a>
                    {submission.feedback && (
                      <button className="text-cjblue hover:underline text-sm">
                        Voir le feedback
                      </button>
                    )}
                  </div>
                </div>

                {submission.feedback && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-cjblue mb-1">Feedback:</p>
                    <p className="text-sm text-gray-700">{submission.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
