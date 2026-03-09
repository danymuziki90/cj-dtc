'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FormattedDate } from './FormattedDate'

interface NewsItem {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  imageDataUrl: string | null
  category: string
  publicationDate: string
}

interface NewsResponse {
  news: NewsItem[]
}

export default function RecentArticles() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'
  const [articles, setArticles] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/news?limit=3&published=true', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = (await res.json()) as NewsResponse
        setArticles(data.news || [])
      } catch (err) {
        console.error('Error fetching articles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 h-10 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-6 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
                <div className="h-48 w-full bg-gray-200" />
                <div className="space-y-4 p-6">
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                  <div className="h-6 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                  <div className="mt-4 h-10 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-cjblue">Nos dernières actualités</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Restez informe des dernieres nouvelles, tendances et annonces du centre CJ DTC.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {articles.map((article) => {
            const excerpt = article.excerpt || article.content.substring(0, 150)

            return (
              <Link key={article.id} href={`/${locale}/actualites/${article.slug}`} className="group">
                <article className="transform overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-cjblue to-blue-600">
                    {article.imageDataUrl ? (
                      <img
                        src={article.imageDataUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-4xl text-white/70">NEWS</div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-[var(--cj-red)] px-3 py-1 text-xs font-semibold text-white">
                      {article.category || 'Actualité'}
                    </div>
                  </div>

                  <div className="flex h-72 flex-col p-6">
                    <time className="mb-2 text-xs uppercase tracking-wider text-gray-400">
                      <FormattedDate
                        date={article.publicationDate}
                        options={{ year: 'numeric', month: 'long', day: 'numeric' } as any}
                      />
                    </time>

                    <h3 className="mb-3 line-clamp-2 text-xl font-bold text-cjblue transition-colors group-hover:text-[var(--cj-red)]">
                      {article.title}
                    </h3>

                    <p className="mb-4 flex-grow line-clamp-4 text-sm text-gray-600">
                      {excerpt}
                      {excerpt.length >= 150 && '...'}
                    </p>

                    <div className="mt-auto border-t border-gray-200 pt-4">
                      <button className="flex w-full items-center justify-center gap-2 rounded-lg py-2 font-semibold text-[var(--cj-blue)] transition-colors group-hover:text-[var(--cj-red)] hover:bg-blue-50">
                        Lire l'article
                        <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/actualites`}
            className="inline-block rounded-lg bg-[var(--cj-blue)] px-8 py-3 font-semibold text-white transition-colors hover:bg-[var(--cj-red)]"
          >
            Voir tous les articles
          </Link>
        </div>
      </div>
    </section>
  )
}
