import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Connexion Espace Étudiant | CJ DTC',
  description: 'Connectez-vous à votre espace étudiant CJ DTC pour accéder à vos cours, devoirs et ressources pédagogiques.',
  keywords: ['connexion étudiant', 'login LMS', 'espace apprenant', 'connexion CJ DTC'],
  path: '/auth/student-login',
})

export default function StudentLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
