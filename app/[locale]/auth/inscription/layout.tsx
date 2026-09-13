import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

// Empêche Google d'indexer cette page d'inscription/authentification
export const metadata: Metadata = buildMetadata({
  title: 'Inscription | CJ DTC',
  description: 'Inscrivez-vous sur la plateforme CJ DTC.',
  keywords: ['inscription', 'créer un compte', 'CJ DTC'],
  path: '/auth/inscription',
  noIndex: true,
})

export default function InscriptionAuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
