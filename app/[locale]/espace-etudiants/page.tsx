'use client'

import Link from 'next/link'

export default function EspaceEtudiantsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-cjblue mb-8">Espace Étudiants</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/fr/espace-etudiants/inscription"
          className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-cjblue mb-3">Inscription</h2>
          <p className="text-gray-600">
            Inscrivez-vous à nos formations et programmes certifiants
          </p>
        </Link>

        <Link
          href="/fr/formations"
          className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-xl font-bold text-cjblue mb-3">Nos Formations</h2>
          <p className="text-gray-600">
            Découvrez toutes nos formations disponibles
          </p>
        </Link>

        <Link
          href="/fr/certificates"
          className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-xl font-bold text-cjblue mb-3">Vérifier un Certificat</h2>
          <p className="text-gray-600">
            Vérifiez l'authenticité de votre certificat
          </p>
        </Link>
      </div>
    </div>
  )
}
