import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

// Empêche Google d'indexer cette page d'authentification administrateur
export const metadata: Metadata = buildMetadata({
  title: 'Connexion Administrateur | CJ DTC',
  description: 'Accès réservé aux administrateurs CJ DTC.',
  keywords: ['admin', 'connexion administrateur', 'CJ DTC'],
  path: '/auth/admin-login',
  noIndex: true,
})

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
