'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger automatiquement après 10 secondes
    const timer = setTimeout(() => {
      router.push('/fr/formations')
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cjblue to-blue-600 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0L9 10.343l3.95-3.95a4 4 0 115.656 0l1.414-1.414a4 4 0 00-5.656 0L9 10.343l-3.95-3.95a4 4 0 00-5.656 0L2.343 7.07a4 4 0 000 5.656l1.414 1.414a4 4 0 005.656 0L9 10.343l3.95 3.95a4 4 0 005.656 0l-1.414 1.414a4 4 0 00-5.656 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Que cherchiez-vous ?
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-cjblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Nos formations</div>
                  <div className="text-sm text-gray-600">Découvrez nos programmes de formation</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-cjblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Espace étudiant</div>
                  <div className="text-sm text-gray-600">Accédez à votre dashboard</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-cjblue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 3.484A1 1 0 018.858 0l1.483-3.484a1 1 0 01.947-.684H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Contact</div>
                  <div className="text-sm text-gray-600">Besoin d'aide ?</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fr/formations"
              className="px-6 py-3 bg-cjblue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Voir les formations
            </Link>
            <Link
              href="/fr/espace-etudiants"
              className="px-6 py-3 border border-cjblue text-cjblue rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Espace étudiant
            </Link>
            <Link
              href="/fr/contact"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contactez-nous
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Vous serez redirigé automatiquement vers la page d'accueil dans 10 secondes
            </p>
            <button
              onClick={() => router.push('/fr/formations')}
              className="mt-2 text-cjblue hover:text-blue-700 underline text-sm"
            >
              Aller maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
