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
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-4xl font-bold text-cjblue mb-4">Une erreur s'est produite</h2>
      <p className="text-xl text-gray-600 mb-6">
        {error.message || 'Une erreur inattendue est survenue.'}
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
          className="btn-primary"
        >
          Réessayer
        </button>
        <Link href="/fr" className="px-6 py-3 border border-cjblue text-cjblue rounded-lg hover:bg-cjblue hover:text-white transition-colors">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
