'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
    // Rediriger automatiquement après 10 secondes
    const timer = setTimeout(() => {
      router.push('/fr/formations')
    }, 10000)

    return () => clearTimeout(timer)
  }, [error, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.532-3.235L12 15.5l-4.416-2.735A2 2 0 016.732 1.013 2.683 13.087c.655.536 1.578 1.077 2.868 1.077 1.41 0 2.502-1.667 1.532-3.235L12 15.5l-4.416-2.735z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Erreur serveur
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Une erreur inattendue s'est produite. Nos équipes ont été notifiées et travaillent à résoudre le problème.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-900 mb-4">
              Que faire maintenant ?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 2m15.356 2H15a1 1 0 00.707.293l-4.146 4.147a1 1 0 01-.707.293l-4.146-4.147A1 1 0 014.582 2m15.356-2H15a1 1 0 00-.707-.293l-4.146-4.147A1 1 0 014.582-2m-15.356-2H15a1 1 0 00-.707-.293l-4.146 4.147A1 1 0 014.582 2M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Rafraîchir la page</div>
                  <div className="text-sm text-gray-600">Le problème est peut-être temporaire</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2.25 2.25 0 002.83 2.83v6.15L12 15l-1.89-1.26a2.25 2.25 0 00-2.83 0L3 8zM12 15l2.83 2.83a2.25 2.25 0 002.83 0l2.83-2.83L12 15z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Revenir plus tard</div>
                  <div className="text-sm text-gray-600">Le service sera bientôt rétabli</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 3.484A1 1 0 018.858 0l1.483-3.484a1 1 0 01.947-.684H19a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Contacter le support</div>
                  <div className="text-sm text-gray-600">Notre équipe est là pour aider</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Actualiser la page
            </button>
            <Link
              href="/fr/formations"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Continuer sur le site
            </Link>
            <Link
              href="/fr/contact"
              className="px-6 py-3 bg-cjblue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contacter le support
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Vous serez redirigé automatiquement vers la page d'accueil dans 10 secondes
            </p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 hover:text-red-700 underline text-sm"
              >
                Actualiser maintenant
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => router.push('/fr/formations')}
                className="text-cjblue hover:text-blue-700 underline text-sm"
              >
                Continuer
              </button>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center mb-2">
              Code d'erreur: <code className="bg-gray-200 px-2 py-1 rounded">500</code>
            </p>
            <p className="text-xs text-gray-500 text-center">
              Si l'erreur persiste, veuillez contacter notre support technique.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
