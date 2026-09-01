'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Clock,
  Users,
  MapPinIcon,
  Monitor,
  Layers,
  Award,
  BookOpen,
  TargetIcon,
  CheckCircle2,
  StarIcon,
  TrendingUp,
  Calendar,
  DollarSign,
  Download,
  Share2,
  Heart,
  UserIcon,
  ChevronRight,
  ShieldIcon,
  Briefcase,
  GraduationCap,
  MessageCircleIcon,
  PlayCircle,
  FileText,
  ZapIcon,
  CheckCircle,
  Globe,
} from 'lucide-react'

import type { Formation } from '@/lib/types/formation'
import { parseTextList, calculateDiscount, getSimilarFormations } from '@/lib/formations/catalog'
import FormationCard from '@/components/formations/FormationCard'

const formatIcons = {
  presentiel: MapPinIcon,
  en_ligne: Monitor,
  hybride: Layers
}

const levelColors = {
  debutant: 'bg-green-100 text-green-700 border-green-200',
  intermediaire: 'bg-blue-100 text-blue-700 border-blue-200',
  avance: 'bg-purple-100 text-purple-700 border-purple-200',
  expert: 'bg-red-100 text-red-700 border-red-200',
  professionnel: 'bg-amber-100 text-amber-700 border-amber-200'
}

