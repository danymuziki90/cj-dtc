import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez CJ Development Training Center pour vos inscriptions, partenariats, services entreprises et demandes d information.',
}

export default function Page() {
  redirect('/fr/contact')
}
