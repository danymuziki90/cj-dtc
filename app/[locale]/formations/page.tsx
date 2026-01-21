'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../components/Breadcrumbs'

interface Formation {
  id: number
  title: string
  slug: string
  description: string
  objectifs?: string
  resultats?: string
  tauxInsertion?: string
  duree?: string
  modules?: string
  methodes?: string
  certification?: string
  categorie?: string
  statut: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFormations()
  }, [])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des formations')
      }
      const data = await response.json()
      // Filtrer uniquement les formations publiées
      const publishedFormations = data.filter((f: Formation) => f.statut === 'publie')
      setFormations(publishedFormations)
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Formations' }]} />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Formations' }]} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchFormations}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: 'Formations' }]} />
      <h1 className="text-4xl md:text-5xl font-bold text-cjblue mb-12 text-center">Formations</h1>

      {formations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune formation disponible</h3>
          <p className="text-gray-600 mb-6">Revenez bientôt pour découvrir nos nouvelles formations.</p>
          <Link href="/fr/contact" className="inline-flex items-center px-6 py-3 bg-cjblue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Nous contacter
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:gap-12">
          {formations.map((formation, index) => (
            <div
              key={formation.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-cjblue leading-tight">
                    {formation.title}
                  </h2>
                  {formation.categorie && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {formation.categorie}
                    </span>
                  )}
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {formation.description}
                </p>

                {formation.objectifs && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-cjblue mb-2">Objectifs</h3>
                    <p className="text-gray-600">{formation.objectifs}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Durée</div>
                    <div className="font-semibold text-cjblue">{formation.duree || 'À définir'}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Modules</div>
                    <div className="font-semibold text-cjblue">{formation.modules || 'À définir'}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Méthodes</div>
                    <div className="font-semibold text-cjblue">{formation.methodes || 'À définir'}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500 mb-1">Certification</div>
                    <div className="font-semibold text-cjblue">{formation.certification || 'À définir'}</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/fr/formations/${formation.slug}`}
                    className="inline-flex items-center px-6 py-3 bg-cjblue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    En savoir plus
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
