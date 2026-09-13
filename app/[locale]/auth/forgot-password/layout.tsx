import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

// Empêche Google d'indexer cette page d'authentification
export const metadata: Metadata = buildMetadata({
  title: 'Mot de passe oublié | CJ DTC',
  description: 'Réinitialisez votre mot de passe pour accéder à votre espace CJ DTC.',
  keywords: ['mot de passe oublié', 'réinitialisation', 'CJ DTC'],
  path: '/auth/forgot-password',
  noIndex: true,
})

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
