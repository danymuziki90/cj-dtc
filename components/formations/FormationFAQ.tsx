/**
 * Section FAQ pour la page formations
 */

'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "Comment s'inscrire à une formation ?",
    answer: "Pour vous inscrire, cliquez sur 'Voir les détails' de la formation qui vous intéresse, puis sur le bouton 'S'inscrire'. Remplissez le formulaire d'inscription et suivez les instructions de paiement. Vous recevrez un email de confirmation avec tous les détails."
  },
  {
    question: "Les formations sont-elles certifiantes ?",
    answer: "Oui, toutes nos formations délivrent un certificat officiel de CJ Development Training Center à l'issue de la formation, sous réserve d'avoir suivi l'intégralité du programme et validé les évaluations. Certaines formations préparent également à des certifications internationales reconnues."
  },
  {
    question: "Les cours sont-ils en ligne ou en présentiel ?",
    answer: "Nous proposons trois formats : présentiel (à Kinshasa), 100% en ligne, et hybride (combinant présentiel et distanciel). Le format est indiqué sur chaque fiche de formation. Vous pouvez filtrer les formations par format selon vos préférences."
  },
  {
    question: "Quels sont les prérequis pour suivre une formation ?",
    answer: "Les prérequis varient selon les formations et le niveau (débutant, intermédiaire, avancé, expert). Ils sont clairement indiqués sur la page détaillée de chaque formation. Pour les formations débutant, aucun prérequis particulier n'est généralement requis."
  },
  {
    question: "Peut-on suivre plusieurs formations en même temps ?",
    answer: "Oui, vous pouvez vous inscrire à plusieurs formations simultanément. Cependant, nous recommandons de bien évaluer votre disponibilité pour garantir un apprentissage de qualité. Notre équipe peut vous conseiller sur la meilleure stratégie selon vos objectifs."
  },
  {
    question: "Comment obtenir son certificat ?",
    answer: "Le certificat est délivré automatiquement après validation de tous les modules et réussite des évaluations finales. Vous recevrez une version numérique par email, et pouvez demander une version imprimée (frais supplémentaires peuvent s'appliquer)."
  },
  {
    question: "Existe-t-il des formations sur mesure pour les entreprises ?",
    answer: "Oui, nous proposons des programmes de formation sur mesure pour les entreprises, ONG et institutions. Contactez-nous pour discuter de vos besoins spécifiques, et nous créerons un programme adapté à votre organisation, vos objectifs et votre budget."
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons plusieurs modes de paiement : virement bancaire, Mobile Money (M-Pesa, Orange Money, Airtel Money), carte bancaire, et paiement en espèces à notre centre. Des facilités de paiement en plusieurs fois sont également disponibles pour certaines formations."
  },
  {
    question: "Peut-on avoir un remboursement si je ne peux pas suivre la formation ?",
    answer: "Oui, nous avons une politique de remboursement. Si vous annulez votre inscription plus de 15 jours avant le début de la formation, vous êtes éligible à un remboursement complet. Entre 7 et 15 jours, un remboursement de 50% est possible. Moins de 7 jours, aucun remboursement n'est possible sauf cas de force majeure."
  },
  {
    question: "Les supports de cours sont-ils fournis ?",
    answer: "Oui, tous nos étudiants reçoivent des supports de cours complets (documents PDF, présentations, exercices pratiques). Pour les formations en ligne, vous avez également accès à une plateforme LMS avec des vidéos, quiz et ressources complémentaires."
  }
]

export default function FormationFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [dbFaqs, setDbFaqs] = useState<FAQItem[]>([])

  useEffect(() => {
    let active = true
    fetch('/api/faq')
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setDbFaqs(data)
        }
      })
      .catch((err) => console.error('Error fetching FAQs:', err))
    return () => {
      active = false
    }
  }, [])

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqList = dbFaqs.length > 0 ? dbFaqs : faqItems

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions Fréquentes
          </h2>
          <p className="text-lg text-gray-600">
            Toutes les réponses à vos questions sur nos formations
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqList.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Vous ne trouvez pas la réponse à votre question ?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            Contactez-nous
          </a>
        </div>
      </div>
    </section>
  )
}
