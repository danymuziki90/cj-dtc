import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Contactez-nous & Parler à un Conseiller | CJ DTC',
  description: 'Contactez notre équipe d\'orientation académique pour vos questions d\'admissions, partenariats et inscriptions aux formations CJ DTC.',
  keywords: ['contact CJ DTC', 'conseiller orientation', 'admissions', 'numéro téléphone', 'adresse', 'service étudiant'],
  path: '/contact',
})

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
