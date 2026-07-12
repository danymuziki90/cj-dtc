/**
 * Skeleton loader pour les cartes de formation
 * Affichage pendant le chargement des données
 */

export default function FormationCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Objectives */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
          <div className="h-6 w-14 bg-gray-200 rounded"></div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-5 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded"></div>
        </div>

        {/* Inclusions */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex gap-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-18 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Instructor */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="space-y-2">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
