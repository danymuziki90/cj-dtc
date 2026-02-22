'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  MessageSquare,
  Users,
  Building,
  Globe,
  Flag
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    interest: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adresse',
      details: 'Avenue des Aviateurs, Commune de la Gombe',
      city: 'Kinshasa, République Démocratique du Congo',
      link: 'https://maps.google.com/?q=CJ+DTC+Kinshasa'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      details: '+243 123 456 789',
      link: 'tel:+243123456789'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'info@cjdtc.com',
      link: 'mailto:info@cjdtc.com'
    },
    {
      icon: Clock,
      title: 'Heures d\'ouverture',
      details: 'Lun-Ven: 8h00 - 18h00',
      details2: 'Sam: 9h00 - 13h00'
    }
  ]

  const services = [
    {
      icon: Users,
      title: 'Orientation Étudiants',
      description: 'Conseil personnalisé pour choisir la formation adaptée à vos objectifs',
      email: 'students@cjdtc.com'
    },
    {
      icon: Building,
      title: 'Services Entreprises',
      description: 'Formations sur mesure et consulting pour vos équipes',
      email: 'corporate@cjdtc.com'
    },
    {
      icon: Globe,
      title: 'Partenariats Internationaux',
      description: 'Collaborations avec les institutions et organisations internationales',
      email: 'partners@cjdtc.com'
    },
    {
      icon: MessageSquare,
      title: 'Support Technique',
      description: 'Assistance pour la plateforme e-learning et les questions techniques',
      email: 'support@cjdtc.com'
    }
  ]

  const faqs = [
    {
      question: 'Quels sont les prérequis pour s\'inscrire à vos formations ?',
      answer: 'Les prérequis varient selon les programmes. La plupart de nos certifications requièrent une expérience professionnelle de 2-3 ans, tandis que nos workshops sont accessibles à tous. Consultez la fiche de chaque formation pour plus de détails.'
    },
    {
      question: 'Proposez-vous des formations en ligne ?',
      answer: 'Oui, nous proposons des formations 100% en ligne, en présentiel et en format hybride. Nos programmes en ligne incluent des sessions live, des ressources interactives et un accompagnement personnalisé.'
    },
    {
      question: 'Comment puis-je financer ma formation ?',
      answer: 'Nous proposons plusieurs options de financement : paiement en plusieurs fois, partenariats avec des entreprises, et des bourses pour les étudiants méritants. Contactez-nous pour discuter des options disponibles.'
    },
    {
      question: 'Les certifications sont-elles reconnues internationalement ?',
      answer: 'Oui, nos certifications sont reconnues par les institutions internationales et préparent aux certifications SHRM, PMP, et autres standards mondiaux.'
    },
    {
      question: 'Quel est le processus d\'admission ?',
      answer: 'Le processus inclut une soumission en ligne, un entretien (pour certains programmes), et une confirmation d\'admission. Le processus complet prend généralement 2-3 semaines.'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simuler l'envoi du formulaire
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Réinitialiser le formulaire après 5 secondes
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        interest: 'general'
      })
    }, 5000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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
              Contactez
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                {" "}CJ DTC
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre parcours de formation
            </p>
          </div>
        </div>
      </header>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                <div className="text-gray-600">
                  <p>{info.details}</p>
                  {info.details2 && <p>{info.details2}</p>}
                </div>
                {info.link && (
                  <a 
                    href={info.link}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    {info.title === 'Téléphone' ? 'Appeler' : info.title === 'Email' ? 'Envoyer un email' : 'Voir sur la carte'}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Envoyez-nous un
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                  {" "}Message
                </span>
              </h2>
              
              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Message envoyé avec succès !
                  </h3>
                  <p className="text-green-700 mb-4">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <div className="text-sm text-green-600">
                    Redirection automatique...
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Votre nom"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="votre.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+243 XXX XXX XXX"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-2">
                      Centre d'intérêt
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">Information générale</option>
                      <option value="formation">Inscription formation</option>
                      <option value="enterprise">Services entreprise</option>
                      <option value="partnership">Partenariat</option>
                      <option value="technical">Support technique</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sujet de votre message"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Décrivez votre demande ou question..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Envoyer le message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Services */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Services Spécialisés
              </h2>
              <p className="text-gray-600 mb-8">
                Contactez directement nos équipes spécialisées selon vos besoins
              </p>
              
              <div className="space-y-6">
                {services.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-gray-600 mb-3">{service.description}</p>
                        <a 
                          href={`mailto:${service.email}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center space-x-1"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{service.email}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens Rapides</h3>
                <div className="space-y-3">
                  <Link 
                    href="/fr/formations"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Voir toutes nos formations</span>
                  </Link>
                  <Link 
                    href="/fr/a-propos"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>En savoir plus sur CJ DTC</span>
                  </Link>
                  <Link 
                    href="/fr/verification"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Vérifier un certificat</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Fréquentes
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Les réponses aux questions les plus courantes sur nos formations
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Vous ne trouvez pas réponse à votre question ?
            </p>
            <Link 
              href="/fr/contact"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Contacter notre équipe</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Suivez-nous sur les
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {" "}Réseaux Sociaux
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Restez connecté avec notre communauté et nos actualités
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <a 
              href="https://facebook.com/cjdtc"
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a 
              href="https://twitter.com/cjdtc"
              className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a 
              href="https://linkedin.com/company/cjdtc"
              className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a 
              href="https://instagram.com/cjdtc"
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://youtube.com/cjdtc"
              className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
            >
              <Youtube className="w-6 h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Retrouvez-nous
            </h2>
            <p className="text-xl text-gray-600">
              Venez nous rendre visite dans nos locaux
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">CJ DTC Headquarters</h3>
                <p className="text-gray-600 mb-4">Avenue des Aviateurs, Commune de la Gombe</p>
                <p className="text-gray-600">Kinshasa, République Démocratique du Congo</p>
                <a 
                  href="https://maps.google.com/?q=CJ+DTC+Kinshasa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Voir sur Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
