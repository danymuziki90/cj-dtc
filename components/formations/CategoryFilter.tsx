/**
 * Composant de filtrage par catégorie
 */

'use client'

import { useState } from 'react'
import { FORMATION_CATEGORIES } from '@/lib/types/formation'
import type { FormationCategory } from '@/lib/types/formation'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  counts?: Record<string, number>
}

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange,
  counts = {}
}: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false)
  
  const visibleCategories = showAll ? FORMATION_CATEGORIES : FORMATION_CATEGORIES.slice(0, 6)
  const hasMore = FORMATION_CATEGORIES.length > 6

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Catégories</h3>
      
      <div className="space-y-2">
        {/* Option "Toutes" */}
        <button
          onClick={() => onCategoryChange('all')}
          className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">Toutes les catégories</span>
            <span className={`text-sm ${
              selectedCategory === 'all' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {Object.values(counts).reduce((sum, count) => sum + count, 0)}
            </span>
          </div>
        </button>

        {/* Catégories */}
        {visibleCategories.map((category) => {
          const count = counts[category.id] || 0
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{category.name}</span>
                <span className={`text-xs ${
                  selectedCategory === category.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {count}
                </span>
              </div>
            </button>
          )
        })}

        {/* Bouton Voir plus/moins */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAll ? 'Voir moins' : `Voir plus (${FORMATION_CATEGORIES.length - 6} autres)`}
          </button>
        )}
      </div>
    </div>
  )
}
