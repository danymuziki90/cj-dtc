'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Eye,
  Download,
  Calendar,
  MapPin,
  BookOpen,
  Award,
  Clock,
  Users,
  Target,
  TrendingUp,
  Star,
  ChevronRight,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Play,
  FileText,
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react'

export default function FormationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFormations, setSelectedFormations] = useState<string[]>([])

  // Mock data - would come from API
  const formations = [
    {
      id: '1',
      title: "Management des Ressources Humaines",
      slug: "management-rh",
      description: "Maîtrisez les stratégies RH modernes adaptées au contexte africain avec cette certification complète reconnue mondialement.",
      category: "certification",
      level: "avancé",
      format: "présentiel",
      duration: "3 mois",
      price: 850,
      originalPrice: 1200,
      rating: 4.8,
      reviews: 127,
      students: 450,
      status: "published",
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
      tags: ["RH", "Management", "Certification", "SHRM"],
      language: ["fr", "en"],
      createdAt: "2024-01-15",
      updatedAt: "2024-01-28"
    },
    {
      id: '2',
      title: "Leadership et Management d'Équipe",
      slug: "leadership-management",
      description: "Développez votre leadership transformationnel et apprenez à inspirer vos équipes vers l'excellence.",
      category: "masterclass",
      level: "intermédiaire",
      format: "hybride",
      duration: "6 semaines",
      price: 650,
      originalPrice: 900,
      rating: 4.9,
      reviews: 89,
      students: 320,
      status: "published",
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
      tags: ["Leadership", "Management", "Communication"],
      language: ["fr"]
    },
    {
      id: '3',
      title: "Digital Marketing Stratégique",
      slug: "digital-marketing",
      description: "Maîtrisez les techniques du marketing digital pour développer votre présence en ligne.",
      category: "workshop",
      level: "débutant",
      format: "en ligne",
      duration: "4 semaines",
      price: 450,
      originalPrice: 600,
      rating: 4.7,
      reviews: 156,
      students: 280,
      status: "published",
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
      tags: ["Marketing", "Digital", "SEO", "Social Media"],
      language: ["fr", "en"]
    },
    {
      id: '4',
      title: "Family Business Governance",
      slug: "family-business",
      description: "Pérennisez votre entreprise familiale avec des stratégies de gouvernance éprouvées.",
      category: "certification",
      level: "avancé",
      format: "présentiel",
      duration: "2 mois",
      price: 1200,
      originalPrice: 1500,
      rating: 4.9,
      reviews: 67,
      students: 180,
      status: "published",
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
      tags: ["Family Business", "Gouvernance", "Succession"],
      language: ["fr"]
    },
    {
      id: '5',
      title: "CJ Master System",
      slug: "cj-master-system",
      description: "Le programme complet d'excellence managériale pour les leaders de demain.",
      category: "programme",
      level: "expert",
      format: "hybride",
      duration: "6 mois",
      price: 3500,
      originalPrice: 5000,
      rating: 5.0,
      reviews: 45,
      students: 95,
      status: "published",
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
      tags: ["Executive", "Master", "Leadership", "Stratégie"],
      language: ["fr", "en"]
    },
    {
      id: '6',
      title: "International Operations Protocol",
      slug: "international-operations",
      description: "Maîtrisez les protocoles et relations internationales dans un contexte global.",
      category: "certification",
      level: "intermédiaire",
      format: "présentiel",
      duration: "8 semaines",
      price: 750,
      originalPrice: 1000,
      rating: 4.6,
      reviews: 78,
      students: 220,
      status: "published",
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
      tags: ["Protocol", "International", "Diplomatie"],
      language: ["fr", "en"]
    }
  ]

  const categories = [
    { id: 'all', name: 'Toutes les catégories', count: formations.length },
    { id: 'certification', name: 'Certifications', count: formations.filter(f => f.category === 'certification').length },
    { id: 'masterclass', name: 'Masterclasses', count: formations.filter(f => f.category === 'masterclass').length },
    { id: 'workshop', name: 'Workshops', count: formations.filter(f => f.category === 'workshop').length },
    { id: 'programme', name: 'Programmes', count: formations.filter(f => f.category === 'programme').length }
  ]

  const levels = [
    { id: 'all', name: 'Tous les niveaux' },
    { id: 'débutant', name: 'Débutant' },
    { id: 'intermédiaire', name: 'Intermédiaire' },
    { id: 'avancé', name: 'Avancé' },
    { id: 'expert', name: 'Expert' }
  ]

  const statuses = [
    { id: 'all', name: 'Tous les statuts', count: formations.length },
    { id: 'draft', name: 'Brouillon', count: formations.filter(f => f.status === 'draft').length },
    { id: 'published', name: 'Publié', count: formations.filter(f => f.status === 'published').length },
    { id: 'archived', name: 'Archivé', count: formations.filter(f => f.status === 'archived').length }
  ]

  const sortOptions = [
    { id: 'created', name: 'Plus récent' },
    { id: 'title', name: 'Titre A-Z' },
    { id: 'title', name: 'Titre Z-A' },
    { id: 'students', name: 'Plus populaire' },
    { id: 'rating', name: 'Mieux noté' },
    { id: 'price-low', name: 'Prix croissant' },
    { id: 'price-high', name: 'Prix décroissant' }
  ]

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         formation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || formation.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || formation.level === selectedLevel
    const matchesStatus = selectedStatus === 'all' || formation.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'title-z':
        return b.title.localeCompare(a.title)
      case 'students':
        return b.students - a.students
      case 'rating':
        return b.rating - a.rating
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'published': return 'bg-green-100 text-green-700'
      case 'archived': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleSelectFormation = (formationId: string) => {
    setSelectedFormations(prev => 
      prev.includes(formationId) 
        ? prev.filter(id => id !== formationId)
        : [...prev, formationId]
    )
  }

  const handleSelectAllFormations = () => {
    if (selectedFormations.length === filteredFormations.length) {
      setSelectedFormations([])
    } else {
      setSelectedFormations(filteredFormations.map(f => f.id))
    }
  }

  const handleDeleteFormation = async (formationId: string) => {
    // API call to delete formation
    console.log('Deleting formation:', formationId)
    // In real implementation, this would call an API
  }

  const handleDuplicateFormation = async (formationId: string) => {
    // API call to duplicate formation
    console.log('Duplicating formation:', formationId)
    // In real implementation, this would call an API
  }

  const handleExportFormations = () => {
    // Export formations data to CSV/Excel
    console.log('Exporting formations...')
    // In real implementation, this would generate and download a file
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ChevronRight className="w-5 h-5 rotate-180" />
                <span>Retour</span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Formations</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des formations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                <span>Filtres</span>
                {(selectedCategory !== 'all' || selectedLevel !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/admin/formations/new')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle formation</span>
                </button>
                
                {selectedFormations.length > 0 && (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Exporter</span>
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 bg-white">
              <div className="px-6 py-4 space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:-ring-2 focus:ring-blue-500"
                  >
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name} ({status.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedLevel('all')
                      setSelectedStatus('all')
                      setSearchQuery('')
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredFormations.length}</span> formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedFormations.length} sélectionné{selectedFormations.length > 1 ? 's' : ''}
              </span>
              {selectedFormations.length > 0 && (
                <button
                  onClick={() => setSelectedFormations([])}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Désélectionner</span>
                </button>
              )}
            </div>
          </div>

          {/* Formations Grid */}
          <div className="grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((formation) => (
              <div
                key={formation.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  selectedFormations.includes(formation.id) ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getCategoryColor(formation.category)} rounded-xl flex items-center justify-center`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(formation.category)}`}>
                        {formation.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{formation.rating}</span>
                        <span className="text-xs text-gray-500">({formation.reviews})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {formation.originalPrice > formation.price && (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-red-600">${formation.price}$</span>
                          <span className="text-sm text-gray-500 line-through">${formation.originalPrice}$</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{formation.title}</h3>
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
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formation.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span>{formation.level}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{formation.location}</span>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formation.instructor}</p>
                          <p className="text-xs text-gray-500">{formation.instructorTitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progression</span>
                      <span className="text-sm font-medium text-gray-900">{formation.progress}%</span>
                    </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(formation.progress)}`}
                          style={{ width: `${formation.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-lg font-bold text-gray-900">
                        {formation.originalPrice > formation.price ? (
                          <>
                            <span className="text-lg font-bold text-red-600">${formation.price}$</span>
                            <span className="text-sm text-gray-500 line-through">${formation.originalPrice}$</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">${formation.price}$</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Link 
                          href={`/admin/formations/${formation.id}/edit`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Modifier</span>
                        </Link>
                        <Link 
                          href={`/admin/formations/${formation.id}/duplicate`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Dupliquer</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteFormation(formation.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* No Results */}
            {filteredFormations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune formation trouvée</h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche ou créer une nouvelle formation.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                    setSelectedStatus('all')
                    setSearchQuery('')
                    setShowFilters(false)
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredFormations.length > 0 && (
              <div className="flex items-center justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.ceil(filteredFormations.length / 6) }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                          currentPage === index + 1 ? 'bg-blue-600 text-white' : ''
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.ceil(filteredFormations.length / 6))}
                    disabled={currentPage >= Math.ceil(filteredFormations.length / 6)}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
                <div className="text-sm text-gray-700 mt-2">
                  Affichage de {(currentPage - 1) * 6 + 1} à {Math.min(currentPage * 6, filteredFormations.length)} sur {filteredFormations.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    </div>
  )
}
