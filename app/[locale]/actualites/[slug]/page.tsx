import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const { slug } = resolvedParams

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

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        href="/fr/actualites" 
        className="text-cjblue hover:underline mb-4 inline-block"
      >
        ← Retour aux actualités
      </Link>

      <article className="mt-6">
        <h1 className="text-4xl font-bold text-cjblue mb-4">{article.title}</h1>
        
        <div className="text-sm text-gray-500 mb-6">
          Publié le {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
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
