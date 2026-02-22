'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Filter, 
  Search, 
  Clock, 
  Users, 
  Award, 
  Calendar,
  Star,
  BookOpen,
  Target,
  TrendingUp,
  ChevronRight,
  MapPin,
  DollarSign,
  BarChart3,
  CheckCircle,
  Play,
  Download,
  Heart,
  Share2
} from 'lucide-react'

export default function FormationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  const formations = [
    {
      id: 1,
      title: "Management des Ressources Humaines",
      slug: "management-rh",
      category: "certification",
      level: "avancé",
      format: "présentiel",
      duration: "3 mois",
      price: 850,
      originalPrice: 1200,
      rating: 4.8,
      reviews: 127,
      students: 450,
      description: "Maîtrisez les stratégies RH modernes adaptées au contexte africain avec cette certification complète.",
      objectives: [
        "Développer une stratégie RH alignée sur les objectifs business",
        "Maîtriser la gestion des talents et de la performance",
        "Implémenter des systèmes de rémunération équitables",
        "Gérer le changement et la transformation organisationnelle"
      ],
      prerequisites: "Expérience professionnelle de 3+ ans en RH",
      certification: "Certification CJ DTC + Préparation SHRM-CP",
      nextSession: "2024-02-15",
      location: "Kinshasa",
      instructor: "Dr. Marie Mwamba",
      instructorTitle: "Expert en RH internationale",
      image: "/formations/mrh.jpg",
      featured: true,
      tags: ["RH", "Management", "Certification", "SHRM"],
      language: ["fr", "en"]
    },
    {
      id: 2,
      title: "Leadership et Management d'Équipe",
      slug: "leadership-management",
      category: "masterclass",
      level: "intermédiaire",
      format: "hybride",
      duration: "6 semaines",
      price: 650,
      originalPrice: 900,
      rating: 4.9,
      reviews: 89,
      students: 320,
      description: "Développez votre leadership transformationnel et apprenez à inspirer vos équipes vers l'excellence.",
      objectives: [
        "Comprendre les différents styles de leadership",
        "Développer son intelligence émotionnelle",
        "Maîtriser la communication et l'écoute active",
        "Construire une culture d'entreprise performante"
      ],
      prerequisites: "Poste de management ou projet de promotion",
      certification: "Certificat de Leadership CJ DTC",
      nextSession: "2024-02-01",
      location: "En ligne + Présentiel",
      instructor: "Prof. Jean-Pierre Lukoki",
      instructorTitle: "Expert en leadership transformationnel",
      image: "/formations/leadership.jpg",
      featured: true,
      tags: ["Leadership", "Management", "Communication"],
      language: ["fr"]
    },
    {
      id: 3,
      title: "Digital Marketing Stratégique",
      slug: "digital-marketing",
      category: "workshop",
      level: "débutant",
      format: "en ligne",
      duration: "4 semaines",
      price: 450,
      originalPrice: 600,
      rating: 4.7,
      reviews: 156,
      students: 280,
      description: "Maîtrisez les techniques du marketing digital pour développer votre présence en ligne.",
      objectives: [
        "Élaborer une stratégie marketing digitale complète",
        "Maîtriser les réseaux sociaux et le content marketing",
        "Analyser les performances avec Google Analytics",
        "Optimiser le référencement naturel (SEO)"
      ],
      prerequisites: "Aucun prérequis particulier",
      certification: "Certificat de Digital Marketing CJ DTC",
      nextSession: "2024-02-10",
      location: "100% en ligne",
      instructor: "Mme. Sarah Kabeya",
      instructorTitle: "Spécialiste en marketing digital",
      image: "/formations/marketing.jpg",
      featured: false,
      tags: ["Marketing", "Digital", "SEO", "Social Media"],
      language: ["fr", "en"]
    },
    {
      id: 4,
      title: "Family Business Governance",
      slug: "family-business",
      category: "certification",
      level: "avancé",
      format: "présentiel",
      duration: "2 mois",
      price: 1200,
      originalPrice: 1500,
      rating: 4.9,
      reviews: 67,
      students: 180,
      description: "Pérennisez votre entreprise familiale avec des stratégies de gouvernance éprouvées.",
      objectives: [
        "Structurer la gouvernance d'entreprise familiale",
        "Gérer les relations familiales et professionnelles",
        "Préparer la succession et la transmission",
        "Développer une vision à long terme"
      ],
      prerequisites: "Membre d'une entreprise familiale ou projet de création",
      certification: "Certification Family Business CJ DTC",
      nextSession: "2024-03-01",
      location: "Kinshasa",
      instructor: "Dr. Christian Junior",
      instructorTitle: "Expert en gouvernance d'entreprise",
      image: "/formations/family-business.jpg",
      featured: false,
      tags: ["Family Business", "Gouvernance", "Succession"],
      language: ["fr"]
    },
    {
      id: 5,
      title: "CJ Master System",
      slug: "cj-master-system",
      category: "programme",
      level: "expert",
      format: "hybride",
      duration: "6 mois",
      price: 3500,
      originalPrice: 5000,
      rating: 5.0,
      reviews: 45,
      students: 95,
      description: "Le programme complet d'excellence managériale pour les leaders de demain.",
      objectives: [
        "Maîtriser tous les aspects du management stratégique",
        "Développer une vision globale de l'entreprise",
        "Acquérir des compétences en transformation digitale",
        "Devenir un leader visionnaire et inspirant"
      ],
      prerequisites: "5+ ans d'expérience en management",
      certification: "Diplôme Executive Master CJ DTC",
      nextSession: "2024-04-01",
      location: "Kinshasa + International",
      instructor: "Équipe d'experts CJ DTC",
      instructorTitle: "Professeurs internationaux",
      image: "/formations/cj-master.jpg",
      featured: true,
      tags: ["Executive", "Master", "Leadership", "Stratégie"],
      language: ["fr", "en"]
    },
    {
      id: 6,
      title: "International Operations Protocol",
      slug: "international-operations",
      category: "certification",
      level: "intermédiaire",
      format: "présentiel",
      duration: "8 semaines",
      price: 750,
      originalPrice: 1000,
      rating: 4.6,
      reviews: 78,
      students: 220,
      description: "Maîtrisez les protocoles et relations internationales dans un contexte global.",
      objectives: [
        "Comprendre les protocoles diplomatiques et d'affaires",
        "Maîtriser les règles de l'étiquette internationale",
        "Développer des compétences en négociation interculturelle",
        "Gérer les relations avec les partenaires internationaux"
      ],
      prerequisites: "Poste à responsabilité internationale ou projet d'expansion",
      certification: "Certification Protocol International CJ DTC",
      nextSession: "2024-02-20",
      location: "Kinshasa",
      instructor: "Amb. Jean-Claude Muteba",
      instructorTitle: "Ancien diplomate",
      image: "/formations/iop.jpg",
      featured: false,
      tags: ["Protocol", "International", "Diplomatie"],
      language: ["fr", "en"]
    }
  ]

  const categories = [
    { id: 'all', name: 'Toutes les catégories', count: formations.length },
    { id: 'certification', name: 'Certifications', count: 3 },
    { id: 'masterclass', name: 'Masterclasses', count: 1 },
    { id: 'workshop', name: 'Workshops', count: 1 },
    { id: 'programme', name: 'Programmes', count: 1 }
  ]

  const levels = [
    { id: 'all', name: 'Tous les niveaux' },
    { id: 'débutant', name: 'Débutant' },
    { id: 'intermédiaire', name: 'Intermédiaire' },
    { id: 'avancé', name: 'Avancé' },
    { id: 'expert', name: 'Expert' }
  ]

  const formats = [
    { id: 'all', name: 'Tous les formats' },
    { id: 'présentiel', name: 'Présentiel' },
    { id: 'en ligne', name: 'En ligne' },
    { id: 'hybride', name: 'Hybride' }
  ]

  const sortOptions = [
    { id: 'popular', name: 'Plus populaire' },
    { id: 'price-low', name: 'Prix croissant' },
    { id: 'price-high', name: 'Prix décroissant' },
    { id: 'rating', name: 'Mieux noté' },
    { id: 'newest', name: 'Plus récent' }
  ]

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         formation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || formation.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || formation.level === selectedLevel
    const matchesFormat = selectedFormat === 'all' || formation.format === selectedFormat
    
    return matchesSearch && matchesCategory && matchesLevel && matchesFormat
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.nextSession) - new Date(a.nextSession)
      default:
        return b.students - a.students
    }
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'certification': return 'bg-blue-100 text-blue-700'
      case 'masterclass': return 'bg-purple-100 text-purple-700'
      case 'workshop': return 'bg-green-100 text-green-700'
      case 'programme': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'débutant': return 'bg-green-100 text-green-700'
      case 'intermédiaire': return 'bg-yellow-100 text-yellow-700'
      case 'avancé': return 'bg-orange-100 text-orange-700'
      case 'expert': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'présentiel': return MapPin
      case 'en ligne': return BookOpen
      case 'hybride': return Users
      default: return Calendar
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Link href="/fr" className="inline-flex items-center space-x-2 text-blue-200 hover:text-white mb-8">
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Retour à l'accueil</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nos
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                {" "}Formations
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
              Des programmes certifiants conçus par des experts pour accélérer votre carrière professionnelle
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{formations.length}</div>
                <div className="text-sm text-blue-200">Formations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formations.reduce((sum, f) => sum + f.students, 0).toLocaleString()}
                </div>
                <div className="text-sm text-blue-200">Étudiants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {(formations.reduce((sum, f) => sum + f.rating, 0) / formations.length).toFixed(1)}
                </div>
                <div className="text-sm text-blue-200">Note moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">95%</div>
                <div className="text-sm text-blue-200">Taux de réussite</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Filtres</span>
              {(selectedCategory !== 'all' || selectedLevel !== 'all' || selectedFormat !== 'all') && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>

                {/* Format Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {formats.map(format => (
                      <option key={format.id} value={format.id}>{format.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                    setSelectedFormat('all')
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredFormations.length}</span> formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <Heart className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Formations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFormations.map((formation) => (
            <div 
              key={formation.id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${
                formation.featured ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              {/* Featured Badge */}
              {formation.featured && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm font-semibold text-center">
                  ⭐ Formation Vedette
                </div>
              )}

              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                <BookOpen className="w-16 h-16 text-blue-600" />
                
                {/* Price Badge */}
                {formation.originalPrice > formation.price && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{Math.round((1 - formation.price / formation.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(formation.category)}`}>
                    {formation.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{formation.rating}</span>
                    <span className="text-xs text-gray-500">({formation.reviews})</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {formation.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {formation.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formation.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {formation.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{formation.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{formation.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{formation.students} étudiants</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className={`px-2 py-1 rounded text-xs ${getLevelColor(formation.level)}`}>
                      {formation.level}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {React.createElement(getFormatIcon(formation.format), { className: "w-4 h-4 text-gray-400" })}
                    <span className="text-gray-600">{formation.format}</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formation.instructor}</p>
                      <p className="text-xs text-gray-500">{formation.instructorTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">${formation.price}</span>
                      {formation.originalPrice > formation.price && (
                        <span className="text-sm text-gray-500 line-through">${formation.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Prochaine session: {formation.nextSession}</p>
                  </div>
                  <Link 
                    href={`/fr/formations/${formation.slug}`}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2"
                  >
                    <span>Détails</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFormations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche ou de filtres
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedLevel('all')
                setSelectedFormat('all')
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ne Trouvez Pas Ce Que Vous Cherchez ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Notre équipe peut vous aider à trouver la formation idéale pour vos objectifs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/fr/contact"
              className="px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Contacter un conseiller
            </Link>
            <Link 
              href="/fr/programmes"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-all"
            >
              Voir tous les programmes
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
