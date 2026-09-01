'use client'

import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'

interface FinalCTAProps {
  locale: string
}

export default function FinalCTA({ locale }: FinalCTAProps) {
  const isFr = locale === 'fr'

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--cj-blue)] shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,6,19,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_40%)]" />
        
        <div className="relative z-10 px-6 py-8 text-center sm:px-10 sm:py-10 lg:px-16 lg:py-12 flex flex-col items-center">
          <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 border border-white/20 mb-3">
            {isFr ? 'Passez à l\'action' : 'Take Action'}
          </span>
          
          <h2 className="max-w-2xl text-2xl font-black text-white sm:text-3xl lg:text-4xl font-montserrat leading-tight">
            {isFr ? 'Développez vos compétences avec ' : 'Develop your skills with '}
            <span className="text-[var(--cj-red)]">CJ Development.</span>
          </h2>
          
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-white/80 font-opensans leading-relaxed">
            {isFr
              ? 'Rejoignez une communauté de leaders et propulsez votre carrière ou votre entreprise vers de nouveaux sommets.'
              : 'Join a community of leaders and propel your career or business to new heights.'}
          </p>
          
          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center w-full">
            <Link
              href={`/${locale}/formations`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition duration-300 hover:bg-[var(--cj-red-700)] hover:scale-[1.02] hover:shadow-xl group"
            >
              {isFr ? 'Voir les formations' : 'View courses'}
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-7 py-3.5 text-sm sm:text-base font-bold text-white transition duration-300 hover:bg-white/20 hover:scale-[1.02]"
            >
              <Mail className="h-5 w-5" />
              {isFr ? 'Nous contacter' : 'Contact us'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
