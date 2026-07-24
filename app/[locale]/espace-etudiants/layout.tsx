import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Espace Étudiant & Portail LMS | CJ DTC',
  description: 'Accédez à votre espace étudiant CJ DTC : suivi des cours, supports de formation, calendrier et certificats.',
  keywords: ['espace étudiant', 'portail LMS', 'cours en ligne', 'certificats', 'CJ DTC'],
  path: '/espace-etudiants',
})

export default function StudentSpaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
