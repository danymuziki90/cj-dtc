/**
 * Section d'orientation pour aider les visiteurs à choisir leur formation
 */

'use client'

import Link from 'next/link'
import { Compass, Users, Briefcase, GraduationCap, Rocket, Building2, MessageCircle } from 'lucide-react'

interface GuidanceProfile {
  id: string
  title: string
  description: string
  icon: any
  recommendations: string[]
  color: string
}

const profiles: GuidanceProfile[] = [
  {
    id: 'student',
    title: 'Étudiant',
    description: 'Vous préparez votre entrée dans le monde professionnel',
    icon: GraduationCap,
    recommendations: [
      'Employabilité & Insertion Professionnelle',
      'Développement Personnel',
      'Digital Marketing Stratégique'
    ],
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'young-professional',
    title: 'Jeune Professionnel',
    description: 'Vous cherchez à développer vos compétences',
    icon: Users,
    recommendations: [
      'Leadership et Management d\'Équipe',
      'Gestion de Projets',
      'Transformation Digitale'
    ],
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'manager',
    title: 'Manager / Cadre',
    description: 'Vous occupez un poste de responsabilité',
    icon: Briefcase,
    recommendations: [
      'Management des Ressources Humaines',
      'Leadership & Gouvernance',
      'CJ Master System'
    ],
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Vous créez ou dirigez votre entreprise',
    icon: Rocket,
    recommendations: [
      'Family Business Governance',
      'Entrepreneuriat',
      'Gestion de Projets'
    ],
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'organization',
    title: 'Organisation / Entreprise',
    description: 'Formation pour vos équipes',
    icon: Building2,
    recommendations: [
      'Formations Entreprises sur mesure',
      'Leadership & Gouvernance',
      'Transformation Digitale'
    ],
    color: 'bg-red-100 text-red-600'
  }
]

export default function FormationGuidance({ locale = 'fr' }: { locale?: string }) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Compass className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vous ne savez pas quelle formation choisir ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Laissez-nous vous guider selon votre profil et vos objectifs professionnels
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${profile.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                <profile.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {profile.title}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                {profile.description}
              </p>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Formations recommandées :
                </p>
                <ul className="space-y-1">
                  {profile.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Contact Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-center items-center text-center">
            <MessageCircle className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">
              Besoin d'aide ?
            </h3>
            <p className="text-blue-100 mb-6 text-sm">
              Nos conseillers sont là pour vous accompagner dans votre choix
            </p>
            <Link
              href={`/${locale}/contact`}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Demander une orientation
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Toujours indécis ?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Prenez rendez-vous avec un conseiller pédagogique pour un entretien gratuit. 
            Nous analyserons ensemble votre profil, vos objectifs et vous recommanderons 
            le parcours de formation le plus adapté.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/contact`}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Prendre rendez-vous
            </Link>
            <a
              href="tel:+243123456789"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              Appeler un conseiller
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
