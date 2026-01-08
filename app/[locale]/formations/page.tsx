'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Formation {
  id: number
  title: string
  slug: string
  description: string
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/formations')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des formations')
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFormations(data)
        } else {
          setFormations([])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur:', err)
        setError('Impossible de charger les formations. Veuillez réessayer plus tard.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-cjblue mb-8">Nos Formations</h1>
      
      {formations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Aucune formation disponible pour le moment.</p>
          <Link href="/fr/contact" className="text-cjblue hover:underline">
            Contactez-nous pour plus d'informations
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <Link
              key={formation.id}
              href={`/fr/formations/${formation.slug}`}
              className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold text-cjblue mb-3">{formation.title}</h2>
              <p className="text-gray-600 line-clamp-3">
                {formation.description || 'Aucune description disponible.'}
              </p>
              <span className="inline-block mt-4 text-cjblue hover:underline">
                En savoir plus →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
