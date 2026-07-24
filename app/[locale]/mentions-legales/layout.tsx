import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Mentions Légales & Éditeur du Site | CJ DTC',
  description: 'Consultez les mentions légales, informations d\'identification de l\'organisme et coordonnées officielles de CJ DTC.',
  keywords: ['mentions légales', 'éditeur du site', 'informations légales', 'adresse officielle', 'CJ DTC'],
  path: '/mentions-legales',
})

export default function MentionsLegalesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
