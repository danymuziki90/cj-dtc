import { ReactNode } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import I18nProvider from '../i18n'

interface LayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'fr'

  // Messages vides pour l'instant (peut être amélioré plus tard)
  const messages = {}

  return (
    <I18nProvider messages={messages} locale={locale}>
      <Header />
      <main>{children}</main>
      <Footer />
    </I18nProvider>
  )
}
