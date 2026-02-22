'use client'

import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from 'use-debounce'

interface SearchFilters {
  query: string
  category?: string
  level?: string
  format?: string
  priceRange?: [number, number]
  duration?: [number, number]
  location?: string
  startDate?: string
  endDate?: string
}

interface SearchResult {
  id: number
  title: string
  description: string
  category: string
  level: string
  format: string
  price: number
  duration: number
  location: string
  imageUrl?: string
  slug: string
  score: number
  highlights?: string[]
}

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    level: '',
    format: '',
    priceRange: [0, 10000],
    duration: [0, 365],
    location: '',
    startDate: '',
    endDate: ''
  })

  const debouncedQuery = useDebounce(filters.query, 300)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Simuler une recherche
  const performSearch = async () => {
    setIsSearching(true)
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Données mockées pour la démo
      const mockResults: SearchResult[] = [
        {
          id: 1,
          title: 'Développement Web Full Stack',
          description: 'Apprenez React, Node.js et MongoDB',
          category: 'Développement',
          level: 'Intermédiaire',
          format: 'Présentiel',
          price: 2500,
          duration: 90,
          location: 'Paris',
          imageUrl: '/images/web-dev.jpg',
          slug: 'developpement-web-full-stack',
          score: 0.95,
          highlights: ['React', 'Node.js', 'MongoDB']
        },
        {
          id: 2,
          title: 'Data Science et Machine Learning',
          description: 'Python, TensorFlow et analyse de données',
          category: 'Data Science',
          level: 'Avancé',
          format: 'En ligne',
          price: 3500,
          duration: 120,
          location: 'Lyon',
          imageUrl: '/images/data-science.jpg',
          slug: 'data-science-machine-learning',
          score: 0.88,
          highlights: ['Python', 'TensorFlow', 'ML']
        }
      ]
      
      setResults(mockResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Obtenir des suggestions de recherche
  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    // Simuler des suggestions
    const mockSuggestions = [
      'Développement Web',
      'Data Science',
      'Machine Learning',
      'React Native',
      'Python',
      'JavaScript',
      'Node.js',
      'MongoDB',
      'TypeScript',
      'Vue.js'
    ].filter(s => s.toLowerCase().includes(query.toLowerCase()))

    setSuggestions(mockSuggestions)
  }

  useEffect(() => {
    if (debouncedQuery) {
      getSuggestions(debouncedQuery)
      performSearch()
    }
  }, [debouncedQuery])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      level: '',
      format: '',
      priceRange: [0, 10000],
      duration: [0, 365],
      location: '',
      startDate: '',
      endDate: ''
    })
  }

  const sortedResults = useMemo(() => {
    return results.sort((a, b) => b.score - a.score)
  }, [results])

  return {
    filters,
    updateFilter,
    clearFilters,
    isSearching,
    results: sortedResults,
    suggestions,
    performSearch
  }
}

// Composant de recherche
export const SearchBar: React.FC<{
  onSearch?: (query: string) => void
  placeholder?: string
  showFilters?: boolean
  className?: string
}> = ({ onSearch, placeholder = 'Rechercher une formation...', showFilters = true, className = '' }) => {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { filters, updateFilter, suggestions } = useAdvancedSearch()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('query', query)
    setShowSuggestions(false)
    onSearch?.(query)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    updateFilter('query', suggestion)
    setShowSuggestions(false)
    onSearch?.(suggestion)
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-cjblue transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {suggestion}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Filtres avancés</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                <option value="Développement">Développement</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select
                value={filters.level}
                onChange={(e) => updateFilter('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-transparent"
              >
                <option value="">Tous les niveaux</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select
                value={filters.format}
                onChange={(e) => updateFilter('format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-transparent"
              >
                <option value="">Tous les formats</option>
                <option value="Présentiel">Présentiel</option>
                <option value="En ligne">En ligne</option>
                <option value="Hybride">Hybride</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
