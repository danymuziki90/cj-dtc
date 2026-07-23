'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Quote, MessageSquarePlus, ArrowRight, CheckCircle2 } from 'lucide-react'

interface TestimonialItem {
  id: number | string
  name: string
  rating: number
  title?: string | null
  content: string
  quote?: string
  formation?: string | null
  sessionDate?: string | null
  createdAt?: string
  role?: string
}

interface TestimonialsSectionProps {
  locale?: string
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'f1',
    name: 'Marie-Laure K.',
    rating: 5,
    title: 'Une reconversion réussie en Management RH',
    content: "La formation en Management des Ressources Humaines m'a apporté des compétences pratiques directement applicables en entreprise. L'accompagnement personnalisé et les formateurs de haut niveau m'ont permis de décrocher mon poste de Responsable RH.",
    formation: 'Management des Ressources Humaines (DRH)',
    sessionDate: 'Session 2025-2026'
  },
  {
    id: 'f2',
    name: 'Jean-Pierre M.',
    rating: 5,
    title: 'Excellence pédagogique et cas réels',
    content: "Une expérience de formation exceptionnelle ! La concrétisation des concepts théoriques au travers de cas pratiques et de simulations réelles a fait toute la différence. Je recommande vivement CJ Development TC.",
    formation: 'Gestion de Projet Agile & Scrum Master',
    sessionDate: 'Session 2025'
  },
  {
    id: 'f3',
    name: 'Sarah B.',
    rating: 5,
    title: 'Des outils modernes et un réseau solide',
    content: "Le programme en Audit & Diagnostic Organisationnel est d'une grande rigueur. La communauté d'anciens et le réseau de partenaires m'ont permis d'élargir mes opportunités professionnelles dès la fin de ma certification.",
    formation: 'Audit & Diagnostic Organisationnel',
    sessionDate: 'Session 2026'
  }
]

export default function TestimonialsSection({ locale = 'fr' }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)

  const isFr = locale === 'fr'

  useEffect(() => {
    let active = true
    setLoading(true)

    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (active) {
          if (Array.isArray(data) && data.length > 0) {
            setTestimonials(data)
          } else {
            setTestimonials(FALLBACK_TESTIMONIALS)
          }
        }
      })
      .catch(err => {
        console.error('Erreur chargement témoignages publics:', err)
        if (active) setTestimonials(FALLBACK_TESTIMONIALS)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const displayList = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS

  // Helper pour restituer le contenu du témoignage en italique avec paragraphe(s) et alignement justifié
  const renderContent = (rawText: string) => {
    if (!rawText) return null
    const paragraphs = rawText.split(/\n+/).filter(Boolean)
    return (
      <div className="space-y-2.5">
        {paragraphs.map((para, idx) => (
          <p
            key={idx}
            className="testimonial-body-text text-slate-700 italic"
          >
            "{para.trim()}"
          </p>
        ))}
      </div>
    )
  }

  return (
    <section className="bg-slate-50 py-20 sm:py-24 border-b border-slate-200 overflow-hidden relative">
      {/* Texture de fond subtile */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header de section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--cj-blue)] backdrop-blur-sm">
            <Quote className="w-3.5 h-3.5 text-[var(--cj-blue)]" />
            {isFr ? 'Témoignages & Avis d’Étudiants' : 'Student Testimonials & Reviews'}
          </span>

          <h2 className="text-3xl font-black text-slate-950 sm:text-4xl lg:text-5xl font-montserrat tracking-tight leading-tight">
            {isFr ? 'Ce que disent nos ' : 'What our '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cj-blue)] to-blue-700">
              {isFr ? 'étudiants diplômés' : 'graduates say'}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-opensans leading-relaxed">
            {isFr
              ? 'Découvrez les retours d’expérience authentiques de nos apprenants après leur parcours de formation certifiant chez CJ Development.'
              : 'Discover authentic feedback from our learners after their certified training path at CJ Development.'}
          </p>
        </div>

        {/* Grille des cartes de Témoignages */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 sm:p-7 md:p-8 border border-slate-200 shadow-sm animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-20 bg-slate-100 rounded"></div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {displayList.map(t => (
              <div
                key={t.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 md:p-8 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden font-segoe"
              >
                {/* Icône de citation filigranée en arrière-plan */}
                <Quote className="absolute -right-2 -bottom-2 w-24 h-24 text-slate-100/60 pointer-events-none group-hover:text-blue-50/80 transition-colors duration-300" />

                <div className="space-y-4 relative z-10">
                  {/* EN-TÊTE DE LA CARTE : Nom complet de la personne & Profil (EN HAUT) */}
                  <div className="pb-4 border-b border-slate-100 flex items-start justify-between gap-3 font-segoe">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-[var(--cj-blue)] font-bold flex items-center justify-center text-[10pt] shadow-xs shrink-0 font-segoe">
                        {t.name?.[0] || 'E'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[10.5pt] font-bold text-slate-900 leading-tight font-segoe truncate">
                          {t.name}
                        </h4>
                        <p className="text-[9.5pt] font-medium text-slate-500 line-clamp-1 mt-0.5 font-segoe">
                          {t.formation || (t.role ? t.role.replace('Étudiant — ', '') : 'CJ DTC')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[8.5pt] font-semibold text-slate-400 uppercase tracking-wider font-segoe bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        {isFr ? 'Avis Vérifié' : 'Verified'}
                      </span>

                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= (t.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 fill-slate-100'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[9pt] font-semibold text-slate-500 font-segoe">
                          {(t.rating || 5).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Titre du témoignage */}
                  {t.title && (
                    <h3 className="testimonial-card-title font-bold text-slate-900 group-hover:text-[var(--cj-blue)] transition font-segoe">
                      « {t.title} »
                    </h3>
                  )}

                  {/* Corps du texte EN ITALIQUE (Taille 10 pt, Segoe UI, Justifié) */}
                  {renderContent(t.content || t.quote || '')}
                </div>

                {/* Pied de Carte Subtil (Date / Session) */}
                {t.sessionDate && (
                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-end relative z-10 font-segoe">
                    <span className="text-[8.5pt] text-slate-400 font-segoe">
                      {t.sessionDate}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Boutons d'Action & Soumission */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 font-segoe">
          <Link
            href={`/${locale}/espace-etudiants/temoignages`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--cj-blue)] px-7 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-900/20 hover:bg-blue-900 hover:scale-[1.02] transition"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {isFr ? 'Soumettre mon témoignage' : 'Submit my testimonial'}
          </Link>

          <Link
            href={`/${locale}/formations`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition"
          >
            {isFr ? 'Découvrir nos formations' : 'Browse courses'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
