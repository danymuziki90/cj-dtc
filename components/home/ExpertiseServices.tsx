'use client'

import Link from 'next/link'
import { BookOpen, Building2, Users, Rocket } from 'lucide-react'

interface ExpertiseServicesProps {
  locale: string
}

export default function ExpertiseServices({ locale }: ExpertiseServicesProps) {
  const isFr = locale === 'fr'

  const services = [
    {
      id: 'formations-professionnelles',
      icon: <BookOpen className="h-6 w-6" />,
      title: isFr ? 'Formations professionnelles' : 'Professional Training',
      description: isFr 
        ? 'Parcours certifiants pour acquérir des compétences techniques et managériales.' 
        : 'Certified programs to acquire technical and managerial skills.',
      link: `/${locale}/formations`,
      color: 'blue'
    },
    {
      id: 'formations-entreprises',
      icon: <Building2 className="h-6 w-6" />,
      title: isFr ? 'Formations entreprises' : 'Corporate Training',
      description: isFr 
        ? 'Programmes sur-mesure (intra-entreprise) alignés sur vos objectifs stratégiques.' 
        : 'Tailored in-company programs aligned with your strategic goals.',
      link: `/${locale}/services`,
      color: 'red'
    },
    {
      id: 'accompagnement-professionnel',
      icon: <Users className="h-6 w-6" />,
      title: isFr ? 'Accompagnement RH' : 'HR Consulting',
      description: isFr 
        ? 'Audit RH, recrutement stratégique et outils de gestion des talents.' 
        : 'HR audit, strategic recruitment, and talent management tools.',
      link: `/${locale}/services`,
      color: 'emerald'
    },
    {
      id: 'developpement-competences',
      icon: <Rocket className="h-6 w-6" />,
      title: isFr ? 'Coaching & IOP' : 'Coaching & IOP',
      description: isFr 
        ? 'Orientation et insertion professionnelle pour booster l\'employabilité.' 
        : 'Career guidance and professional insertion to boost employability.',
      link: `/${locale}/formations`,
      color: 'amber'
    }
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
    red: 'bg-red-50 text-red-600 border-red-200 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600',
  }

  return (
    <section className="bg-slate-50 py-8 sm:py-10 lg:py-12 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 sm:mb-8 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full border border-[var(--cj-red)]/20 bg-red-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cj-red)] mb-3">
            {isFr ? 'Nos Domaines d\'Expertise' : 'Our Areas of Expertise'}
          </span>
          <h2 className="text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl font-montserrat leading-tight">
            {isFr ? 'Des solutions concrètes pour' : 'Concrete solutions for'}{' '}
            <span className="text-[var(--cj-blue)]">
              {isFr ? "votre développement." : "your growth."}
            </span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 font-opensans leading-relaxed">
            {isFr 
              ? 'Nous intervenons sur toute la chaîne de valeur du capital humain, de la formation initiale au conseil stratégique en entreprise.' 
              : 'We operate across the entire human capital value chain, from initial training to strategic corporate consulting.'}
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link 
              key={service.id} 
              href={service.link}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-slate-300"
            >
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-300 ${colorMap[service.color]}`}>
                {service.icon}
              </div>
              
              <h3 className="mb-2 text-lg sm:text-xl font-bold text-slate-900 font-montserrat group-hover:text-[var(--cj-blue)] transition-colors">
                {service.title}
              </h3>
              
              <p className="mb-6 flex-1 text-xs sm:text-sm leading-relaxed text-slate-600 font-opensans">
                {service.description}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-sm font-bold text-slate-900 transition-colors group-hover:text-[var(--cj-red)]">
                {isFr ? 'Découvrir' : 'Discover'}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
