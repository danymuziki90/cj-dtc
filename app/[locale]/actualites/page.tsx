'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  publishedAt: Date | string
}

export default function ActualitesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/articles')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des articles')
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data)
        } else {
          setArticles([])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur:', err)
        setError('Impossible de charger les actualités. Veuillez réessayer plus tard.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600">Chargement des actualités...</p>
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
      <h1 className="text-4xl font-bold text-cjblue mb-8">Actualités</h1>
      
      {articles.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Aucun article disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/fr/actualites/${article.slug}`}
              className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold text-cjblue mb-3">{article.title}</h2>
              <p className="text-gray-600 line-clamp-3 mb-4">
                {article.excerpt || 'Aucun extrait disponible.'}
              </p>
              <span className="text-sm text-gray-500">
                {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
