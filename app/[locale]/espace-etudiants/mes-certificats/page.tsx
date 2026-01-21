'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'

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
  session: {
    id: number
    startDate: string
    endDate: string
  } | null
}

export default function MesCertificatsPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      // TODO: Filtrer par étudiant connecté
      const response = await fetch('/api/certificates')
      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      completion: 'Certificat de Complétion',
      attendance: 'Certificat de Présence',
      excellence: 'Certificat d\'Excellence'
    }
    return labels[type] || type
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Mes Certificats' }
      ]} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cjblue mb-8">Mes Certificats</h1>
        <p className="text-lg text-gray-700 mb-8">
          Consultez et téléchargez tous vos certificats de formation obtenus.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos certificats...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Aucun certificat disponible pour le moment.</p>
            <Link href="/fr/espace-etudiants" className="text-cjblue hover:underline">
              Retour à l'espace étudiant
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
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-cjblue mb-2">
                      {certificate.formation?.title || 'Certificat'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {getTypeLabel(certificate.type)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Code: <span className="font-mono">{certificate.code}</span>
                    </p>
                  </div>
                  {certificate.verified && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      ✓ Vérifié
                    </span>
                  )}
                </div>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Émis le:</strong> {new Date(certificate.issuedAt).toLocaleDateString('fr-FR')}
                  </p>
                  {certificate.session && (
                    <p className="text-sm text-gray-700">
                      <strong>Session:</strong> {new Date(certificate.session.startDate).toLocaleDateString('fr-FR')} - {new Date(certificate.session.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/fr/certificates?code=${certificate.code}`}
                    className="flex-1 bg-cjblue text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir le certificat
                  </Link>
                  <Link
                    href={`/fr/certificates?code=${certificate.code}`}
                    className="text-cjblue hover:underline text-sm px-4 py-2"
                  >
                    Vérifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
