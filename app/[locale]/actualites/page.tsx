'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Calendar, Newspaper } from 'lucide-react'
import { resolveSiteLocale, getIntlLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'
import Breadcrumbs from '@/components/Breadcrumbs'
import SectionHero from '@/components/ui/SectionHero'
import type { HeroSectionData } from '@/lib/hero/types'

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
  metadata?: {
    contractType?: string
    location?: string
    deadline?: string
    contactEmail?: string
    domain?: string
  }
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

function ActualitesContent() {
  const params = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]

  // Redirect /actualites?categorie=emplois → /emplois
  useEffect(() => {
    const cat = searchParams?.get('categorie') || ''
    if (cat.toLowerCase() === 'emplois') {
      router.replace(`/${locale}/emplois`)
    }
  }, [searchParams, locale, router])

  const [news, setNews] = useState<NewsItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const initialCategory = searchParams?.get('categorie') || 'all'
  const [category, setCategory] = useState(initialCategory)
  const [date, setDate] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    pageCount: 1,
  })
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null)

  useEffect(() => {
    fetch('/api/hero-images?pageKey=actualites')
      .then((r) => r.json())
      .then((data) => setHeroData(data))
      .catch(() => {})
  }, [])

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
    const fetchedCategories = payload.categories || []
    setCategories(fetchedCategories)
    
    // Normalize category case if there's a match
    if (category !== 'all') {
      const exactMatch = fetchedCategories.find(c => c.toLowerCase() === category.toLowerCase())
      if (exactMatch && exactMatch !== category) {
        setCategory(exactMatch)
      }
    }
    
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
      <SectionHero
        image="/img/actu.jpeg"
        imageAlt="Actualités et événements CJ DTC"
        eyebrow={locale === 'fr' ? 'Actualités & Événements' : 'News & Events'}
        title={locale === 'fr' ? 'Actualités et Opportunités' : 'News and Opportunities'}
        description={
          locale === 'fr'
            ? "Découvrez les dernières actualités, événements, annonces et opportunités publiées par CJ Development Training Center."
            : "Explore the latest news, events, announcements and opportunities published by CJ Development Training Center."
        }
        badges={[
          { label: locale === 'fr' ? 'Actualités'       : 'News',         icon: <Newspaper  className="h-3.5 w-3.5" />, color: 'blue'  },
          { label: locale === 'fr' ? 'Événements'       : 'Events',       icon: <Calendar   className="h-3.5 w-3.5" />, color: 'green' },
          { label: locale === 'fr' ? "Offres d'emploi"  : 'Job openings', icon: <Briefcase  className="h-3.5 w-3.5" />, color: 'amber' },
        ]}
        ctas={[
          { label: locale === 'fr' ? 'Voir les actualités'       : 'Browse news',      href: `/${locale}/actualites`          },
          { label: locale === 'fr' ? "Consulter les offres d'emploi" : 'View job offers', href: `/${locale}/emplois`, variant: 'secondary' },
        ]}
        breadcrumbs={[{ label: locale === 'fr' ? 'Actualités' : 'News' }]}
        homeLabel={locale === 'fr' ? 'Accueil' : 'Home'}
        homeHref={`/${locale}`}
        compact
        heroData={heroData}
        locale={locale}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: t.breadcrumb }]} />

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
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {item.category || t.defaultCategory}
                      </span>
                      {item.category?.toLowerCase() === 'emplois' && item.metadata?.contractType ? (
                        <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          {item.metadata.contractType}
                        </span>
                      ) : null}
                    </div>
                    <time className="text-xs text-slate-500 font-medium font-opensans">{formatDate(item.publicationDate, locale)}</time>
                  </div>

                  <h2 className="text-lg font-black leading-tight text-[var(--cj-blue)] font-montserrat">{item.title}</h2>
                  
                  {item.category?.toLowerCase() === 'emplois' && item.metadata?.location ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {item.metadata.location}
                    </div>
                  ) : null}

                  <p className="mt-2 text-xs leading-relaxed text-slate-600 font-opensans">{item.excerpt || stripHtml(item.content).slice(0, 150)}...</p>

                  <div className="mt-4 text-xs font-bold text-[var(--cj-red)] uppercase tracking-wider flex items-center gap-1">
                    <span>{item.category?.toLowerCase() === 'emplois' ? "Voir l'offre" : t.readMore}</span>
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

export default function ActualitesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-10"><span className="animate-pulse font-semibold text-slate-500">Chargement...</span></div>}>
      <ActualitesContent />
    </Suspense>
  )
}
