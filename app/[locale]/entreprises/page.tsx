import type { Metadata } from 'next'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import EntreprisesClientPage from './EntreprisesClientPage'

type Props = { params: Promise<{ locale: string }> | { locale: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params)
  const loc = resolveSiteLocale(locale)
  const isFr = loc === 'fr'

  return {
    title: isFr
      ? 'Solutions Entreprises | CJ Development Training Center'
      : 'Corporate Solutions | CJ Development Training Center',
    description: isFr
      ? 'CJ Development accompagne les entreprises, ONG et institutions dans le développement des compétences, le renforcement du leadership et la transformation RH. Formations sur mesure, coaching et conseil stratégique.'
      : 'CJ Development partners with companies, NGOs and institutions to develop skills, strengthen leadership and transform HR. Custom training, coaching and strategic advisory.',
    keywords: isFr
      ? ['formation entreprise', 'formation intra', 'coaching dirigeant', 'DRH', 'développement RH', 'CJ Development']
      : ['corporate training', 'in-company training', 'executive coaching', 'HR development', 'CJ Development'],
    openGraph: {
      title: isFr ? 'Solutions Entreprises — CJ Development Training Center' : 'Corporate Solutions — CJ Development Training Center',
      description: isFr
        ? 'Partenaire stratégique pour le développement des talents, du leadership et de la performance organisationnelle.'
        : 'Strategic partner for talent development, leadership and organisational performance.',
      type: 'website',
    },
  }
}

export default async function EntreprisesPage({ params }: Props) {
  const { locale } = await Promise.resolve(params)
  const loc = resolveSiteLocale(locale)
  return <EntreprisesClientPage locale={loc} />
}
