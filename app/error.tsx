'use client'

import { useEffect } from 'react'

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
      <h2 className="text-2xl font-bold text-cjblue mb-4">Une erreur s'est produite</h2>
      <p className="text-gray-600 mb-6">{error.message || 'Une erreur inattendue est survenue'}</p>
      <button
        onClick={reset}
        className="btn-primary"
      >
        Réessayer
      </button>
    </div>
  )
}
