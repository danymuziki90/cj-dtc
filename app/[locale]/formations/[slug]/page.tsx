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
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb & Back */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${locale}/formations`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Retour au catalogue</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Info principale */}
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {formation.featured && (
                  <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-semibold">
                    ⭐ Formation vedette
                  </span>
                )}
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {formation.categorie?.replace(/-/g, ' ')}
                </span>
                {formation.level && (
                  <span className={`px-3 py-1 rounded-full text-sm border ${levelColor}`}>
                    {formation.level.charAt(0).toUpperCase() + formation.level.slice(1)}
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {formation.title}
              </h1>

              {/* Description courte */}
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                {formation.shortDescription || formation.description}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                {formation.rating && (
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-300 fill-current" />
                    <span className="font-semibold text-white">{formation.rating}</span>
                    <span>({formation.reviewCount || 0} avis)</span>
                  </div>
                )}
                {formation.enrollmentCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{formation.enrollmentCount} étudiants inscrits</span>
                  </div>
                )}
                {formation.duree && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formation.duree}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Card d'inscription */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-900">
                {/* Prix */}
                <div className="mb-6">
                  {formation.price !== undefined ? (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-bold text-blue-600">
                          ${formation.price}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="text-xl text-gray-500 line-through">
                              ${formation.originalPrice}
                            </span>
                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                              -{discountPercent}%
                            </span>
                          </>
                        )}
                      </div>
                      {formation.nextSession && (
                        <p className="text-sm text-gray-600">
                          Prochaine session : {new Date(formation.nextSession.startDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-2xl font-semibold text-gray-700">Prix sur demande</p>
                  )}
                </div>

                {/* CTA Principal */}
                <Link
                  href={`/${locale}/inscription?formation=${formation.slug}`}
                  className="w-full block text-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg mb-3"
                >
                  S'inscrire maintenant
                </Link>

                <Link
                  href={`/${locale}/contact?subject=Formation: ${formation.title}`}
                  className="w-full block text-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Demander des informations
                </Link>

                {/* Inclusions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Cette formation inclut :</h3>
                  <ul className="space-y-2">
                    {formation.hasCertificate && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>Certificat de formation</span>
                      </li>
                    )}
                    {formation.hasSupports && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>Supports de cours complets</span>
                      </li>
                    )}
                    {formation.hasPracticalExercises && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span>Exercices pratiques</span>
                      </li>
                    )}
                    {formation.hasCoaching && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        <span>Coaching personnalisé</span>
                      </li>
                    )}
                    {formation.hasAccompaniment && (
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <ShieldIcon className="w-4 h-4 text-blue-600" />
                        <span>Accompagnement post-formation</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Format & Lieu */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  {formation.format && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FormatIcon className="w-4 h-4 text-gray-400" />
                      <span>
                        {formation.format === 'en_ligne' ? 'Formation 100% en ligne' :
                         formation.format === 'presentiel' ? 'Formation en présentiel' :
                         'Formation hybride'}
                      </span>
                    </div>
                  )}
                  {formation.nextSession?.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span>{formation.nextSession.location}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Sauvegarder</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Partager</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Download className="w-5 h-5" />
                    <span className="text-sm">Télécharger</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('program')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'program'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Programme détaillé
            </button>
            {formation.instructor && (
              <button
                onClick={() => setActiveTab('instructor')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'instructor'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Formateur
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description */}
                  <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      À propos de cette formation
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {formation.description}
                    </p>
                  </div>

                  {/* Objectifs */}
                  {objectives.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TargetIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Objectifs pédagogiques
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        À l'issue de cette formation, vous serez capable de :
                      </p>
                      <ul className="space-y-3">
                        {objectives.map((obj, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Compétences acquises */}
                  {skills.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ZapIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Compétences développées
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Public cible */}
                  {publicTargets.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Public cible
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Cette formation s'adresse à :
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {publicTargets.map((target, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-700">
                            <ChevronRight className="w-4 h-4 text-blue-600" />
                            <span>{target}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prérequis */}
                  {formation.prerequisites && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <ShieldIcon className="w-6 h-6 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Prérequis
                        </h2>
                      </div>
                      <p className="text-gray-700">{formation.prerequisites}</p>
                    </div>
                  )}

                  {/* Méthodes pédagogiques */}
                  {methods.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Méthodes pédagogiques
                        </h2>
                      </div>
                      <ul className="space-y-2">
                        {methods.map((method, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-600">•</span>
                            <span>{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certification */}
                  {formation.certification && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-8 border border-blue-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="w-8 h-8 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">
                          Certification
                        </h2>
                      </div>
                      <p className="text-gray-700">{formation.certification}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Program Tab */}
              {activeTab === 'program' && (
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Programme détaillé
                  </h2>
                  {modules.length > 0 ? (
                    <div className="space-y-4">
                      {modules.map((module, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {module}
                              </h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      Le programme détaillé sera communiqué lors de l'inscription.
                    </p>
                  )}
                </div>
              )}

              {/* Instructor Tab */}
              {activeTab === 'instructor' && formation.instructor && (
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Votre formateur
                  </h2>
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
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
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {formation.instructor.firstName} {formation.instructor.lastName}
                      </h3>
                      <p className="text-blue-600 font-medium mb-4">
                        {formation.instructor.title}
                      </p>
                      {formation.instructor.bio && (
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {formation.instructor.bio}
                        </p>
                      )}
                      {formation.instructor.expertise && formation.instructor.expertise.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-900 mb-2">Domaines d'expertise :</p>
                          <div className="flex flex-wrap gap-2">
                            {formation.instructor.expertise.map((exp, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Besoin d'aide ?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Nos conseillers sont là pour répondre à toutes vos questions
                </p>
                <Link
                  href={`/${locale}/contact`}
                  className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <MessageCircleIcon className="w-4 h-4 inline mr-2" />
                  Nous contacter
                </Link>
              </div>

              {/* Tags */}
              {formation.tags && formation.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {formation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
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
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à vous lancer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Inscrivez-vous maintenant et commencez votre transformation professionnelle
          </p>
          <Link
            href={`/${locale}/inscription?formation=${formation.slug}`}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
          >
            S'inscrire à cette formation
          </Link>
        </div>
      </section>
    </div>
  )
}
