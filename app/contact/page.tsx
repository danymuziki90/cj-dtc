import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez CJ Development Training Center pour vos inscriptions, partenariats, services entreprises et demandes d information.',
}

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-cjblue">Contact</h1>
      <p className="mt-4">Contenu pour la page Contact a completer avec le contenu du cahier des charges.</p>
    </div>
  )
}
