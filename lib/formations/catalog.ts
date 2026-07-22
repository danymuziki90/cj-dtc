/**
 * Utilitaires pour le catalogue de formations
 * Fonctions de filtrage, tri et recherche
 */

import type { Formation, FormationCatalogFilters, CatalogStats } from '../types/formation'

/**
 * Normalise le texte pour la recherche (insensible à la casse et accents)
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Vérifie si une formation correspond aux critères de recherche
 */
export function matchesSearchQuery(formation: Formation, query: string): boolean {
  if (!query) return true
  
  const normalizedQuery = normalizeSearchText(query)
  const searchableText = normalizeSearchText(
    `${formation.title} ${formation.description} ${formation.categorie || ''} ${formation.tags?.join(' ') || ''}`
  )
  
  return searchableText.includes(normalizedQuery)
}

/**
 * Filtre les formations selon les critères
 */
export function filterFormations(
  formations: Formation[],
  filters: FormationCatalogFilters
): Formation[] {
  return formations.filter((formation) => {
    // Filtre de recherche textuelle
    if (filters.search && !matchesSearchQuery(formation, filters.search)) {
      return false
    }

    // Filtre par catégorie
    if (filters.category && filters.category !== 'all' && formation.categorie !== filters.category) {
      return false
    }

    // Filtre par niveau
    if (filters.level && filters.level !== 'all' && formation.level !== filters.level) {
      return false
    }

    // Filtre par format
    if (filters.format && filters.format !== 'all' && formation.format !== filters.format) {
      return false
    }

    // Filtre par prix minimum
    if (filters.priceMin !== undefined && formation.price && formation.price < filters.priceMin) {
      return false
    }

    // Filtre par prix maximum
    if (filters.priceMax !== undefined && formation.price && formation.price > filters.priceMax) {
      return false
    }

    // Filtre par featured
    if (filters.featured !== undefined && formation.featured !== filters.featured) {
      return false
    }

    // Filtre par tags
    if (filters.tags && filters.tags.length > 0) {
      const formationTags = formation.tags || []
      const hasMatchingTag = filters.tags.some(tag => 
        formationTags.some(ft => normalizeSearchText(ft) === normalizeSearchText(tag))
      )
      if (!hasMatchingTag) return false
    }

    return true
  })
}

/**
 * Trie les formations selon le critère
 */
export function sortFormations(
  formations: Formation[],
  sortBy: 'popular' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'alphabetical'
): Formation[] {
  const sorted = [...formations]

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    
    case 'price-high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
    
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    
    case 'popular':
    default:
      return sorted.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
  }
}

/**
 * Calcule les statistiques du catalogue
 */
export function calculateCatalogStats(formations: Formation[]): CatalogStats {
  const totalFormations = formations.length
  const totalStudents = formations.reduce((sum, f) => sum + (f.enrollmentCount || 0), 0)
  const ratingsSum = formations.reduce((sum, f) => sum + (f.rating || 0), 0)
  const averageRating = totalFormations > 0 ? ratingsSum / totalFormations : 0
  const successRate = 95 // TODO: calculer depuis les données réelles
  
  // Compte par catégorie
  const categoriesCount: Record<string, number> = {}
  formations.forEach(formation => {
    const category = formation.categorie || 'autre'
    categoriesCount[category] = (categoriesCount[category] || 0) + 1
  })

  return {
    totalFormations,
    totalStudents,
    averageRating: Math.round(averageRating * 10) / 10,
    successRate,
    categoriesCount
  }
}

/**
 * Extrait les items d'une liste texte (séparés par lignes ou virgules)
 */
export function parseTextList(text: string | null | undefined, max?: number): string[] {
  if (!text) return []
  
  const items = text
    .split(/\r?\n|,|;/)
    .map(s => s.trim())
    .filter(Boolean)
  
  return max ? items.slice(0, max) : items
}

/**
 * Résume un texte avec ellipse
 */
export function summarizeText(text: string | null | undefined, maxLength: number = 140): string {
  const normalized = text?.trim() || ''
  if (!normalized) return ''
  if (normalized.length <= maxLength) return normalized
  
  return `${normalized.slice(0, maxLength).trimEnd()}…`
}

/**
 * Calcule le pourcentage de réduction
 */
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= currentPrice) return 0
  return Math.round((1 - currentPrice / originalPrice) * 100)
}

/**
 * Vérifie si une formation est complète (toutes les infos requises)
 */
export function isFormationComplete(formation: Formation): boolean {
  const requiredFields = [
    formation.title,
    formation.description,
    formation.categorie,
  ]
  
  return requiredFields.every(field => field && field.toString().length > 0)
}

/**
 * Filtre les formations publiées uniquement
 */
export function getPublishedFormations(formations: Formation[]): Formation[] {
  return formations.filter(f => f.statut === 'publie')
}

/**
 * Obtient les formations vedettes
 */
export function getFeaturedFormations(formations: Formation[], limit?: number): Formation[] {
  const featured = formations.filter(f => f.featured && f.statut === 'publie')
  return limit ? featured.slice(0, limit) : featured
}

/**
 * Obtient les formations par catégorie
 */
export function getFormationsByCategory(
  formations: Formation[],
  categoryId: string
): Formation[] {
  return formations.filter(f => f.categorie === categoryId && f.statut === 'publie')
}

/**
 * Recherche de formations similaires (même catégorie, même niveau)
 */
export function getSimilarFormations(
  formations: Formation[],
  targetFormation: Formation,
  limit: number = 3
): Formation[] {
  return formations
    .filter(f => 
      f.id !== targetFormation.id &&
      f.statut === 'publie' &&
      (f.categorie === targetFormation.categorie || f.level === targetFormation.level)
    )
    .slice(0, limit)
}

/**
 * Génère un slug depuis un titre
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
