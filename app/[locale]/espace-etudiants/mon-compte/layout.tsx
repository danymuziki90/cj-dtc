import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Mon Compte Étudiant | CJ DTC',
  description: 'Gérez votre profil étudiant, vos informations personnelles, vos coordonnées et la sécurité de votre compte sur la plateforme CJ DTC.',
  keywords: ['mon compte', 'profil étudiant', 'paramètres compte', 'données personnelles', 'CJ DTC'],
  path: '/espace-etudiants/mon-compte',
})

export default function MonCompteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
