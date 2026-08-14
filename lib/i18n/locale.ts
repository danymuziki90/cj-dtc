export type SiteLocale = 'fr' | 'en'

export function resolveSiteLocale(value?: string | null): SiteLocale {
  return value === 'en' ? 'en' : 'fr'
}

export function getIntlLocale(locale?: string | null) {
  return resolveSiteLocale(locale) === 'en' ? 'en-US' : 'fr-FR'
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
