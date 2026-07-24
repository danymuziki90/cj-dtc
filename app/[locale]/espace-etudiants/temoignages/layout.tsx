import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Témoignages & Avis Apprenants | CJ DTC',
  description: 'Découvrez les avis et retours d\'expérience des diplômés et partagez votre propre témoignage sur vos formations suivies.',
  keywords: ['témoignages', 'avis étudiants', 'retours d\'expérience', 'recommandations', 'CJ DTC'],
  path: '/espace-etudiants/temoignages',
})

export default function TemoignagesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
