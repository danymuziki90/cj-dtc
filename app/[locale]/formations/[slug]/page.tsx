import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import { generatePageMetadata } from '../../../../components/PageMetadata'

interface PageProps {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const { slug } = resolvedParams

  const formation = await prisma.formation.findUnique({
    where: { slug }
  })

  if (!formation) {
    return generatePageMetadata({
      title: 'Formation introuvable',
      description: 'La formation demandée n\'existe pas.',
      noIndex: true,
    })
  }

  return generatePageMetadata({
    title: formation.title,
    description: formation.description || `Découvrez la formation ${formation.title} au CJ Development Training Center.`,
    keywords: ['formation', formation.title, 'CJ DTC', 'formation professionnelle'],
    image: formation.imageUrl || '/logo.png',
  })
}

export default async function FormationDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const { slug } = resolvedParams

  let formation = null
  let sessions = []
  try {
    formation = await prisma.formation.findUnique({
      where: { slug },
      include: {
        sessions: {
          include: {
            enrollments: true
          },
          orderBy: { startDate: 'asc' }
        }
      }
    })
    sessions = formation?.sessions || []
  } catch (error) {
    console.error('Erreur base de données:', error)
  }

  if (!formation) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Breadcrumbs
        items={[
          { label: 'Formations', href: '/fr/formations' },
          { label: formation.title },
        ]}
      />

      <article className="mt-6">
        <h1 className="text-4xl font-bold text-cjblue mb-6">{formation.title}</h1>

        <div className="prose max-w-none mb-8">
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            {formation.description || 'Aucune description disponible pour cette formation.'}
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          <Link
            href="/fr/formations"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Retour aux formations
          </Link>
        </div>

        {/* Sessions disponibles */}
        {sessions.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sessions disponibles</h2>
            <div className="grid gap-6">
              {sessions.map((session: any) => {
                const availableSpots = session.maxParticipants - (session.enrollments?.length || 0)
                const isFull = availableSpots <= 0
                const isUpcoming = new Date(session.startDate) > new Date()

                return (
                  <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    {session.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={session.imageUrl}
                          alt={`Session ${formation.title}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Session du {new Date(session.startDate).toLocaleDateString('fr-FR')}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {session.startTime} - {session.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {session.location}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${session.format === 'presentiel' ? 'bg-blue-100 text-blue-800' :
                            session.format === 'distanciel' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                            {session.format}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cjblue mb-1">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(session.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {availableSpots} places restantes
                        </div>
                      </div>
                    </div>

                    {session.description && (
                      <p className="text-gray-700 mb-4">{session.description}</p>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm rounded-full ${session.status === 'ouverte' ? 'bg-green-100 text-green-800' :
                          session.status === 'complete' ? 'bg-yellow-100 text-yellow-800' :
                            session.status === 'fermee' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {session.status}
                        </span>
                        {isFull && (
                          <span className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full">
                            Liste d'attente disponible
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/fr/formations/inscription?session=${session.id}`}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${isFull
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-cjblue text-white hover:bg-blue-700'
                          }`}
                      >
                        {isFull ? 'Liste d\'attente' : 'S\'inscrire'}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {sessions.length === 0 && (
          <section className="mt-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Aucune session disponible
              </h3>
              <p className="text-yellow-700 mb-4">
                Il n'y a actuellement aucune session programmée pour cette formation.
              </p>
              <p className="text-sm text-yellow-600">
                Contactez-nous pour être informé des prochaines sessions ou pour organiser une session sur mesure.
              </p>
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
