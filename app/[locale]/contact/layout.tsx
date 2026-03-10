import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez CJ Development Training Center pour vos admissions, demandes de partenariat, support et informations sur les sessions.',
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
