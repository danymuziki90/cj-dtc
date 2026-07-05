'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service (e.g., Sentry, LogRocket)
    console.error('Application error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-cjblue mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Une erreur s'est produite
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'Une erreur inattendue est survenue. Veuillez réessayer.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="btn-primary"
          >
            Réessayer
          </button>
          <Link href="/fr" className="px-6 py-3 border-2 border-[var(--cj-blue)] text-[var(--cj-blue)] rounded-lg hover:bg-[var(--cj-blue)] hover:text-white transition-colors">
            Retour à l'accueil
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <details className="mt-8 text-left bg-gray-50 p-4 rounded">
            <summary className="cursor-pointer text-sm text-gray-600 font-semibold mb-2">
              Détails techniques (développement uniquement)
            </summary>
            <pre className="text-xs text-gray-500 overflow-auto">
              {error.stack || error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
