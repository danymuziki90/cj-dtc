'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FormattedDate } from '@/components/FormattedDate'
import { Briefcase, ArrowRight, Newspaper } from 'lucide-react'
import { getLocalizedCategory } from '@/lib/i18n/locale'

interface NewsItem {
  id: string
  slug: string
  title: string
  titleEn?: string | null
  excerpt: string
  excerptEn?: string | null
  content: string
  contentEn?: string | null
  imageDataUrl: string | null
  category: string
  publicationDate: string
}

interface NewsAndOpportunitiesProps {
  locale: string
}

export default function NewsAndOpportunities({ locale }: NewsAndOpportunitiesProps) {
  const isFr = locale === 'fr'
  const [articles, setArticles] = useState<NewsItem[]>([])
  const [jobs, setJobs] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      fetch('/api/news?limit=2&published=true').then(r => r.json()).catch(() => ({ news: [] })),
      fetch('/api/news?limit=2&published=true&category=Emplois').then(r => r.json()).catch(() => ({ news: [] }))
    ]).then(([articlesData, jobsData]) => {
      if (active) {
        setArticles(articlesData.news || [])
        setJobs(jobsData.news || [])
        setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="bg-slate-50 py-12 sm:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-8 w-48 mx-auto bg-slate-200 animate-pulse rounded-md mb-6" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-56 bg-slate-200 animate-pulse rounded-3xl" />
            <div className="h-56 bg-slate-200 animate-pulse rounded-3xl" />
          </div>
        </div>
      </section>
    )
  }

  // If no content, don't show section
  if (articles.length === 0 && jobs.length === 0) return null

  return (
    <section className="bg-white py-8 sm:py-10 lg:py-12 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 sm:mb-8 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full border border-[var(--cj-blue)]/20 bg-[var(--cj-blue)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-blue)] mb-2">
            {isFr ? 'Actualités & Opportunités' : 'News & Opportunities'}
          </span>
          <h2 className="text-2xl font-black text-slate-950 sm:text-3xl lg:text-4xl font-montserrat leading-tight">
            {isFr ? 'Restez connecté à ' : 'Stay connected with '}{' '}
            <span className="text-[var(--cj-red)]">
              {isFr ? "notre écosystème." : "our ecosystem."}
            </span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          
          {/* ACTUS */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900 font-montserrat">
                <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--cj-blue)]" />
                {isFr ? 'À la une' : 'Latest News'}
              </h3>
              <Link href={`/${locale}/actualites`} className="text-sm font-bold text-[var(--cj-blue)] hover:text-[var(--cj-red)] transition-colors flex items-center gap-1">
                {isFr ? 'Tout voir' : 'View all'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {articles.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-slate-500 font-opensans">
                {isFr ? 'Aucune actualité récente.' : 'No recent news.'}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {articles.map((article) => {
                  const title = isFr ? article.title : article.titleEn || article.title
                  return (
                  <Link key={article.id} href={`/${locale}/actualites/${article.slug}`} className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      {article.imageDataUrl ? (
                        <img src={article.imageDataUrl} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-[var(--cj-blue)]/10" />
                      )}
                      <div className="absolute top-2 left-2 rounded-full bg-[var(--cj-blue)] px-2.5 py-1 text-[10px] font-bold text-white uppercase">
                        {getLocalizedCategory(article.category, locale) || 'News'}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <time className="mb-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                        <FormattedDate date={article.publicationDate} locale={locale} options={{ year: 'numeric', month: 'short', day: 'numeric' } as any} />
                      </time>
                      <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-[var(--cj-blue)] transition-colors font-montserrat">{title}</h4>
                    </div>
                  </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* EMPLOIS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-900 font-montserrat">
                <Briefcase className="h-6 w-6 text-[var(--cj-red)]" />
                {isFr ? 'Opportunités' : 'Opportunities'}
              </h3>
              <Link href={`/${locale}/actualites?categorie=Emplois`} className="text-sm font-bold text-[var(--cj-blue)] hover:text-[var(--cj-red)] transition-colors flex items-center gap-1">
                {isFr ? 'Toutes les offres' : 'All jobs'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-slate-500 font-opensans">
                {isFr ? 'Aucune offre d\'emploi disponible pour le moment.' : 'No job opportunities available at the moment.'}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const title = isFr ? job.title : job.titleEn || job.title
                  const excerpt = isFr ? job.excerpt : job.excerptEn || job.excerpt
                  return (
                  <Link key={job.id} href={`/${locale}/actualites/${job.slug}`} className="group block rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[var(--cj-red)]/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 group-hover:text-[var(--cj-red)] transition-colors font-montserrat text-lg">{title}</h4>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 uppercase whitespace-nowrap ml-4">
                        {isFr ? 'Nouveau' : 'New'}
                      </span>
                    </div>
                    <time className="mb-3 block text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      <FormattedDate date={job.publicationDate} locale={locale} options={{ year: 'numeric', month: 'long', day: 'numeric' } as any} />
                    </time>
                    <p className="text-sm text-slate-600 line-clamp-2 font-opensans">{excerpt}</p>
                    <div className="mt-4 flex items-center text-sm font-bold text-[var(--cj-red)] group-hover:text-[var(--cj-red-700)] transition-colors">
                      {isFr ? 'Voir l\'offre' : 'View job'} <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                  )
                })}
              </div>
            )}
          </div>
          
        </div>

      </div>
    </section>
  )
}
