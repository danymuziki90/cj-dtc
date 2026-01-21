'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumbs from '../../../../components/Breadcrumbs'

interface Course {
  id: number
  title: string
  description: string
  progress: number
  modules: number
  completedModules: number
  lmsUrl: string | null
}

export default function ElearningPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      // TODO: Récupérer les cours depuis l'API LMS
      // Pour l'instant, on simule avec des données
      const response = await fetch('/api/lms/courses')
      try {
        const data = await response.json()
        setCourses(data)
      } catch {
        // Si l'API n'existe pas encore, on affiche un message
        setCourses([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumbs items={[
        { label: 'Espace Étudiants', href: '/fr/espace-etudiants' },
        { label: 'Plateforme e-learning' }
      ]} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cjblue mb-8">Plateforme e-learning</h1>
        <p className="text-lg text-gray-700 mb-8">
          Accédez à votre environnement d'apprentissage en ligne et suivez votre progression.
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cjblue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos cours...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-cjblue mb-4">Plateforme e-learning en configuration</h3>
            <p className="text-gray-600 mb-6">
              La plateforme e-learning est actuellement en cours de configuration.
              Vous recevrez un email dès que votre accès sera activé.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-cjblue mb-2">En attendant, vous pouvez :</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Consulter vos supports de cours</li>
                <li>Soumettre vos travaux</li>
                <li>Consulter vos résultats</li>
                <li>Contacter vos formateurs</li>
              </ul>
            </div>
            <div className="mt-6 flex gap-4 justify-center">
              <Link
                href="/fr/espace-etudiants/supports"
                className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir les supports
              </Link>
              <Link
                href="/fr/espace-etudiants/travaux"
                className="bg-white border-2 border-cjblue text-cjblue px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Soumettre un travail
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-cjblue mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{course.completedModules}/{course.modules} modules complétés</span>
                      <span className="font-medium">{course.progress}% complété</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-cjblue h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  {course.lmsUrl ? (
                    <a
                      href={course.lmsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-cjblue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Accéder au cours
                    </a>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-600 px-6 py-2 rounded-lg cursor-not-allowed"
                    >
                      Accès en attente
                    </button>
                  )}
                  <Link
                    href={`/fr/espace-etudiants/supports?formationId=${course.id}`}
                    className="text-cjblue hover:underline px-6 py-2"
                  >
                    Supports de cours
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
