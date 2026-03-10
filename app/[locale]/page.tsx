'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HomeSections from '../../components/HomeSections'
import RecentSessions from '../../components/RecentSessions'
import RecentArticles from '../../components/RecentArticles'

export default function HomePage() {
  const heroImages = [
    '/books-wood.jpg',
    '/lor-de-formation.jpeg',
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

      {/* About Section */}
      <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -right-12 bottom-6 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(239,68,68,0.12),transparent_35%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div className="space-y-7">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              A propos de CJ DTC
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                Un centre de formation construit pour des resultats concrets.
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Depuis 2018, nous formons et accompagnons des jeunes et professionnels dans
                des parcours pratiques en RH, leadership et employabilite. Notre approche relie
                formation, execution terrain et insertion durable.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold text-white">2018</p>
                <p className="text-xs uppercase tracking-wider text-slate-300">Lancement</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold text-white">8500+</p>
                <p className="text-xs uppercase tracking-wider text-slate-300">Impacts</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur col-span-2 sm:col-span-1">
                <p className="text-2xl font-extrabold text-white">10+</p>
                <p className="text-xs uppercase tracking-wider text-slate-300">Pays couverts</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/fr/about"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Decouvrir notre histoire
              </Link>
              <Link
                href="/fr/formations"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Voir les formations
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/30 to-red-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-2 backdrop-blur">
              <Image
                src="/apropos.jpeg"
                alt="CJ DTC - Formation et accompagnement"
                width={760}
                height={520}
                className="h-[360px] w-full rounded-2xl object-cover sm:h-[430px]"
                priority
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-black/45 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Positionnement</p>
                <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                  Programmes structures, suivi de progression et orientation vers l'insertion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir CJ DTC - Section Spectaculaire */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background décoratif */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>

        {/* Orbes flottants */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-10 animate-pulse delay-500"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-blue-100 rounded-full mb-6 sm:mb-8">
              <span className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
              <span className="text-blue-800 font-semibold text-sm sm:text-base">Notre Excellence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6">
              Pourquoi choisir
              <span className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 bg-clip-text text-transparent"> CJ DTC</span> ?
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-100">
                {/* Icon Container */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-100 rounded-2xl sm:rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
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
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">98%</div>
                    <div className="text-xs sm:text-sm text-gray-500">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Expertise Panafricaine */}
            <div className="group relative">
              {/* Background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-100">
                {/* Icon Container */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-100 rounded-2xl sm:rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <span className="text-3xl sm:text-4xl lg:text-5xl">🌍</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">
                  Expertise Panafricaine
                </h3>

                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                  Une approche adaptée aux contextes africains et internationaux avec une présence dans 15+ pays
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">15+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Pays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">10+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Années</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Insertion Professionnelle */}
            <div className="group relative">
              {/* Background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-red-600 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-blue-100">
                {/* Icon Container */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-red-100 rounded-2xl sm:rounded-3xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-red-600 rounded-2xl sm:rounded-3xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <span className="text-3xl sm:text-4xl lg:text-5xl">🚀</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">
                  Insertion Professionnelle
                </h3>

                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                  Accompagnement personnalisé vers l'emploi et l'entrepreneuriat avec notre réseau de partenaires
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">85%</div>
                    <div className="text-xs sm:text-sm text-gray-500">Insertion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-red-600">500+</div>
                    <div className="text-xs sm:text-sm text-gray-500">Partenaires</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                  Prêt à <span className="bg-gradient-to-r from-red-300 to-red-300 bg-clip-text text-transparent">transformer votre avenir</span> ?
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

      {/* Recent Sessions Section */}
      <RecentSessions />

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

