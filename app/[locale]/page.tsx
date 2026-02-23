'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HomeSections from '../../components/HomeSections'
import RecentFormations from '../../components/RecentFormations'
import RecentArticles from '../../components/RecentArticles'

export default function HomePage() {
  const heroImages = [
    '/books-wood.jpg',
    '/lor-de-formation.jpeg's
  ];
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Section - Primary Visual Element */}
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        {/* Background Overlay Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${currentBg === index ? 'opacity-100' : 'opacity-0'
                }`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          {/* Eyebrow text - smallest, introduces context */}
          <p className="text-blue-200 text-sm md:text-base uppercase tracking-widest mb-4 font-semibold">
            Centre Panafricain de Formation
          </p>
          {/* Main headline - largest, most prominent */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white max-w-4xl mx-auto drop-shadow-lg">
            Bienvenue au CJ DEVELOPMENT TRAINING CENTER
          </h1>
          {/* Subheadline - medium size, supporting info */}
          <p className="text-lg md:text-xl lg:text-2xl mb-4 max-w-3xl mx-auto text-blue-100 font-light drop-shadow">
            Le centre qui transforme les diplômes en compétences, et les compétences en opportunités réelles.
          </p>
          {/* Tagline - emphasized but smaller */}
          <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto text-white font-semibold drop-shadow">
            ✨ Bâtir des compétences. Transformer des destins.
          </p>
          {/* CTA buttons - clear visual hierarchy with primary/secondary */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fr/formations" className="px-8 py-4 bg-[#E30613] text-white rounded-lg font-bold text-lg hover:bg-red-700 transition-all hover:scale-105 shadow-lg">
              Découvrir nos formations
            </Link>
            <Link href="/fr/contact" className="px-8 py-4 border-2 border-white bg-black/20 backdrop-blur-sm rounded-lg font-semibold text-lg hover:bg-white hover:text-[#002D72] transition-all">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* About Since 2018 Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-cjblue">
                A propos
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Depuis 2018, CJ DTC forme, accompagne et insère durablement des milliers de jeunes et de professionnels à travers l'Afrique. Nos programmes — rigoureux, pratiques et alignés sur les standards internationaux en Management des Ressources Humaines, leadership et employabilité — sont conçus pour favoriser une insertion professionnelle durable et mesurable.
              </p>
              <div className="flex">
                <Link href="/fr/about" className="px-6 py-3 bg-cjblue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Lire plus
                </Link>
              </div>
            </div>
            <div>
              <Image
                src="/apropos.jpeg"
                alt="CJ DTC - Formation et accompagnement"
                width={600}
                height={400}
                className="rounded shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir CJ DTC - Section Spectaculaire */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background décoratif */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>

        {/* Orbes flottants */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-400 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-purple-400 rounded-full filter blur-3xl opacity-10 animate-pulse delay-500"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6 sm:mb-8">
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
              <span className="text-blue-800 font-semibold text-sm sm:text-base">Notre Excellence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6">
              Pourquoi choisir
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"> CJ DTC</span> ?
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez ce qui nous distingue et fait de nous le choix privilégié des professionnels et entreprises en Afrique
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Card 1 - Formations Certifiantes */}
            <div className="group relative">
              {/* Background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-100">
                {/* Icon Container */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl sm:rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <span className="text-3xl sm:text-4xl lg:text-5xl">🎓</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">
                  Formations Certifiantes
                </h3>

                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                  Des programmes reconnus pour développer vos compétences professionnelles et accélérer votre carrière
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">50+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Programmes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-600">98%</div>
                    <div className="text-xs sm:text-sm text-gray-500">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Expertise Panafricaine */}
            <div className="group relative">
              {/* Background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-green-100">
                {/* Icon Container */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl sm:rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <span className="text-3xl sm:text-4xl lg:text-5xl">🌍</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-green-600 transition-colors">
                  Expertise Panafricaine
                </h3>

                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                  Une approche adaptée aux contextes africains et internationaux avec une présence dans 15+ pays
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">15+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Pays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600">10+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Années</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Insertion Professionnelle */}
            <div className="group relative">
              {/* Background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-purple-100">
                {/* Icon Container */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl sm:rounded-3xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl sm:rounded-3xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <span className="text-3xl sm:text-4xl lg:text-5xl">🚀</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-purple-600 transition-colors">
                  Insertion Professionnelle
                </h3>

                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                  Accompagnement personnalisé vers l'emploi et l'entrepreneuriat avec notre réseau de partenaires
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">85%</div>
                    <div className="text-xs sm:text-sm text-gray-500">Insertion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-pink-600">500+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Partenaires</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                  Prêt à <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">transformer votre avenir</span> ?
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Rejoignez nos <span className="font-semibold">formations et programmes certifiants</span> pour développer vos compétences et accélérer votre carrière
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                  <Link
                    href="/fr/formations"
                    className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-white text-blue-600 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg"
                  >
                    S'inscrire maintenant
                  </Link>
                  <Link
                    href="/fr/contact"
                    className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-blue-700 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-blue-800 transition-all duration-300 hover:scale-105 text-sm sm:text-base lg:text-lg"
                  >
                    Contacter un conseiller
                  </Link>
                </div>
              </div>
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
