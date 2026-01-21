'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../components/Breadcrumbs'

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export default function ActualitesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des articles')
      }
      const data = await response.json()
      // Filtrer uniquement les articles publiés
      const publishedArticles = data.filter((article: Article) => article.published)
      setArticles(publishedArticles)
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Actualités' }]} />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement des actualités...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Actualités' }]} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchArticles}
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
      <Breadcrumbs items={[{ label: 'Actualités' }]} />
      <h1 className="text-4xl md:text-5xl font-bold text-cjblue mb-12 text-center">Actualités</h1>

      {articles.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-6 0l-2 2m2-2l2 2m-2-2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8h6z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune actualité disponible</h3>
          <p className="text-gray-600 mb-6">Revenez bientôt pour découvrir nos dernières nouvelles.</p>
          <Link href="/fr/contact" className="inline-flex items-center px-6 py-3 bg-cjblue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Nous contacter
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <Link href={`/fr/actualites/${article.slug}`} className="block">
                {article.imageUrl && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Nouveau
                    </span>
                    <time className="text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {article.title}
                  </h2>

                  {article.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cjblue font-medium">
                      Lire la suite →
                    </span>
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs">Lire</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
