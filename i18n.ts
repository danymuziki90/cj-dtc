import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['fr', 'en'];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`./i18n/${locale}.json`)).default
  };
});
