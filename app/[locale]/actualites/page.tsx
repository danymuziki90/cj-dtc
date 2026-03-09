'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Breadcrumbs from '../../../components/Breadcrumbs'

type NewsItem = {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  author: string
  category: string
  tags: string[]
  imageDataUrl: string | null
  publicationDate: string
}

type NewsResponse = {
  news: NewsItem[]
  categories: string[]
  pagination: {
    page: number
    pageSize: number
    total: number
    pageCount: number
  }
  error?: string
}

const PAGE_SIZE = 9

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
  }).format(new Date(value))
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function ActualitesPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'

  const [news, setNews] = useState<NewsItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [date, setDate] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    pageCount: 1,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [search])

  async function fetchNews(targetPage = page) {
    const params = new URLSearchParams()
    params.set('page', String(targetPage))
    params.set('pageSize', String(PAGE_SIZE))
    params.set('published', 'true')

    if (debouncedSearch) params.set('search', debouncedSearch)
    if (category !== 'all') params.set('category', category)
    if (date) params.set('date', date)

    const response = await fetch(`/api/news?${params.toString()}`, { cache: 'no-store' })
    const payload = (await response.json()) as NewsResponse

    if (!response.ok) {
      throw new Error(payload.error || 'Erreur lors du chargement des actualités.')
    }

    setNews(payload.news || [])
    setCategories(payload.categories || [])
    setPagination(payload.pagination || { page: 1, pageSize: PAGE_SIZE, total: 0, pageCount: 1 })
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchNews()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inattendue'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, category, date])

  const pageNumbers = useMemo(() => {
    if (pagination.pageCount <= 1) return []
    const start = Math.max(1, pagination.page - 2)
    const end = Math.min(pagination.pageCount, start + 4)
    const list: number[] = []
    for (let i = start; i <= end; i += 1) list.push(i)
    return list
  }, [pagination.page, pagination.pageCount])

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Actualités' }]} />

        <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#002D72_0%,#003b96_65%,#E30613_150%)] px-6 py-10 text-white shadow-xl sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-14 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.25em] text-white/85">CJ DTC</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-tight text-white sm:text-6xl">Actualités</h1>
            <p className="mt-3 max-w-3xl text-base text-white/90 sm:text-lg">
              Les annonces, sessions, évolutions et informations importantes du centre.
            </p>
            <div className="mt-5 inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-medium">
              {loading ? 'Chargement...' : `${pagination.total} actualité(s)`}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
                Recherche
              </label>
              <input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Titre ou mot-clé..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              />
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
                Catégorie
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              >
                <option value="all">Toutes</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              />
            </div>
          </div>

          {(search || category !== 'all' || date) && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setDebouncedSearch('')
                  setCategory('all')
                  setDate('')
                  setPage(1)
                }}
                className="text-sm font-medium text-cjblue hover:text-blue-800"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

        {error ? (
          <section className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </section>
        ) : null}

        {!loading && !error && news.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-cjblue">Aucune actualité trouvée</h2>
            <p className="mt-2 text-sm text-slate-600">Ajustez vos filtres ou revenez plus tard.</p>
            <Link
              href={`/${locale}/contact`}
              className="mt-5 inline-flex rounded-lg bg-cjblue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Nous contacter
            </Link>
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/${locale}/actualites/${item.slug}`} className="block">
                <div className="relative h-44 w-full bg-slate-100">
                  {item.imageDataUrl ? (
                    <img src={item.imageDataUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-4xl text-slate-300">📰</div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      {item.category || 'Général'}
                    </span>
                    <time className="text-xs text-slate-500">{formatDate(item.publicationDate)}</time>
                  </div>

                  <h2 className="text-xl font-bold leading-tight text-cjblue">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.excerpt || stripHtml(item.content).slice(0, 170)}</p>

                  <div className="mt-4 text-sm font-semibold text-cjblue">Lire la suite →</div>
                </div>
              </Link>
            </article>
          ))}
        </section>

        {pagination.pageCount > 1 ? (
          <section className="mt-8 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Precedent
            </button>

            <div className="flex flex-wrap gap-1">
              {pageNumbers.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPage(value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    value === page
                      ? 'bg-cjblue text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pageCount))}
              disabled={page >= pagination.pageCount}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Suivant
            </button>
          </section>
        ) : null}
      </div>
    </div>
  )
}

