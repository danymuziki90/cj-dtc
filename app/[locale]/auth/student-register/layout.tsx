import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Création de Compte Étudiant | CJ DTC',
  description: 'Créez votre compte étudiant sur la plateforme CJ DTC pour rejoindre nos programmes certifiants et nos cours en ligne.',
  keywords: ['création de compte', 'inscription étudiant', 'nouveau compte LMS', 'CJ DTC'],
  path: '/auth/student-register',
})

export default function StudentRegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
