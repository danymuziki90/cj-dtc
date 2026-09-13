import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

// Empêche Google d'indexer cette page d'authentification
export const metadata: Metadata = buildMetadata({
  title: 'Réinitialisation du mot de passe | CJ DTC',
  description: 'Réinitialisez votre mot de passe pour accéder à votre espace CJ DTC.',
  keywords: ['réinitialisation mot de passe', 'reset password', 'CJ DTC'],
  path: '/auth/reset-password',
  noIndex: true,
})

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
