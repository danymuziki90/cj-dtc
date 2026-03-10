import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Formations',
  description:
    'Explorez les formations CJ DTC en RH, leadership et employabilite: programmes certifiants en ligne, hybride et presentiel.',
}

export default function FormationsLayout({ children }: { children: ReactNode }) {
  return children
}
