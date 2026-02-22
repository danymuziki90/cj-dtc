'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Users, 
  Award, 
  Globe, 
  Target,
  BookOpen,
  Heart,
  Eye,
  Lightbulb,
  Shield,
  Flag,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Star,
  Linkedin
} from 'lucide-react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission')

  const values = [
    {
      id: 1,
      title: 'Excellence',
      description: 'Nous nous engageons à fournir des formations de la plus haute qualité, conformes aux standards internationaux.',
      icon: Award,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      title: 'Intégrité',
      description: 'Nous agissons avec honnêteté, transparence et éthique dans toutes nos relations professionnelles.',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 3,
      title: 'Innovation',
      description: 'Nous encourageons la créativité et l\'adaptation aux nouvelles réalités du monde professionnel.',
      icon: Lightbulb,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 4,
      title: 'Impact',
      description: 'Nous mesurons notre succès par l\'impact positif sur la carrière de nos participants.',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const team = [
    {
      id: 1,
      name: 'Dr. Christian Junior',
      role: 'Fondateur & CEO',
      bio: 'Expert en leadership panafricain avec 15+ années d\'expérience en formation et développement.',
      image: '/team/christian.jpg',
      credentials: 'PhD, Harvard Business School',
      linkedin: '#'
    },
    {
      id: 2,
      name: 'Marie Mwamba',
      role: 'Directrice Académique',
      bio: 'Spécialiste en management des ressources humaines et développement organisationnel.',
      image: '/team/marie.jpg',
      credentials: 'MBA, Université de Kinshasa',
      linkedin: '#'
    },
    {
      id: 3,
      name: 'Jean-Pierre Lukoki',
      role: 'Directeur des Programmes',
      bio: 'Expert en transformation digitale et innovation managériale.',
      image: '/team/jean-pierre.jpg',
      credentials: 'MSc, MIT Sloan',
      linkedin: '#'
    },
    {
      id: 4,
      name: 'Sarah Kabeya',
      role: 'Directrice des Opérations',
      bio: 'Spécialiste en gestion de projets et qualité de la formation.',
      image: '/team/sarah.jpg',
      credentials: 'PMP, Project Management Institute',
      linkedin: '#'
    }
  ]

  const milestones = [
    {
      year: '2014',
      title: 'Fondation',
      description: 'Création de CJ DTC avec une vision : former les leaders africains de demain.',
      achievement: 'Première cohorte de 25 étudiants'
    },
    {
      year: '2016',
      title: 'Expansion',
      description: 'Ouverture de programmes internationaux et partenariats stratégiques.',
      achievement: '100+ diplômés dans 5 pays'
    },
    {
      year: '2018',
      title: 'Reconnaissance',
      description: 'Accréditation par les institutions internationales et certification SHRM.',
      achievement: 'Première certification SHRM délivrée'
    },
    {
      year: '2020',
      title: 'Digitalisation',
      description: 'Lancement de la plateforme e-learning et formation à distance.',
      achievement: '500+ étudiants en ligne'
    },
    {
      year: '2022',
      title: 'Excellence',
      description: 'Devenir la référence en formation panafricaine.',
      achievement: '95% de taux de réussite'
    },
    {
      year: '2024',
      title: 'Innovation',
      description: 'Lancement de nouveaux programmes en IA et transformation digitale.',
      achievement: '10+ pays couverts'
    }
  ]

  const stats = [
    { number: "10+", label: "Années d'Excellence", icon: Calendar },
    { number: "500+", label: "Professionnels Formés", icon: Users },
    { number: "10+", label: "Pays Africains", icon: Globe },
    { number: "95%", label: "Taux de Réussite", icon: Target }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Link href="/fr" className="inline-flex items-center space-x-2 text-blue-200 hover:text-white mb-8">
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Retour à l'accueil</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              À Propos de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                {" "}CJ DTC
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Plus qu'une institution de formation, un mouvement panafricain pour l'excellence managériale et le leadership transformationnel
            </p>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission/Vision Tabs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Notre
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Identité
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Les valeurs qui guident notre action et notre vision pour l'Afrique
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'mission' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mission
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'vision' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vision
              </button>
              <button
                onClick={() => setActiveTab('values')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'values' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Valeurs
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === 'mission' && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Notre Mission</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Former et développer les compétences des leaders et managers africains en leur offrant des programmes d'excellence 
                  qui combinent standards internationaux et réalités locales. Nous nous engageons à créer une génération de leaders 
                  capables de transformer leurs organisations et de contribuer au développement durable du continent africain.
                </p>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Notre Vision</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Devenir la référence panafricaine en formation et développement du leadership, reconnue pour notre capacité 
                  à produire des leaders visionnaires qui transforment positivement leurs organisations et leurs sociétés. 
                  Nous aspirons à un continent africain où l'excellence managériale est le moteur du développement durable.
                </p>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="grid md:grid-cols-2 gap-6">
                {values.map((value) => (
                  <div key={value.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                      <value.icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Notre
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Histoire
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une décennie d'excellence et d'impact sur le continent africain
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <div className="flex-1 px-8">
                    <div className={`bg-white rounded-xl shadow-lg p-6 ${index % 2 === 0 ? 'mr-auto' : 'ml-auto'} max-w-md`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                        <span className="text-sm text-blue-600 font-semibold">{milestone.year}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{milestone.description}</p>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-500">{milestone.achievement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Notre
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Équipe
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des experts passionnés dédiés à votre succès professionnel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.id} className="group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-gray-600 mb-3">{member.bio}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{member.credentials}</span>
                      <a href={member.linkedin} className="text-blue-600 hover:text-blue-700">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Rejoignez Notre
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
              {" "}Communauté
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Faites partie de la prochaine génération de leaders africains
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/fr/formations"
              className="px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Explorer nos formations
            </Link>
            <Link 
              href="/fr/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-all"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
