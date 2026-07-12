/**
 * Types enrichis pour le système de formations
 * Support complet pour le catalogue professionnel
 */

export type FormationLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert' | 'professionnel'
export type FormationFormat = 'presentiel' | 'en_ligne' | 'hybride'
export type FormationStatus = 'brouillon' | 'publie' | 'archive'

export interface FormationCategory {
  id: string
  name: string
  description: string
  icon?: string
  slug: string
}

export interface FormationPublicTarget {
  id: string
  name: string
  description?: string
}

export interface FormationInclusion {
  id: string
  label: string
  included: boolean
}

export interface FormationModule {
  id: string
  title: string
  description: string
  duration?: string
  order: number
}

export interface FormationInstructor {
  id: string
  firstName: string
  lastName: string
  title: string
  bio?: string
  photoUrl?: string
  expertise?: string[]
}

export interface FormationSession {
  id: number
  startDate: string
  endDate: string
  location: string
  format: FormationFormat
  price: number
  maxParticipants: number
  currentParticipants: number
  status: string
}

// Type principal pour une formation complète
export interface Formation {
  // Champs de base (existants en DB)
  id: number
  title: string
  slug: string
  description: string
  objectifs?: string
  duree?: string
  modules?: string
  methodes?: string
  certification?: string
  categorie?: string
  statut: FormationStatus
  imageUrl?: string
  createdAt: string
  updatedAt: string

  // Champs enrichis (à ajouter en DB ou calculés)
  level?: FormationLevel
  format?: FormationFormat
  shortDescription?: string // Promesse de résultat courte
  publicTargets?: string[] // Public cible
  prerequisites?: string // Prérequis
  skillsAcquired?: string[] // Compétences développées
  
  // Inclusions
  hasCertificate?: boolean
  hasCoaching?: boolean
  hasSupports?: boolean
  hasAccompaniment?: boolean
  hasPracticalExercises?: boolean
  
  // Modules structurés
  modulesStructured?: FormationModule[]
  
  // Instructeur(s)
  instructor?: FormationInstructor
  instructors?: FormationInstructor[]
  
  // Sessions disponibles
  sessions?: FormationSession[]
  nextSession?: FormationSession
  
  // Analytics & engagement
  enrollmentCount?: number
  rating?: number
  reviewCount?: number
  completionRate?: number
  
  // Tarification
  price?: number
  originalPrice?: number
  hasPromotion?: boolean
  
  // Méta
  featured?: boolean
  tags?: string[]
  language?: string[]
  estimatedHours?: number
}

// Type pour le catalogue avec filtres
export interface FormationCatalogFilters {
  search?: string
  category?: string
  level?: FormationLevel | 'all'
  format?: FormationFormat | 'all'
  priceMin?: number
  priceMax?: number
  featured?: boolean
  tags?: string[]
}

// Type pour les statistiques du catalogue
export interface CatalogStats {
  totalFormations: number
  totalStudents: number
  averageRating: number
  successRate: number
  categoriesCount: Record<string, number>
}

// Catégories par défaut du centre
export const FORMATION_CATEGORIES: FormationCategory[] = [
  {
    id: 'leadership-gouvernance',
    name: 'Leadership & Gouvernance',
    description: 'Développez vos compétences en leadership et gouvernance d\'entreprise',
    slug: 'leadership-gouvernance'
  },
  {
    id: 'employabilite-iop',
    name: 'Employabilité & Insertion Professionnelle',
    description: 'Programmes d\'insertion et développement professionnel',
    slug: 'employabilite-iop'
  },
  {
    id: 'ressources-humaines',
    name: 'Ressources Humaines',
    description: 'Management RH et gestion des talents',
    slug: 'ressources-humaines'
  },
  {
    id: 'developpement-personnel',
    name: 'Développement Personnel',
    description: 'Croissance personnelle et soft skills',
    slug: 'developpement-personnel'
  },
  {
    id: 'gestion-projets',
    name: 'Gestion de Projets',
    description: 'Méthodologies et outils de gestion de projets',
    slug: 'gestion-projets'
  },
  {
    id: 'entrepreneuriat',
    name: 'Entrepreneuriat',
    description: 'Création et développement d\'entreprise',
    slug: 'entrepreneuriat'
  },
  {
    id: 'transformation-digitale',
    name: 'Transformation Digitale',
    description: 'Digitalisation et innovation technologique',
    slug: 'transformation-digitale'
  },
  {
    id: 'intelligence-artificielle',
    name: 'Intelligence Artificielle',
    description: 'IA et technologies émergentes',
    slug: 'intelligence-artificielle'
  },
  {
    id: 'forums-conferences',
    name: 'Forums & Conférences',
    description: 'Événements et masterclasses',
    slug: 'forums-conferences'
  },
  {
    id: 'entreprises-institutions',
    name: 'Formations Entreprises',
    description: 'Programmes sur mesure pour organisations',
    slug: 'entreprises-institutions'
  }
]

// Publics cibles
export const PUBLIC_TARGETS: FormationPublicTarget[] = [
  { id: 'etudiants', name: 'Étudiants', description: 'Étudiants en formation initiale' },
  { id: 'jeunes-diplomes', name: 'Jeunes diplômés', description: 'Jeunes diplômés en recherche d\'emploi' },
  { id: 'professionnels', name: 'Professionnels', description: 'Salariés en poste' },
  { id: 'managers', name: 'Managers', description: 'Cadres et managers' },
  { id: 'entrepreneurs', name: 'Entrepreneurs', description: 'Créateurs et dirigeants d\'entreprise' },
  { id: 'ong', name: 'ONG', description: 'Membres d\'organisations non gouvernementales' },
  { id: 'entreprises', name: 'Entreprises', description: 'Équipes et organisations' },
  { id: 'institutions', name: 'Institutions', description: 'Administrations et institutions publiques' }
]

// Niveaux de formation
export const FORMATION_LEVELS = [
  { id: 'debutant', name: 'Débutant', description: 'Aucun prérequis' },
  { id: 'intermediaire', name: 'Intermédiaire', description: 'Connaissances de base requises' },
  { id: 'avance', name: 'Avancé', description: 'Expérience professionnelle requise' },
  { id: 'expert', name: 'Expert', description: 'Expertise confirmée requise' },
  { id: 'professionnel', name: 'Professionnel', description: 'Programme executive' }
]

// Formats de formation
export const FORMATION_FORMATS = [
  { id: 'presentiel', name: 'Présentiel', description: 'En salle à Kinshasa', icon: 'MapPin' },
  { id: 'en_ligne', name: 'En ligne', description: '100% à distance', icon: 'Monitor' },
  { id: 'hybride', name: 'Hybride', description: 'Présentiel + En ligne', icon: 'Layers' }
]

// Inclusions standards
export const STANDARD_INCLUSIONS: FormationInclusion[] = [
  { id: 'certificate', label: 'Certificat de formation', included: true },
  { id: 'coaching', label: 'Coaching personnalisé', included: false },
  { id: 'supports', label: 'Supports de cours', included: true },
  { id: 'accompaniment', label: 'Accompagnement post-formation', included: false },
  { id: 'exercises', label: 'Exercices pratiques', included: true },
  { id: 'evaluation', label: 'Évaluation des compétences', included: true },
  { id: 'community', label: 'Accès communauté alumni', included: false },
  { id: 'job_support', label: 'Aide à l\'insertion professionnelle', included: false }
]
