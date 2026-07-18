/**
 * Section d'orientation pour aider les visiteurs à choisir leur formation
 */

'use client'

import Link from 'next/link'
import { Compass, Users, Briefcase, GraduationCap, Rocket, Building2, MessageCircleIcon } from 'lucide-react'

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
            <MessageCircleIcon className="w-12 h-12 mb-4" />
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
              <MessageCircleIcon className="w-5 h-5 mr-2" />
              Prendre rendez-vous
            </Link>
            <a
              href="https://wa.me/243995136626?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous%20avec%20un%20conseiller%20p%C3%A9dagogique."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Discuter sur WhatsApp
            </a>
            <a
              href="mailto:contact@cjdevelopmenttc.org?subject=Demande%20d'orientation%20p%C3%A9dagogique"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Envoyer un e-mail
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
