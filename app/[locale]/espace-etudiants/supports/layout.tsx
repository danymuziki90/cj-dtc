import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Supports de Cours & Ressources Pédagogiques | CJ DTC',
  description: 'Accédez à vos fiches de cours, présentations, modèles et guides pédagogiques téléchargeables pour l\'ensemble de vos formations.',
  keywords: ['supports de cours', 'ressources pédagogiques', 'téléchargements', 'documents cours', 'CJ DTC'],
  path: '/espace-etudiants/supports',
})

export default function SupportsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
