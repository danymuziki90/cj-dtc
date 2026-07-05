import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Actualites',
  description:
    'Suivez les actualites, annonces et evenements de CJ Development Training Center.',
}

export default function ActualitesLayout({ children }: { children: ReactNode }) {
  return children
}
