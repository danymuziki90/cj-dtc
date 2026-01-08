import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string }
}

export default async function FormationDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const { slug } = resolvedParams

  let formation = null
  try {
    formation = await prisma.formation.findUnique({
      where: { slug }
    })
  } catch (error) {
    console.error('Erreur base de données:', error)
  }

  if (!formation) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        href="/fr/formations" 
        className="text-cjblue hover:underline mb-4 inline-block"
      >
        ← Retour aux formations
      </Link>

      <article className="mt-6">
        <h1 className="text-4xl font-bold text-cjblue mb-6">{formation.title}</h1>
        
        <div className="prose max-w-none mb-8">
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            {formation.description || 'Aucune description disponible pour cette formation.'}
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          <Link
            href="/fr/espace-etudiants/inscription"
            className="btn-primary"
          >
            S'inscrire à cette formation
          </Link>
          <Link
            href="/fr/espace-etudiants"
            className="px-6 py-3 border border-cjblue text-cjblue rounded-lg hover:bg-cjblue hover:text-white transition-colors"
          >
            Espace Étudiants
          </Link>
        </div>
      </article>
    </div>
  )
}
