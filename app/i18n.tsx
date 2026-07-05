'use client'

import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'

export default function I18nProvider({ children, messages, locale }: { children: ReactNode, messages: any, locale?: string }) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}
