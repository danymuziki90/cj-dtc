'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Clock, 
  Calendar,
  Users, 
  TargetIcon, 
  MapPinIcon, 
  Monitor, 
  Layers,
  StarIcon, 
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  UserIcon,
  ChevronRight,
  Sparkle
} from 'lucide-react'
import type { Formation } from '@/lib/types/formation'
import { calculateDiscount, summarizeText, parseTextList } from '@/lib/formations/catalog'

interface FormationCardProps {
  formation: Formation
  locale?: string
  featured?: boolean
}

const formatIcons = {
  presentiel: MapPinIcon,
  en_ligne: Monitor,
  hybride: Layers
}

const levelColors = {
  debutant: 'bg-green-100 text-green-700',
  intermediaire: 'bg-blue-100 text-blue-700',
  avance: 'bg-purple-100 text-purple-700',
  expert: 'bg-red-100 text-red-700',
  professionnel: 'bg-amber-100 text-amber-700'
}

const categoryColors = {
  'leadership-gouvernance': 'bg-blue-100 text-blue-700',
  'employabilite-iop': 'bg-green-100 text-green-700',
  'ressources-humaines': 'bg-purple-100 text-purple-700',
  'developpement-personnel': 'bg-pink-100 text-pink-700',
  'gestion-projets': 'bg-orange-100 text-orange-700',
  'entrepreneuriat': 'bg-red-100 text-red-700',
  'transformation-digitale': 'bg-cyan-100 text-cyan-700',
  'intelligence-artificielle': 'bg-indigo-100 text-indigo-700',
  'forums-conferences': 'bg-teal-100 text-teal-700',
  'entreprises-institutions': 'bg-gray-100 text-gray-700'
}

export default function FormationCard({ formation, locale = 'fr', featured }: FormationCardProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/student/auth/me')
      .then((res) => {
        if (res.ok) setIsLoggedIn(true)
      })
      .catch(() => {})
  }, [])

  const FormatIcon = formation.format ? formatIcons[formation.format] : Monitor
  const hasDiscount = formation.originalPrice && formation.price && formation.originalPrice > formation.price
  const discountPercent = hasDiscount ? calculateDiscount(formation.originalPrice!, formation.price!) : 0
  
  const modules = parseTextList(formation.modules, 3)
  const objectives = parseTextList(formation.objectifs, 2)
  
  const levelColor = formation.level ? levelColors[formation.level] : 'bg-gray-100 text-gray-700'
  const categoryColor = formation.categorie ? (categoryColors[formation.categorie as keyof typeof categoryColors] || 'bg-gray-100 text-gray-700') : 'bg-gray-100 text-gray-700'

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative ${
        featured ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      {/* Badge Featured */}
      {featured && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm font-semibold text-center flex items-center justify-center gap-2">
          <Sparkle className="w-4 h-4" />
          <span>Formation vedette</span>
        </div>
      )}

      {/* Image / Illustration */}
      <div className={`h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative ${featured ? 'mt-10' : ''}`}>
        {formation.imageUrl ? (
          <img 
            src={formation.imageUrl} 
            alt={formation.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="w-16 h-16 text-blue-600" />
        )}

        {/* Badge Réduction */}
        {hasDiscount && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Header: Catégorie + Note */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}>
            {formation.categorie?.replace(/-/g, ' ') || 'Formation'}
          </span>
          {formation.rating && formation.reviewCount && (
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">{formation.rating}</span>
              <span className="text-xs text-gray-500">({formation.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Titre */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
          {formation.title}
        </h3>

        {/* Description courte / Promesse */}
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
          {formation.shortDescription || summarizeText(formation.description, 120)}
        </p>

        {/* Objectifs principaux */}
        {objectives.length > 0 && (
          <div className="mb-4 space-y-1">
            {objectives.map((objective, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{objective}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {formation.tags && formation.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formation.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {formation.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{formation.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Détails: Durée, Format, Niveau, Étudiants */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {formation.duree && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 truncate">{formation.duree}</span>
            </div>
          )}
          
          {formation.enrollmentCount !== undefined && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 truncate">{formation.enrollmentCount} étudiants</span>
            </div>
          )}
          
          {formation.level && (
            <div className="flex items-center gap-2">
              <TargetIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColor} truncate`}>
                {formation.level.charAt(0).toUpperCase() + formation.level.slice(1)}
              </span>
            </div>
          )}
          
          {formation.format && (
            <div className="flex items-center gap-2">
              <FormatIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 truncate">
                {formation.format === 'en_ligne' ? 'En ligne' : 
                 formation.format === 'presentiel' ? 'Présentiel' : 'Hybride'}
              </span>
            </div>
          )}
        </div>

        {/* Inclusions */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex flex-wrap gap-2 text-xs">
            {formation.hasCertificate && (
              <div className="flex items-center gap-1 text-gray-600">
                <Award className="w-3 h-3 text-blue-500" />
                <span>Certificat</span>
              </div>
            )}
            {formation.hasCoaching && (
              <div className="flex items-center gap-1 text-gray-600">
                <UserIcon className="w-3 h-3 text-green-500" />
                <span>Coaching</span>
              </div>
            )}
            {formation.hasSupports && (
              <div className="flex items-center gap-1 text-gray-600">
                <BookOpen className="w-3 h-3 text-purple-500" />
                <span>Supports</span>
              </div>
            )}
            {formation.hasPracticalExercises && (
              <div className="flex items-center gap-1 text-gray-600">
                <TrendingUp className="w-3 h-3 text-orange-500" />
                <span>Exercices</span>
              </div>
            )}
          </div>
        </div>

        {/* Formateur */}
        {formation.instructor && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                {formation.instructor.photoUrl ? (
                  <img 
                    src={formation.instructor.photoUrl} 
                    alt={`${formation.instructor.firstName} ${formation.instructor.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formation.instructor.firstName} {formation.instructor.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {formation.instructor.title}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sessions ouvertes associées */}
        {formation.sessions && formation.sessions.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mt-4 text-left">
            <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Prochaines sessions ouvertes</span>
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {formation.sessions.map((session: any) => {
                const available = session.maxParticipants - (session.currentParticipants || 0)
                const isFull = available <= 0
                const statusText = isFull ? 'Complet' : 'Ouverte'
                const statusColor = isFull ? 'bg-red-100 text-red-700' : 'bg-green-150 text-green-800'
                return (
                  <div key={session.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(session.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} ({session.format})
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {session.location} • {isFull ? 'Complet' : `${available} place(s) restante(s)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${statusColor}`}>
                        {statusText}
                      </span>
                      <Link
                        href={
                          isLoggedIn
                            ? `/${locale}/espace-etudiants/confirm-inscription?formationId=${formation.id}&sessionId=${session.id}`
                            : `/${locale}/espace-etudiants?formationId=${formation.id}&sessionId=${session.id}`
                        }
                        className={`px-2.5 py-1.5 rounded font-bold text-[10px] transition-colors whitespace-nowrap ${
                          isFull
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {isFull ? (locale === 'fr' ? "Attente" : "Waitlist") : (locale === 'fr' ? "S'inscrire" : "Register")}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Prix et CTA */}
        <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="min-w-0">
            {formation.price !== undefined ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    ${formation.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      ${formation.originalPrice}
                    </span>
                  )}
                </div>
                {formation.nextSession && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    Début: {new Date(formation.nextSession.startDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">Sur demande</p>
            )}
          </div>
          
          <Link
            href={`/${locale}/formations/${formation.slug}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Détails</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
