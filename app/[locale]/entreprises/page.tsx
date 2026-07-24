import type { Metadata } from 'next'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import EntreprisesClientPage from './EntreprisesClientPage'

type Props = { params: Promise<{ locale: string }> | { locale: string } }

import { buildMetadata } from '@/lib/seo-config'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params)
  const loc = resolveSiteLocale(locale)
  const isFr = loc === 'fr'

  return buildMetadata({
    title: isFr
      ? 'Solutions Entreprises & Formations sur Mesure | CJ DTC'
      : 'Corporate Solutions & Customized Training | CJ DTC',
    description: isFr
      ? 'CJ DTC accompagne entreprises et ONG : renforcement du leadership, ingénierie de formation RH, coaching de dirigeants et programmes sur mesure.'
      : 'CJ DTC partners with enterprises and NGOs: leadership strengthening, HR training engineering, executive coaching and customized programs.',
    keywords: isFr
      ? ['formation entreprise', 'formation sur mesure', 'coaching dirigeant', 'renforcement RH', 'CJ DTC']
      : ['corporate training', 'customized training', 'executive coaching', 'HR strengthening', 'CJ DTC'],
    path: `/${loc}/entreprises`,
  })
}

export default async function EntreprisesPage({ params }: Props) {
  const { locale } = await Promise.resolve(params)
  const loc = resolveSiteLocale(locale)
  return <EntreprisesClientPage locale={loc} />
}
