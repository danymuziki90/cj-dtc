export type SiteLocale = 'fr' | 'en'

export function resolveSiteLocale(value?: string | null): SiteLocale {
  return value === 'en' ? 'en' : 'fr'
}

export function getIntlLocale(locale?: string | null) {
  return resolveSiteLocale(locale) === 'en' ? 'en-US' : 'fr-FR'
}

/** Labels for the built-in news categories. Custom categories remain unchanged
 * until their bilingual value is supplied by the content manager. */
export function getLocalizedCategory(value: string | null | undefined, locale?: string | null) {
  const label = String(value || '').trim()
  if (resolveSiteLocale(locale) !== 'en') return label

  const translations: Record<string, string> = {
    emplois: 'Jobs',
    actualités: 'News',
    actualites: 'News',
    événements: 'Events',
    evenements: 'Events',
    général: 'General',
  }

  return translations[label.toLocaleLowerCase('fr-FR')] || label
}

/**
 * Utilitaires pour récupérer le contenu traduit depuis la base de données.
 * @param obj L'objet provenant de la DB (ex: Formation, News)
 * @param field Le champ de base en français (ex: 'title')
 * @param locale La langue actuelle (ex: 'fr' ou 'en')
 * @returns La valeur traduite, ou le fallback FR si la traduction est manquante.
 */
export function getLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  field: string,
  locale: string | null | undefined
): string {
  if (!obj) return ''
  const safeLocale = resolveSiteLocale(locale)
  
  if (safeLocale === 'en') {
    const enField = `${field}En`
    // Si le champ En existe et n'est pas vide/nul, on le retourne
    if (obj[enField] !== undefined && obj[enField] !== null && obj[enField] !== '') {
      return String(obj[enField])
    }
  }

  // Fallback sur le champ par défaut (FR)
  const val = obj[field]
  return val !== undefined && val !== null ? String(val) : ''
}
