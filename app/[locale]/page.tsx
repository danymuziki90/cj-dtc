'use client'

import Link from 'next/link'
import HomeSections from '../../components/HomeSections'
import RecentFormations from '../../components/RecentFormations'
import RecentArticles from '../../components/RecentArticles'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Centre Panafricain de Formation Professionnelle
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Bâtir des compétences. Transformer des destins.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/fr/formations" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
              Découvrir nos formations
            </Link>
            <Link href="/fr/contact" className="px-6 py-3 border-2 border-white rounded-lg hover:bg-white/10 transition-colors">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-cjblue">
            Pourquoi choisir CJ DTC ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">Formations Certifiantes</h3>
              <p className="text-gray-600">
                Des programmes reconnus pour développer vos compétences professionnelles
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Expertise Panafricaine</h3>
              <p className="text-gray-600">
                Une approche adaptée aux contextes africains et internationaux
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Insertion Professionnelle</h3>
              <p className="text-gray-600">
                Accompagnement vers l'emploi et l'entrepreneuriat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Formations Section */}
      <RecentFormations />

      {/* Recent Articles Section */}
      <RecentArticles />

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-cjblue">
            Prêt à transformer votre avenir ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez nos formations et programmes certifiants
          </p>
          <Link href="/fr/espace-etudiants/inscription" className="btn-primary">
            S'inscrire maintenant
          </Link>
        </div>
      </section>

      <HomeSections />
    </div>
  )
}
