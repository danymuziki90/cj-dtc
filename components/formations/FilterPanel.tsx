/**
 * Panneau de filtres complet pour les formations
 */

'use client'

import { XIcon } from 'lucide-react'
import { FORMATION_LEVELS, FORMATION_FORMATS } from '@/lib/types/formation'
import type { FormationCatalogFilters } from '@/lib/types/formation'

interface FilterPanelProps {
  filters: FormationCatalogFilters
  onFiltersChange: (filters: FormationCatalogFilters) => void
  onClose?: () => void
  showCloseButton?: boolean
}

export default function FilterPanel({ 
  filters, 
  onFiltersChange, 
  onClose,
  showCloseButton = false 
}: FilterPanelProps) {
  
  const updateFilter = (key: keyof FormationCatalogFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: 'all',
      level: 'all',
      format: 'all',
      priceMin: undefined,
      priceMax: undefined,
      featured: undefined,
      tags: []
    })
  }

  const hasActiveFilters = 
    filters.category !== 'all' ||
    filters.level !== 'all' ||
    filters.format !== 'all' ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.featured !== undefined

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Niveau Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau
          </label>
          <select
            value={filters.level || 'all'}
            onChange={(e) => updateFilter('level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les niveaux</option>
            {FORMATION_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        {/* Format Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <select
            value={filters.format || 'all'}
            onChange={(e) => updateFilter('format', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les formats</option>
            {FORMATION_FORMATS.map((format) => (
              <option key={format.id} value={format.id}>
                {format.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prix Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (USD)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Formations vedettes */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured || false}
              onChange={(e) => updateFilter('featured', e.target.checked ? true : undefined)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Formations vedettes uniquement
            </span>
          </label>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            Effacer tous les filtres
          </button>
        )}
      </div>
    </div>
  )
}
