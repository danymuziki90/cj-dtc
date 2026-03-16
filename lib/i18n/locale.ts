export type SiteLocale = 'fr' | 'en'

export function resolveSiteLocale(value?: string | null): SiteLocale {
  return value === 'en' ? 'en' : 'fr'
}

export function getIntlLocale(locale?: string | null) {
  return resolveSiteLocale(locale) === 'en' ? 'en-US' : 'fr-FR'
}
