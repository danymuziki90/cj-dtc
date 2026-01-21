'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'

interface Document {
  id: number
  title: string
  description: string | null
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  category: string
  createdAt: string
  formation: {
    id: number
    title: string
  } | null
}

interface Formation {
  id: number
  title: string
}

export default function SupportsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormation, setSelectedFormation] = useState<string>('')

  useEffect(() => {
    fetchFormations()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [selectedFormation])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      const data = await response.json()
      setFormations(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('isPublic', 'true')
      if (selectedFormation) {
        params.append('formationId', selectedFormation)
      }

      const response = await fetch(`/api/documents?${params}`)
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      syllabus: 'Syllabus',
      presentation: 'Présentation',
      exercise: 'Exercice',
      resource: 'Ressource',
      certificate_template: 'Modèle de certificat'
    }
    return labels[category] || category
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      syllabus: '📚',
      presentation: '📊',
      exercise: '📝',
      resource: '📄',
      certificate_template: '📜'
    }
    return icons[category] || '📄'
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Supports de cours' }
      ]} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cjblue mb-8">Supports de Cours</h1>
        <p className="text-lg text-gray-700 mb-8">
          Téléchargez tous les supports pédagogiques de vos formations : syllabus, présentations, exercices et ressources.
        </p>

        {/* Filtre par formation */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium mb-2">Filtrer par formation</label>
          <select
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="w-full md:w-1/3 border rounded-lg px-4 py-2"
          >
            <option value="">Toutes les formations</option>
            {formations.map((formation) => (
              <option key={formation.id} value={formation.id.toString()}>
                {formation.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des supports...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Aucun support disponible pour le moment.</p>
            <Link href="/fr/espace-etudiants" className="text-cjblue hover:underline">
              Retour à l'espace étudiant
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <div
                key={document.id}
                className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getCategoryIcon(document.category)}</div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {getCategoryLabel(document.category)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-cjblue mb-2">{document.title}</h3>
                {document.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{document.description}</p>
                )}

                {document.formation && (
                  <p className="text-sm text-gray-500 mb-4">
                    Formation: {document.formation.title}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(document.fileSize)}
                  </span>
                  <a
                    href={`/${document.filePath}`}
                    download={document.fileName}
                    className="bg-cjblue text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Télécharger
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
