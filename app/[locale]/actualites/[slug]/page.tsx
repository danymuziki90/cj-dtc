import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '../../../../lib/prisma'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import { generatePageMetadata } from '../../../../components/PageMetadata'

interface PageProps {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string }
}

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
  const news = await findNewsBySlug(resolvedParams.slug)

  if (!news) {
    return generatePageMetadata({
      title: 'Actualité introuvable',
      description: "L'actualite demandee n'existe pas.",
      noIndex: true,
    })
  }

  const excerpt = toPlainText(news.content || '').slice(0, 160)

  return generatePageMetadata({
    title: news.title,
    description: excerpt || 'Actualité CJ DTC',
    keywords: ['actualite', 'news', news.title, news.category || 'CJ DTC'],
    image: news.imageData || '/logo.png',
  })
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'fr'
  const news = await findNewsBySlug(resolvedParams.slug)

  if (!news) {
    notFound()
  }

  const publicationDate = new Date(news.publicationDate || news.createdAt).toLocaleDateString('fr-FR', {
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
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Actualités', href: `/${locale}/actualites` },
            { label: news.title },
          ]}
        />

        <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {news.imageData ? (
            <div className="h-72 w-full bg-slate-100 sm:h-96">
              <img src={news.imageData} alt={news.title} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {news.category || 'General'}
              </span>
              <span className="text-xs text-slate-500">Publie le {publicationDate}</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight text-cjblue sm:text-4xl">{news.title}</h1>

            {tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              className="prose prose-slate mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: news.content || '' }}
            />

            <div className="mt-8">
              <Link
                href={`/${locale}/actualites`}
                className="inline-flex rounded-lg border border-cjblue px-4 py-2 text-sm font-semibold text-cjblue hover:bg-cjblue hover:text-white"
              >
                Retour aux actualités
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
