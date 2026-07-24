import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Conditions Générales d\'Utilisation (CGU) | CJ DTC',
  description: 'Consultez les conditions générales d\'utilisation de la plateforme de formation et des services académiques de CJ DTC.',
  keywords: ['conditions d\'utilisation', 'CGU', 'règlement intérieur', 'services académiques', 'CJ DTC'],
  path: '/conditions-d-utilisation',
})

export default function ConditionsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
