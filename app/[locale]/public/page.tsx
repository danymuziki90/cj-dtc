'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  Users, 
  Award, 
  Globe, 
  CheckCircle, 
  Play, 
  Star,
  TrendingUp,
  BookOpen,
  Target,
  Flag,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      title: "Excellence Panafricaine",
      subtitle: "Formation de leadership et management d'excellence",
      description: "Rejoignez plus de 500 professionnels formés dans 10 pays africains",
      cta: "Découvrir nos formations",
      ctaLink: "/fr/formations",
      bgImage: "/images/hero-1.jpg"
    },
    {
      title: "Certifications Internationales",
      subtitle: "Standards Harvard & SHRM",
      description: "Obtenez des certifications reconnues mondialement",
      cta: "Voir les programmes",
      ctaLink: "/fr/programmes",
      bgImage: "/images/hero-2.jpg"
    },
    {
      title: "Insertion Professionnelle",
      subtitle: "95% de taux de réussite",
      description: "Accélérez votre carrière avec notre réseau de partenaires",
      cta: "Réussir avec CJ DTC",
      ctaLink: "/fr/succes",
      bgImage: "/images/hero-3.jpg"
    }
  ]

  const stats = [
    { number: "500+", label: "Étudiants Formés", icon: Users },
    { number: "10+", label: "Pays Africains", icon: Globe },
    { number: "95%", label: "Taux de Réussite", icon: TrendingUp },
    { number: "50+", label: "Formations", icon: BookOpen }
  ]

  const formations = [
    {
      id: 1,
      title: "Management des Ressources Humaines",
      category: "Certification",
      duration: "3 mois",
      level: "Avancé",
      description: "Maîtrisez les stratégies RH modernes adaptées au contexte africain",
      image: "/formations/mrh.jpg",
      price: "À partir de 850$",
      featured: true
    },
    {
      id: 2,
      title: "Leadership et Management d'Équipe",
      category: "Masterclass",
      duration: "6 semaines",
      level: "Intermédiaire",
      description: "Développez votre leadership transformationnel",
      image: "/formations/leadership.jpg",
      price: "À partir de 650$",
      featured: true
    },
    {
      id: 3,
      title: "Digital Marketing Stratégique",
      category: "Workshop",
      duration: "4 semaines",
      level: "Débutant",
      description: "Maîtrisez les techniques du marketing digital",
      image: "/formations/marketing.jpg",
      price: "À partir de 450$",
      featured: false
    },
    {
      id: 4,
      title: "Family Business Governance",
      category: "Certification",
      duration: "2 mois",
      level: "Avancé",
      description: "Pérennisez votre entreprise familiale",
      image: "/formations/family-business.jpg",
      price: "À partir de 1200$",
      featured: false
    },
    {
      id: 5,
      title: "CJ Master System",
      category: "Programme",
      duration: "6 mois",
      level: "Expert",
      description: "Le programme complet d'excellence managériale",
      image: "/formations/cj-master.jpg",
      price: "Sur demande",
      featured: true
    },
    {
      id: 6,
      title: "International Operations Protocol",
      category: "Certification",
      duration: "8 semaines",
      level: "Intermédiaire",
      description: "Protocol et relations internationales",
      image: "/formations/iop.jpg",
      price: "À partir de 750$",
      featured: false
    }
  ]

  const testimonials = [
    {
      id: 1,
      name: "Marie Mwamba",
      role: "Directrice RH, Mining Company RDC",
      content: "La formation MRH a transformé ma pratique professionnelle. Les standards internationaux appliqués à notre contexte africain sont exceptionnels.",
      rating: 5,
      image: "/testimonials/marie.jpg",
      company: "Mining Company RDC"
    },
    {
      id: 2,
      name: "Jean-Pierre Lukoki",
      role: "CEO, Tech Startup Kinshasa",
      content: "Le programme Leadership m'a permis de passer de manager à leader visionnaire. Investissement rentable !",
      rating: 5,
      image: "/testimonials/jean-pierre.jpg",
      company: "Tech Startup Kinshasa"
    },
    {
      id: 3,
      name: "Sarah Kabeya",
      role: "Marketing Manager, Multinationale",
      content: "Excellente approche pédagogique et réseau de qualité. J'ai décroché une promotion 6 mois après la certification.",
      rating: 5,
      image: "/testimonials/sarah.jpg",
      company: "Multinationale"
    }
  ]

  const partners = [
    { name: "World Bank", logo: "/partners/world-bank.png" },
    { name: "UNESCO", logo: "/partners/unesco.png" },
    { name: "African Union", logo: "/partners/au.png" },
    { name: "SHRM", logo: "/partners/shrm.png" },
    { name: "Harvard Business", logo: "/partners/harvard.png" },
    { name: "Microsoft", logo: "/partners/microsoft.png" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Flag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CJ DTC</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Development Training Center</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/fr" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                Accueil
              </Link>
              <Link href="/fr/a-propos" className="text-gray-600 hover:text-blue-600 transition-colors">
                À Propos
              </Link>
              <Link href="/fr/formations" className="text-gray-600 hover:text-blue-600 transition-colors">
                Formations
              </Link>
              <Link href="/fr/programmes" className="text-gray-600 hover:text-blue-600 transition-colors">
                Programmes
              </Link>
              <Link href="/fr/partenaires" className="text-gray-600 hover:text-blue-600 transition-colors">
                Partenaires
              </Link>
              <Link href="/fr/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                href="/fr/espace-etudiants"
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Espace Étudiants
              </Link>
              <Link 
                href="/fr/auth/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                S'inscrire
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              <Link href="/fr" className="block text-gray-900 font-medium hover:text-blue-600">
                Accueil
              </Link>
              <Link href="/fr/a-propos" className="block text-gray-600 hover:text-blue-600">
                À Propos
              </Link>
              <Link href="/fr/formations" className="block text-gray-600 hover:text-blue-600">
                Formations
              </Link>
              <Link href="/fr/programmes" className="block text-gray-600 hover:text-blue-600">
                Programmes
              </Link>
              <Link href="/fr/partenaires" className="block text-gray-600 hover:text-blue-600">
                Partenaires
              </Link>
              <Link href="/fr/contact" className="block text-gray-600 hover:text-blue-600">
                Contact
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link 
                  href="/fr/espace-etudiants"
                  className="block w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-center font-medium"
                >
                  Espace Étudiants
                </Link>
                <Link 
                  href="/fr/auth/register"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-medium"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Flags */}
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">🇨🇩</span>
              </div>
              <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">🌍</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Excellence
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                Panafricaine
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Formation de leadership et management d'excellence pour les professionnels africains
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/fr/formations"
                className="px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Découvrir nos formations</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/fr/auth/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-xl"
              >
                S'inscrire maintenant
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-blue-200" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nos Programmes de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Formation
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des programmes certifiants conçus par des experts internationaux pour le contexte africain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formations.map((formation) => (
              <div 
                key={formation.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${
                  formation.featured ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                {formation.featured && (
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm font-semibold text-center">
                    Programme Vedette
                  </div>
                )}
                
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-blue-600" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {formation.category}
                    </span>
                    <span className="text-sm text-gray-500">{formation.duration}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {formation.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {formation.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Niveau: {formation.level}</span>
                    <span className="text-lg font-bold text-blue-600">{formation.price}</span>
                  </div>
                  
                  <Link 
                    href={`/fr/formations/${formation.id}`}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>En savoir plus</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/fr/formations"
              className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
            >
              <span>Voir toutes les formations</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi Choisir
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                  {" "}CJ DTC
                </span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Standards Internationaux
                    </h3>
                    <p className="text-gray-600">
                      Programmes conçus selon les standards Harvard et SHRM, adaptés au contexte africain
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Expertise Panafricaine
                    </h3>
                    <p className="text-gray-600">
                      Plus de 10 ans d'expérience dans la formation des professionnels africains
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Insertion Professionnelle
                    </h3>
                    <p className="text-gray-600">
                      95% de nos diplômés obtiennent une promotion ou un meilleur poste dans les 6 mois
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Réseau International
                    </h3>
                    <p className="text-gray-600">
                      Accès à notre réseau de partenaires et d'anciens diplômés dans 10+ pays
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Flag className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-blue-900 mb-2">CJ DTC</div>
                  <div className="text-sm text-blue-700">Excellence • Leadership • Innovation</div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🇨🇩</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">🌍</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce Que Disent Nos
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Anciens Diplômés
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Témoignages de professionnels qui ont transformé leur carrière avec CJ DTC
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-blue-600">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nos Partenaires
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Internationaux
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Reconnus par les institutions les plus prestigieuses
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center justify-center h-20 grayscale hover:grayscale-0 transition-all">
                <div className="w-32 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-sm text-gray-600 font-semibold">{partner.name}</span>
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
            Prêt à Transformer Votre Carrière ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez plus de 500 professionnels qui ont choisi l'excellence avec CJ DTC
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/fr/auth/register"
              className="px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              S'inscrire Maintenant
            </Link>
            <Link 
              href="/fr/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-all"
            >
              Nous Contacter
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">CJ DTC</h3>
                  <p className="text-xs text-gray-400">Development Training Center</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Excellence panafricaine en formation et leadership
              </p>
              <div className="flex space-x-4">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Formations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/fr/formations/mrh" className="hover:text-white">Management RH</Link></li>
                <li><Link href="/fr/formations/leadership" className="hover:text-white">Leadership</Link></li>
                <li><Link href="/fr/formations/marketing" className="hover:text-white">Digital Marketing</Link></li>
                <li><Link href="/fr/formations/family-business" className="hover:text-white">Family Business</Link></li>
                <li><Link href="/fr/formations/cj-master" className="hover:text-white">CJ Master System</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/fr/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/fr/ressources" className="hover:text-white">Ressources</Link></li>
                <li><Link href="/fr/carrieres" className="hover:text-white">Carrières</Link></li>
                <li><Link href="/fr/partenaires" className="hover:text-white">Partenaires</Link></li>
                <li><Link href="/fr/verification" className="hover:text-white">Vérification Certificats</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Kinshasa, RDC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+243 XXX XXX XXX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@cjdtc.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CJ DTC. Tous droits réservés. | 
              <Link href="/fr/mentions-legales" className="hover:text-white"> Mentions Légales</Link> | 
              <Link href="/fr/politique-confidentialite" className="hover:text-white"> Politique de Confidentialité</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
