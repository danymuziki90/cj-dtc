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
  ZapIcon
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
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formation non trouvée</h1>
          <Link
            href={`/${locale}/formations`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    )
  }

  const FormatIcon = formation.format ? formatIcons[formation.format] : Monitor
  const hasDiscount = formation.originalPrice && formation.price && formation.originalPrice > formation.price
  const discountPercent = hasDiscount ? calculateDiscount(formation.originalPrice!, formation.price!) : 0

  const objectives = parseTextList(formation.objectifs)
  const modules = parseTextList(formation.modules)
  const methods = parseTextList(formation.methodes)
  const skills = formation.skillsAcquired || []
  const publicTargets = formation.publicTargets || []

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
            <span>Retour au catalogue</span>
          </Link>
        </div>

        {/* Hero Section floating card */}
        <section className="cj-hero-card mb-10">
          <div className="relative z-10">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  {formation.featured && (
                    <span className="cj-eyebrow-dark">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
                      ⭐ Formation vedette
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
                  {formation.title}
                </h1>

                {/* Short description */}
                <p className="text-base text-white leading-relaxed font-opensans">
                  {formation.shortDescription || formation.description}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-semibold pt-4">
                  {formation.rating && (
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-yellow-300 fill-current animate-pulse" />
                      <span className="text-white">{formation.rating}</span>
                      <span className="opacity-80">({formation.reviewCount || 0} avis)</span>
                    </div>
                  )}
                  {formation.enrollmentCount !== undefined && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-300" />
                      <span>{formation.enrollmentCount} apprenants inscrits</span>
                    </div>
                  )}
                  {formation.duree && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-300" />
                      <span>{formation.duree}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Registration Card */}
              <div className="lg:col-span-1">
                <div className="cj-card-static text-gray-900 shadow-xl border border-slate-200">
                  {/* Prix */}
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
                          <p className="text-xs text-gray-500 font-medium font-opensans">
                            Prochaine session : {new Date(formation.nextSession.startDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-2xl font-black text-[var(--cj-blue)] font-montserrat">Prix sur demande</p>
                    )}
                  </div>

                  {/* CTA Principal */}
                  <div className="space-y-3">
                    {formation.nextSession ? (
                      <Link
                        href={
                          isLoggedIn
                            ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${formation.id}&sessionId=${formation.nextSession.id}`
                            : `/${locale}/espace-etudiants?formationId=${formation.id}&sessionId=${formation.nextSession.id}`
                        }
                        className="cj-btn-primary w-full text-center py-3.5"
                      >
                        S'inscrire à la session
                      </Link>
                    ) : (
                      <Link
                        href={`/${locale}/contact?subject=Formation: ${formation.title}`}
                        className="cj-btn-primary w-full text-center py-3.5"
                      >
                        Nous contacter (Pas de session)
                      </Link>
                    )}

                    <Link
                      href={`/${locale}/contact?subject=Formation: ${formation.title}`}
                      className="cj-btn-secondary-light w-full text-center py-3"
                    >
                      Demander des informations
                    </Link>
                  </div>

                  {/* Sessions disponibles */}
                  {formation.sessions && formation.sessions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Sessions programmées</span>
                      </h3>
                      <div className="space-y-3">
                        {formation.sessions.map((session: any) => {
                          const available = session.maxParticipants - (session.currentParticipants || 0)
                          const isFull = available <= 0
                          return (
                            <div key={session.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50 text-xs">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {new Date(session.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                  </p>
                                  <p className="text-slate-500 font-medium">{session.format} • {session.location}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {isFull ? 'Complet' : `${available} place(s)`}
                                </span>
                              </div>
                              <Link
                                href={
                                  isLoggedIn
                                    ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${formation.id}&sessionId=${session.id}`
                                    : `/${locale}/espace-etudiants?formationId=${formation.id}&sessionId=${session.id}`
                                }
                                className={`w-full block text-center py-2 rounded-lg font-bold transition-all text-xs ${
                                  isFull
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                    : 'bg-[var(--cj-blue)] hover:bg-[var(--cj-blue-700)] text-white shadow-sm'
                                }`}
                              >
                                {isFull ? 'Rejoindre la liste d\'attente' : 'S\'inscrire à cette session'}
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inclusions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">Cette formation inclut :</h3>
                    <ul className="space-y-2">
                      {formation.hasCertificate && (
                        <li className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>Certificat de formation</span>
                        </li>
                      )}
                      {formation.hasSupports && (
                        <li className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>Supports de cours complets</span>
                        </li>
                      )}
                      {formation.hasPracticalExercises && (
                        <li className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span>Exercices pratiques</span>
                        </li>
                      )}
                      {formation.hasCoaching && (
                        <li className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span>Coaching personnalisé</span>
                        </li>
                      )}
                      {formation.hasAccompaniment && (
                        <li className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <ShieldIcon className="w-4 h-4 text-blue-600" />
                          <span>Accompagnement post-formation</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Format & Lieu */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                    {formation.format && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <FormatIcon className="w-4 h-4 text-gray-400" />
                        <span>
                          {formation.format === 'en_ligne' ? 'Formation 100% en ligne' :
                           formation.format === 'presentiel' ? 'Formation en présentiel' :
                           'Formation hybride'}
                        </span>
                      </div>
                    )}
                    {formation.nextSession?.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{formation.nextSession.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Sauvegarder</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Partager</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Télécharger</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 mb-8 rounded-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('program')}
              className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors ${
                activeTab === 'program'
                  ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Programme détaillé
            </button>
            {formation.instructor && (
              <button
                onClick={() => setActiveTab('instructor')}
                className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors ${
                  activeTab === 'instructor'
                    ? 'border-[var(--cj-blue)] text-[var(--cj-blue)]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Formateur
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description */}
                  <div className="cj-card-static p-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-4 font-montserrat">
                      À propos de cette formation
                    </h2>
                    <p className="text-slate-700 leading-relaxed font-opensans">
                      {formation.description}
                    </p>
                  </div>

                  {/* Objectifs */}
                  {objectives.length > 0 && (
                    <div className="cj-card-static p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)]">
                          <TargetIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 font-montserrat">
                          Objectifs pédagogiques
                        </h2>
                      </div>
                      <p className="text-slate-600 mb-4 font-opensans">
                        À l'issue de cette formation, vous serez capable de :
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
                  )}

                  {/* Compétences acquises */}
                  {skills.length > 0 && (
                    <div className="cj-card-static p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                          <ZapIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 font-montserrat">
                          Compétences développées
                        </h2>
                      </div>
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
                    </div>
                  )}

                  {/* Public cible */}
                  {publicTargets.length > 0 && (
                    <div className="cj-card-static p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 font-montserrat">
                          Public cible
                        </h2>
                      </div>
                      <p className="text-slate-600 mb-4 font-opensans">
                        Cette formation s'adresse à :
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 font-opensans">
                        {publicTargets.map((target, index) => (
                          <div key={index} className="flex items-center gap-2 text-slate-700">
                            <ChevronRight className="w-4 h-4 text-[var(--cj-blue)]" />
                            <span>{target}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prérequis */}
                  {formation.prerequisites && (
                    <div className="cj-card-static p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                          <ShieldIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 font-montserrat">
                          Prérequis
                        </h2>
                      </div>
                      <p className="text-slate-700 font-opensans">{formation.prerequisites}</p>
                    </div>
                  )}

                  {/* Méthodes pédagogiques */}
                  {methods.length > 0 && (
                    <div className="cj-card-static p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 font-montserrat">
                          Méthodes pédagogiques
                        </h2>
                      </div>
                      <ul className="space-y-2 font-opensans">
                        {methods.map((method, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-700">
                            <span className="text-[var(--cj-blue)]">•</span>
                            <span>{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certification */}
                  {formation.certification && (
                    <div className="rounded-3xl bg-[linear-gradient(135deg,#02142f_0%,#002d72_55%,#0c4da2_100%)] p-8 text-white shadow-md border border-slate-800 relative overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,6,19,0.18),transparent_45%)]" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <Award className="w-8 h-8 text-[var(--cj-red)]" />
                          <h2 className="text-2xl font-black text-white font-montserrat">
                            Certification
                          </h2>
                        </div>
                        <p className="text-white font-opensans leading-relaxed">{formation.certification}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Program Tab */}
              {activeTab === 'program' && (
                <div className="cj-card-static p-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 font-montserrat">
                    Programme détaillé
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
                      Le programme détaillé sera communiqué lors de l'inscription.
                    </p>
                  )}
                </div>
              )}

              {/* Instructor Tab */}
              {activeTab === 'instructor' && formation.instructor && (
                <div className="cj-card-static p-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 font-montserrat">
                    Votre formateur
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start gap-6">
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

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact rapide */}
              <div className="cj-card-interactive">
                <h3 className="text-lg font-bold text-slate-950 font-montserrat mb-2">
                  Besoin d'aide ?
                </h3>
                <p className="text-xs text-slate-600 mb-4 font-opensans leading-relaxed">
                  Nos conseillers sont là pour répondre à toutes vos questions et vous accompagner.
                </p>
                <Link
                  href={`/${locale}/contact`}
                  className="cj-btn-primary w-full text-center py-2.5"
                >
                  <MessageCircleIcon className="w-4 h-4 inline mr-2" />
                  Nous contacter
                </Link>
              </div>

              {/* Tags */}
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

      {/* Formations similaires */}
      {similarFormations.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-slate-950 mb-8 font-montserrat">
              Formations similaires
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarFormations.map(f => (
                <FormationCard key={f.id} formation={f} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="cj-cta-banner mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4 font-montserrat sm:text-4xl">
            Prêt à vous lancer ?
          </h2>
          <p className="text-base text-white mb-8 font-opensans leading-relaxed">
            Inscrivez-vous maintenant et commencez votre transformation professionnelle avec CJ DTC.
          </p>
          <Link
            href={`/${locale}/inscription?formation=${formation.slug}`}
            className="cj-btn-primary"
          >
            S'inscrire à cette formation
          </Link>
        </div>
      </section>

      </div>
    </div>
  )
}
