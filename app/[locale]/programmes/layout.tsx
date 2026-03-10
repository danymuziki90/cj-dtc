import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Programmes',
  description:
    'Consultez les sessions ouvertes CJ DTC: dates, formats, places disponibles, prix et inscription en ligne.',
}

export default function ProgrammesLayout({ children }: { children: ReactNode }) {
  return children
}
