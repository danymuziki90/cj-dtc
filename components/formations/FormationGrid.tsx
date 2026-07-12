/**
 * Grille responsive pour afficher les cartes de formation
 */

import type { Formation } from '@/lib/types/formation'
import FormationCard from './FormationCard'
import FormationCardSkeleton from './FormationCardSkeleton'

interface FormationGridProps {
  formations: Formation[]
  locale?: string
  isLoading?: boolean
  emptyMessage?: string
}

export default function FormationGrid({ 
  formations, 
  locale = 'fr', 
  isLoading = false,
  emptyMessage = "Aucune formation trouvée"
}: FormationGridProps) {
  
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <FormationCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (formations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          Essayez de modifier vos critères de recherche ou de filtres
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {formations.map((formation) => (
        <FormationCard
          key={formation.id}
          formation={formation}
          locale={locale}
          featured={formation.featured}
        />
      ))}
    </div>
  )
}
