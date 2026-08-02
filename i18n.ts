import { getRequestConfig } from 'next-intl/server'
import { routing } from './i18n/routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  // Fall back to default locale if not provided or invalid
  const resolvedLocale =
    locale && routing.locales.includes(locale as any) ? locale : routing.defaultLocale

  return {
    locale: resolvedLocale,
    messages: (await import(`./i18n/${resolvedLocale}.json`)).default,
  }
})
