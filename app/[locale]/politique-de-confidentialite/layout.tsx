import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Politique de Confidentialité & Protection des Données | CJ DTC',
  description: 'Consultez la politique de confidentialité et de protection des données personnelles de CJ Development Training Center.',
  keywords: ['confidentialité', 'protection des données', 'données personnelles', 'RGPD', 'CJ DTC'],
  path: '/politique-de-confidentialite',
})

export default function ConfidentialiteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
