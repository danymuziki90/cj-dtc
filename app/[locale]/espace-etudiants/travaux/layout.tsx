import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Mes Travaux & Devoirs | CJ DTC',
  description: 'Consultez les devoirs assignés, téléchargez les consignes et téléversez vos travaux pratiques (TP) et projets d\'examen.',
  keywords: ['travaux', 'devoirs', 'remise TP', 'projets', 'examens', 'remise de travail', 'CJ DTC'],
  path: '/espace-etudiants/travaux',
})

export default function TravauxLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
