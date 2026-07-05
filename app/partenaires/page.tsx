import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partenaires',
  description:
    'Consultez les partenaires de CJ Development Training Center et les collaborations qui renforcent l insertion professionnelle.',
}

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-cjblue">Partenaires</h1>
      <p className="mt-4">Contenu pour la page Partenaires a completer avec le contenu du cahier des charges.</p>
    </div>
  )
}
