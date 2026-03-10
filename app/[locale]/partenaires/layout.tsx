import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Partenaires',
  description:
    'Decouvrez les partenaires de CJ DTC et les collaborations qui soutiennent la formation et l insertion professionnelle en Afrique.',
}

export default function PartenairesLayout({ children }: { children: ReactNode }) {
  return children
}
