'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { getIntlLocale, resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

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

const copy = publicMessages.newsList

function formatDate(value: string, locale: 'fr' | 'en') {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: 'long',
  }).format(new Date(value))
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function ActualitesPage() {
  const params = useParams<{ locale: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]

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
      throw new Error(payload.error || t.loadError)
    }

    setNews(payload.news || [])
    setCategories(payload.categories || [])
    setPagination(payload.pagination || { page: 1, pageSize: PAGE_SIZE, total: 0, pageCount: 1 })
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchNews()
      .catch((err) => setError(err instanceof Error ? err.message : t.unexpectedError))
      .finally(() => setLoading(false))
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
        <Breadcrumbs items={[{ label: t.breadcrumb }]} />

        <section className="cj-hero-card mb-8">
          <div className="relative z-10">
            <span className="cj-eyebrow-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
              {t.heroEyebrow}
            </span>
            <h1 className="cj-hero-title mb-4 font-montserrat">{t.heroTitle}</h1>
            <p className="text-base text-blue-100/90 leading-relaxed font-opensans max-w-2xl">{t.heroDescription}</p>
            <div className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
              {loading ? t.loading : `${pagination.total} ${t.totalSuffix}`}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
                {t.searchLabel}
              </label>
              <input
                id="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              />
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
                {t.categoryLabel}
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
                <option value="all">{t.allCategories}</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
                {t.dateLabel}
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
                {t.resetFilters}
              </button>
            </div>
          )}
        </section>

        {error ? <section className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</section> : null}

        {!loading && !error && news.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-cjblue">{t.emptyTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.emptyDescription}</p>
            <Link
              href={`/${locale}/contact`}
              className="mt-5 inline-flex rounded-lg bg-cjblue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              {t.contact}
            </Link>
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="cj-card-interactive overflow-hidden p-0"
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
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {item.category || t.defaultCategory}
                    </span>
                    <time className="text-xs text-slate-500 font-medium font-opensans">{formatDate(item.publicationDate, locale)}</time>
                  </div>

                  <h2 className="text-lg font-black leading-tight text-[var(--cj-blue)] font-montserrat">{item.title}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 font-opensans">{item.excerpt || stripHtml(item.content).slice(0, 150)}...</p>

                  <div className="mt-4 text-xs font-bold text-[var(--cj-red)] uppercase tracking-wider flex items-center gap-1">
                    <span>{t.readMore}</span>
                    <span>→</span>
                  </div>
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
              {t.previous}
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
              {t.next}
            </button>
          </section>
        ) : null}
      </div>
    </div>
  )
}