export default function FormationDetailPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const slug = params?.slug as string

  const [formation, setFormation] = useState<Formation | null>(null)
  const [allFormations, setAllFormations] = useState<Formation[]>([])
  const [formationTestimonials, setFormationTestimonials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'program' | 'instructor'>('overview')

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/student/auth/me')
      .then((res) => {
        if (res.ok) setIsLoggedIn(true)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    async function loadFormation() {
      setIsLoading(true)
      try {
        // Charger toutes les formations
        const response = await fetch('/api/formations')
        if (response.ok) {
          const data = await response.json()
          const formations = data.formations || []
          setAllFormations(formations)
          
          // Trouver la formation par slug
          const found = formations.find((f: Formation) => f.slug === slug)
          setFormation(found || null)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la formation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadFormation()
      fetch(`/api/testimonials?slug=${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setFormationTestimonials(data)
        })
        .catch(() => {})
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{locale === 'fr' ? 'Chargement...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{locale === 'fr' ? 'Formation non trouvée' : 'Course not found'}</h1>
          <Link
            href={`/${locale}/formations`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {locale === 'fr' ? 'Retour au catalogue' : 'Back to catalogue'}
          </Link>
        </div>
      </div>
    )
  }

  const FormatIcon = formation.format ? formatIcons[formation.format] : Monitor
  const hasDiscount = formation.originalPrice && formation.price && formation.originalPrice > formation.price
  const discountPercent = hasDiscount ? calculateDiscount(formation.originalPrice!, formation.price!) : 0

  const isFr = locale === 'fr'
  const displayTitle = (isFr ? formation.title : formation.titleEn) || formation.title
  const displayShortDesc = (isFr ? formation.shortDescription : undefined) || formation.shortDescription || (isFr ? formation.description : formation.descriptionEn) || formation.description
  const displayDesc = (isFr ? formation.description : formation.descriptionEn) || formation.description
  const displayDuration = (isFr ? formation.duree : formation.dureeEn) || formation.duree
  const displayCertification = (isFr ? formation.certification : formation.certificationEn) || formation.certification
  const displayPrerequisites = (isFr ? formation.prerequisites : formation.prerequisitesEn) || formation.prerequisites

  const objectives = parseTextList((isFr ? formation.objectifs : formation.objectifsEn) || formation.objectifs)
  const modules = parseTextList((isFr ? formation.modules : formation.modulesEn) || formation.modules)
  const methods = parseTextList((isFr ? formation.methodes : formation.methodesEn) || formation.methodes)
  
  const skillsList = isFr ? formation.skillsAcquired : (formation.skillsAcquiredEn || formation.skillsAcquired)
  const skills = Array.isArray(skillsList) ? skillsList : []
  
  const targetsList = isFr ? formation.publicTargets : (formation.publicTargetsEn || formation.publicTargets)
  const publicTargets = Array.isArray(targetsList) ? targetsList : []

  const similarFormations = getSimilarFormations(allFormations, formation, 3)

  const levelColor = formation.level ? levelColors[formation.level] : 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${locale}/formations`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>{isFr ? 'Retour au catalogue' : 'Back to catalog'}</span>
          </Link>
        </div>

        {/* Hero Section floating card */}
        <section className="cj-hero-card mb-6">
          <div className="relative z-10">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Main Info */}
              <div className="lg:col-span-2 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  {formation.featured && (
                    <span className="cj-eyebrow-dark">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
                      {isFr ? '⭐ Formation vedette' : '⭐ Featured course'}
                    </span>
                  )}
                  <span className="cj-eyebrow-dark">
                    {formation.categorie?.replace(/-/g, ' ')}
                  </span>
                  {formation.level && (
                    <span className="cj-eyebrow-dark">
                      {formation.level.charAt(0).toUpperCase() + formation.level.slice(1)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="cj-hero-title mb-4 leading-tight">
                  {displayTitle}
                </h1>

                {/* Short description */}
                <p className="text-base text-white leading-relaxed font-opensans">
                  {displayShortDesc}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-semibold pt-4">
                  {formation.rating && (
                    <div className="flex items-center gap-1.5">
                      <StarIcon className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-white">{formation.rating}</span>
                      <span className="opacity-80">({formation.reviewCount || 0} {isFr ? 'avis' : 'reviews'})</span>
                    </div>
                  )}
                  {formation.enrollmentCount !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-300" />
                      <span>{formation.enrollmentCount} {isFr ? 'apprenants inscrits' : 'enrolled students'}</span>
                    </div>
                  )}
                  {displayDuration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-300" />
                      <span>{displayDuration}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="cj-card-static text-gray-900 shadow-xl border border-slate-200">
                  <div className="mb-6">
                    {formation.price !== undefined ? (
                      <>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl font-black text-[var(--cj-blue)] font-montserrat">
                            ${formation.price}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-lg text-gray-500 line-through">
                                ${formation.originalPrice}
                              </span>
                              <span className="px-2 py-0.5 bg-[var(--cj-red)] text-white rounded-full text-xs font-bold">
                                -{discountPercent}%
                              </span>
                            </>
                          )}
                        </div>
                        {formation.nextSession && (
                          <div className="flex items-center gap-2 text-sm text-[var(--cj-blue)] font-medium mb-1">
                            <Calendar className="w-4 h-4" />
                            {isFr ? 'Prochaine session :' : 'Next session:'} {new Date(formation.nextSession.startDate).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
                              day: 'numeric', month: 'long'
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-2xl font-black text-[var(--cj-blue)] font-montserrat">{isFr ? 'Prix sur demande' : 'Price upon request'}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {formation.nextSession ? (
                      <Link
                        href={
                          isLoggedIn
                            ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${formation.id}&sessionId=${formation.nextSession.id}`
                            : `/${locale}/espace-etudiants?formationId=${formation.id}&sessionId=${formation.nextSession.id}`
                        }
                        className="flex-1 inline-flex items-center justify-center bg-[var(--cj-orange)] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        {isFr ? "S'inscrire à la session" : 'Register for session'}
                      </Link>
                    ) : (
                      <Link
                        href={`/${locale}/contact?subject=Formation: ${formation.title}`}
                        className="flex-1 inline-flex items-center justify-center bg-[var(--cj-blue)] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-sm"
                      >
                        {isFr ? 'Pré-inscription' : 'Pre-register'}
                      </Link>
                    )}

                    <Link
                      href={`/${locale}/contact?subject=Formation: ${formation.title}`}
                      className="inline-flex items-center justify-center text-slate-600 border border-slate-300 bg-white px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                      title={isFr ? "Demander des informations" : "Request information"}
                    >
                      <MessageCircleIcon className="w-5 h-5" />
                      <span className="sr-only">{isFr ? 'Demander des informations' : 'Request information'}</span>
                    </Link>
                  </div>

                  {formation.sessions && formation.sessions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{isFr ? 'Sessions programmées' : 'Scheduled sessions'}</span>
                      </h3>
                      <div className="space-y-3">
                        {formation.sessions.map((session: any) => {
                          const available = session.maxParticipants - (session.currentParticipants || 0)
                          const isFull = available <= 0
                          return (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                              <div>
                                <div className="font-bold text-slate-800 text-sm">
                                  {new Date(session.startDate).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                                  {' - '}
                                  {new Date(session.endDate).toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">{session.location}</div>
                              </div>
                              {!isFull ? (
                                <Link
                                  href={
                                    isLoggedIn
                                      ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${formation.id}&sessionId=${session.id}`
                                      : `/${locale}/espace-etudiants?formationId=${formation.id}&sessionId=${session.id}`
                                  }
                                  className="text-xs font-bold text-[var(--cj-blue)] hover:text-blue-800"
                                >
                                  {isFr ? "S'inscrire" : 'Register'}
                                </Link>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">{isFr ? 'Complet' : 'Full'}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">{isFr ? 'Cette formation inclut :' : 'This course includes:'}</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {formation.hasCertificate && (
                        <li className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>{isFr ? 'Certificat de formation' : 'Course certificate'}</span>
                        </li>
                      )}
                      {formation.hasSupports && (
                        <li className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>{isFr ? 'Supports de cours complets' : 'Course materials'}</span>
                        </li>
                      )}
                      {formation.hasPracticalExercises && (
                        <li className="flex items-center gap-2">
                          <TargetIcon className="w-4 h-4 text-emerald-500" />
                          <span>{isFr ? 'Exercices pratiques et cas réels' : 'Practical exercises and case studies'}</span>
                        </li>
                      )}
                      {formation.hasCoaching && (
                        <li className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span>{isFr ? 'Coaching personnalisé' : 'Personalized coaching'}</span>
                        </li>
                      )}
                      {formation.hasAccompaniment && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[var(--cj-blue)]" />
                          <span>{isFr ? 'Accompagnement post-formation' : 'Post-training accompaniment'}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-slate-700">
                    {formation.format && (
                      <li className="flex items-start gap-3">
                        <FormatIcon className="w-5 h-5 text-slate-400 shrink-0" />
                        <span>
                          {formation.format === 'en_ligne' ? (isFr ? 'Formation 100% en ligne' : '100% Online course') :
                           formation.format === 'presentiel' ? (isFr ? 'Formation en présentiel' : 'In-person course') :
                           (isFr ? 'Formation hybride' : 'Hybrid course')}
                        </span>
                      </li>
                    )}
                    {Array.isArray(formation.languages) && formation.languages.length > 0 && (
                      <li className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                        <span>
                          {isFr ? 'Langues :' : 'Languages:'} {formation.languages.map((l: string) => l === 'fr' ? (isFr ? 'Français' : 'French') : l === 'en' ? (isFr ? 'Anglais' : 'English') : l).join(', ')}
                        </span>
                      </li>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{isFr ? 'Sauvegarder' : 'Save'}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{isFr ? 'Partager' : 'Share'}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{isFr ? 'Télécharger' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex overflow-x-auto border-b border-slate-200 mb-8 hide-scrollbar">
          <button
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'overview' ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            {isFr ? 'Aperçu' : 'Overview'}
          </button>
          <button
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'program' ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('program')}
          >
            {isFr ? 'Programme' : 'Program'}
          </button>
          {formation.instructor && (
            <button
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === 'instructor' ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('instructor')}
            >
              {isFr ? 'Formateur' : 'Instructor'}
            </button>
          )}
        </div>

      <section className="py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{isFr ? 'À propos de cette formation' : 'About this course'}</h2>
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-opensans whitespace-pre-wrap">
                      {displayDesc}
                    </div>
                  </section>

                  {objectives.length > 0 && (
                    <section>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TargetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--cj-blue)]" />
                        {isFr ? 'Objectifs visés' : 'Objectives'}
                      </h2>
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">
                        <p className="text-slate-600 mb-4 font-medium">
                          {isFr ? "À l'issue de cette formation, vous serez capable de :" : 'Upon completion of this course, you will be able to:'}
                        </p>
                        <ul className="space-y-3 font-opensans">
                          {objectives.map((obj, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-700">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}

                  {skills.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">{isFr ? 'Compétences développées' : 'Skills developed'}</h2>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-semibold text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {publicTargets.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">{isFr ? 'Public cible' : 'Target audience'}</h2>
                      <div className="grid md:grid-cols-2 gap-3">
                        {publicTargets.map((target, index) => (
                          <div key={index} className="flex items-center gap-2 text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
                            <ChevronRight className="w-4 h-4 text-[var(--cj-blue)]" />
                            <span>{target}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {displayPrerequisites && (
                    <section>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ShieldIcon className="w-6 h-6 text-purple-600" />
                        {isFr ? 'Prérequis' : 'Prerequisites'}
                      </h2>
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-slate-700 font-opensans mt-2">{displayPrerequisites}</p>
                      </div>
                    </section>
                  )}

                  {displayCertification && (
                    <section>
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute -right-10 -top-10 opacity-10">
                          <Award className="w-64 h-64" />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="w-6 h-6 text-amber-400" />
                            {isFr ? 'Certification et validation' : 'Certification and validation'}
                          </h2>
                          <p className="text-white font-opensans leading-relaxed">{displayCertification}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {Array.isArray(formation.gallery) && formation.gallery.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">{isFr ? 'Galerie photos' : 'Photo gallery'}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formation.gallery.map((imgUrl: string, i: number) => (
                          <div key={i} className="group relative h-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            <img
                              src={imgUrl}
                              alt={`Galerie ${i + 1}`}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={e => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'program' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-[var(--cj-blue)]" />
                      {isFr ? 'Contenu du programme' : 'Program Content'}
                    </h2>
                    {modules.length > 0 ? (
                      <div className="space-y-4">
                        {modules.map((module, index) => (
                          <div key={index} className="border border-slate-200 rounded-2xl p-6 transition duration-200 hover:border-[var(--cj-blue)] hover:bg-slate-50/50">
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)] font-bold flex-shrink-0">
                                <span>{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-950 font-montserrat mb-2">
                                  {module}
                                </h3>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 font-opensans">
                        {isFr ? 'Le programme détaillé sera communiqué lors de l\'inscription.' : 'Detailed program will be provided upon registration.'}
                      </p>
                    )}
                  </section>

                  {methods.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-[var(--cj-orange)]" />
                        {isFr ? 'Méthodologie pédagogique' : 'Teaching Methodology'}
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {methods.map((method: string, index: number) => (
                          <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                              <span className="text-[var(--cj-orange)] font-bold text-sm">{index + 1}</span>
                            </div>
                            <p className="text-slate-700 font-medium pt-1">{method}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && formation.instructor && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">{isFr ? 'Votre formateur' : 'Your Instructor'}</h2>
                  <div className="flex flex-col sm:flex-row items-start gap-6 bg-white p-8 rounded-2xl border border-slate-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                      {formation.instructor.photoUrl ? (
                        <img
                          src={formation.instructor.photoUrl}
                          alt={`${formation.instructor.firstName} ${formation.instructor.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-12 h-12 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 font-montserrat mb-1">
                        {formation.instructor.firstName} {formation.instructor.lastName}
                      </h3>
                      <p className="text-[var(--cj-blue)] font-semibold text-sm mb-4">
                        {formation.instructor.title}
                      </p>
                      {formation.instructor.bio && (
                        <p className="text-slate-600 leading-relaxed font-opensans mb-4 text-sm">
                          {formation.instructor.bio}
                        </p>
                      )}
                      {formation.instructor.expertise && formation.instructor.expertise.length > 0 && (
                        <div>
                          <p className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Domaines d'expertise :</p>
                          <div className="flex flex-wrap gap-2">
                            {formation.instructor.expertise.map((exp, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>


            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                {formation.sessions && formation.sessions.length > 0 && (
                  <>
                    <h3 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">{isFr ? 'Prochaines sessions' : 'Upcoming sessions'}</h3>
                    <div className="space-y-3">
                      {formation.sessions.map((session: any) => (
                        <div key={session.id} className="text-sm">
                          <div className="font-bold">{new Date(session.startDate).toLocaleDateString()}</div>
                          <div className="text-slate-500">{session.location}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {formation.tags && formation.tags.length > 0 && (
                <div className="cj-card-interactive">
                  <h3 className="text-lg font-bold text-slate-950 font-montserrat mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {formation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {similarFormations.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-slate-950 mb-8 font-montserrat">
              {isFr ? 'Formations similaires qui pourraient vous intéresser' : 'Similar courses you might like'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarFormations.map(f => (
                <FormationCard key={f.id} formation={f} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cj-cta-banner mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4 font-montserrat sm:text-4xl">
            {isFr ? 'Prêt à vous lancer ?' : 'Ready to get started?'}
          </h2>
          <p className="text-base text-white mb-8 font-opensans leading-relaxed">
            {isFr ? 'Inscrivez-vous maintenant et commencez votre transformation professionnelle avec CJ DTC.' : 'Register now and start your professional transformation with CJ DTC.'}
          </p>
          <Link
            href={formation.nextSession ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${formation.id}&sessionId=${formation.nextSession.id}` : `/${locale}/sessions`}
            className="cj-btn-primary"
          >
            {isFr ? "S'inscrire à cette session" : 'Register for this session'}
          </Link>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:hidden z-40">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="text-xs text-slate-500 font-semibold">{isFr ? 'Prix de la formation' : 'Course price'}</div>
            <div className="font-bold text-lg text-slate-900">
              {formation.price !== undefined ? `$${formation.price}` : (isFr ? 'Sur devis' : 'Quote')}
            </div>
          </div>
          <Link
            href={formation.nextSession ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${formation.id}&sessionId=${formation.nextSession.id}` : `/${locale}/sessions`}
            className="bg-[var(--cj-orange)] text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            {isFr ? "S'inscrire" : 'Register'}
          </Link>
        </div>
      </div>
    </div>
    </div>
  )
}
