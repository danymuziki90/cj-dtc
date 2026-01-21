import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-cjblue mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Page introuvable
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/fr" className="btn-primary">
            Retour à l'accueil
          </Link>
          <Link 
            href="/fr/formations" 
            className="px-6 py-3 border-2 border-[var(--cj-blue)] text-[var(--cj-blue)] rounded-lg hover:bg-[var(--cj-blue)] hover:text-white transition-colors"
          >
            Voir nos formations
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div>
            <h3 className="font-semibold text-cjblue mb-2">Navigation rapide</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/fr/about" className="hover:text-[var(--cj-blue)]">À propos</Link></li>
              <li><Link href="/fr/formations" className="hover:text-[var(--cj-blue)]">Formations</Link></li>
              <li><Link href="/fr/contact" className="hover:text-[var(--cj-blue)]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cjblue mb-2">Ressources</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/fr/espace-etudiants" className="hover:text-[var(--cj-blue)]">Espace Étudiants</Link></li>
              <li><Link href="/fr/actualites" className="hover:text-[var(--cj-blue)]">Actualités</Link></li>
              <li><Link href="/fr/partenaires" className="hover:text-[var(--cj-blue)]">Partenaires</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cjblue mb-2">Aide</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><Link href="/fr/contact" className="hover:text-[var(--cj-blue)]">Nous contacter</Link></li>
              <li><Link href="/fr/programmes" className="hover:text-[var(--cj-blue)]">Programmes</Link></li>
              <li><Link href="/fr/services" className="hover:text-[var(--cj-blue)]">Services</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
