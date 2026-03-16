import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react'
import { prisma } from '../../../../lib/prisma'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import { generatePageMetadata } from '../../../../components/PageMetadata'
import { getIntlLocale, resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

interface PageProps {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string }
}

const copy = publicMessages.newsDetail

function extractNewsIdFromSlug(raw: string) {
  return raw.split('-')[0]
}

function toPlainText(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function findNewsBySlug(slug: string) {
  const id = extractNewsIdFromSlug(slug)
  return (prisma as any).news.findFirst({
    where: {
      id,
      published: true,
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]
  const news = await findNewsBySlug(resolvedParams.slug)

  if (!news) {
    return generatePageMetadata({
      title: t.metadataMissingTitle,
      description: t.metadataMissingDescription,
      noIndex: true,
    })
  }

  const excerpt = toPlainText(news.content || '').slice(0, 160)

  return generatePageMetadata({
    title: news.title,
    description: excerpt || t.metadataFallbackDescription,
    keywords: ['news', news.title, news.category || 'CJ DTC'],
    image: news.imageData || '/logo.png',
  })
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]
  const news = await findNewsBySlug(resolvedParams.slug)

  if (!news) {
    notFound()
  }

  const publicationDate = new Date(news.publicationDate || news.createdAt).toLocaleDateString(getIntlLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const tags = (news.tags || '')
    .split(',')
    .map((tag: string) => tag.trim())
    .filter(Boolean)

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: t.breadcrumb, href: `/${locale}/actualites` },
            { label: news.title },
          ]}
        />

        <article className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
          {news.imageData ? (
            <div className="h-72 w-full bg-slate-100 sm:h-96">
              <img src={news.imageData} alt={news.title} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {news.category || t.defaultCategory}
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                <CalendarDays className="h-4 w-4" />
                {t.publishedOn} {publicationDate}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-cjblue sm:text-4xl lg:text-5xl">{news.title}</h1>

            {tags.length > 0 ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Tag className="h-4 w-4 text-cjblue" />
                  {t.tags}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="prose prose-slate mt-8 max-w-none prose-headings:text-slate-950 prose-a:text-cjblue prose-strong:text-slate-950" dangerouslySetInnerHTML={{ __html: news.content || '' }} />

            <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
              <Link
                href={`/${locale}/actualites`}
                className="inline-flex items-center gap-2 rounded-xl border border-cjblue px-4 py-2.5 text-sm font-semibold text-cjblue transition hover:bg-cjblue hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.backToNews}
              </Link>
              <Link
                href={`/${locale}/actualites`}
                className="inline-flex items-center rounded-xl bg-cjblue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                {t.moreNews}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-cjblue"
              >
                {t.contact}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
