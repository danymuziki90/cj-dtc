import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['fr', 'en'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale promise provided by next-intl v4
  const locale = await requestLocale;

  // Validate that the locale is supported
  if (!locale || !locales.includes(locale)) notFound();

  return {
    locale,
    messages: (await import(`./i18n/${locale}.json`)).default,
  };
});
