'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'

interface Evaluation {
  id: number
  overallRating: number
  overallComment: string | null
  contentRating: number | null
  instructorRating: number | null
  materialRating: number | null
  submittedAt: string
  formation: {
    id: number
    title: string
  }
  enrollment: {
    id: number
    status: string
  }
}

interface Certificate {
  id: number
  code: string
  type: string
  holderName: string
  issuedAt: string
  verified: boolean
  formation: {
    id: number
    title: string
  } | null
}

export default function ResultatsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Récupérer les évaluations (pour l'instant, on simule)
      // TODO: Créer une API qui retourne les évaluations de l'étudiant connecté
      const evalResponse = await fetch('/api/evaluations')
      const evalData = await evalResponse.json()
      setEvaluations(evalData)

      // Récupérer les certificats
      const certResponse = await fetch('/api/certificates')
      const certData = await certResponse.json()
      setCertificates(certData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Résultats & Certifications' }
      ]} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cjblue mb-8">Résultats & Certifications</h1>
        <p className="text-lg text-gray-700 mb-8">
          Consultez vos notes, évaluations et téléchargez vos certificats de formation.
        </p>

        {/* Certificats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cjblue mb-6">Mes Certificats</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue mx-auto"></div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Aucun certificat disponible pour le moment.</p>
              <Link href="/fr/certificates" className="text-cjblue hover:underline">
                Vérifier un certificat
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-cjblue mb-2">
                        {certificate.formation?.title || 'Certificat'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Code: <span className="font-mono">{certificate.code}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Émis le: {new Date(certificate.issuedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {certificate.verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ✓ Vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Link
                      href={`/fr/certificates?code=${certificate.code}`}
                      className="text-cjblue hover:underline text-sm"
                    >
                      Voir le certificat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Évaluations */}
        <div>
          <h2 className="text-2xl font-bold text-cjblue mb-6">Mes Évaluations</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue mx-auto"></div>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Aucune évaluation disponible pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-cjblue mb-2">
                        {evaluation.formation.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Évalué le: {new Date(evaluation.submittedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cjblue">
                        {evaluation.overallRating}/5
                      </div>
                      <div className="text-sm text-gray-600">
                        {renderStars(evaluation.overallRating)}
                      </div>
                    </div>
                  </div>

                  {evaluation.overallComment && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">{evaluation.overallComment}</p>
                    </div>
                  )}

                  {(evaluation.contentRating || evaluation.instructorRating || evaluation.materialRating) && (
                    <div className="mt-4 grid md:grid-cols-3 gap-4 pt-4 border-t">
                      {evaluation.contentRating && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Contenu</p>
                          <p className="text-lg font-semibold">{evaluation.contentRating}/5</p>
                        </div>
                      )}
                      {evaluation.instructorRating && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Formateur</p>
                          <p className="text-lg font-semibold">{evaluation.instructorRating}/5</p>
                        </div>
                      )}
                      {evaluation.materialRating && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Supports</p>
                          <p className="text-lg font-semibold">{evaluation.materialRating}/5</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
