import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import { generatePageMetadata } from '../../../../components/PageMetadata'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug }
  })

  if (!article) {
    return generatePageMetadata({
      title: 'Article introuvable',
      description: 'L\'article demandé n\'existe pas.',
      noIndex: true,
    })
  }

  const excerpt = article.excerpt || article.content?.substring(0, 160) || ''

  return generatePageMetadata({
    title: article.title,
    description: excerpt,
    keywords: ['actualité', 'news', article.title, 'CJ DTC'],
    image: article.imageUrl || '/logo.png',
  })
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params

  let article = null
  try {
    article = await prisma.article.findUnique({
      where: { slug }
    })
  } catch (error) {
    console.error('Erreur base de données:', error)
  }

  if (!article) {
    notFound()
  }

  const publishedDate = new Date(article.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Breadcrumbs
        items={[
          { label: 'Actualités', href: '/fr/actualites' },
          { label: article.title },
        ]}
      />

      <article className="mt-6">
        <h1 className="text-4xl font-bold text-cjblue mb-4">{article.title}</h1>

        <div className="text-sm text-gray-500 mb-6">
          Publié le {publishedDate}
        </div>

        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {article.content || article.excerpt || 'Aucun contenu disponible pour cet article.'}
          </div>
        </div>
      </article>
    </div>
  )
}
