'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type FAQItem = {
  id?: number
  question: string
  questionEn?: string | null
  answer: string
  answerEn?: string | null
}

type HomeFAQProps = {
  locale: string
}

const fallbackFaq: Record<'fr' | 'en', FAQItem[]> = {
  fr: [
    {
      question: 'Comment consulter les sessions ouvertes ?',
      answer: "La page Sessions ouvertes présente toutes les opportunités actuellement disponibles avec leurs informations essentielles : dates, lieu, modalités d'inscription et conditions d'accès. Vous pouvez filtrer par domaine ou niveau pour trouver rapidement ce qui vous convient.",
    },
    {
      question: "Comment s'inscrire à une formation ?",
      answer: "Choisissez la formation ou la session qui vous intéresse, puis utilisez le parcours d'inscription indiqué sur sa page. Le processus est entièrement en ligne et ne prend que quelques minutes. Notre équipe reste disponible si vous avez besoin d'être orienté ou si vous avez des questions spécifiques.",
    },
    {
      question: 'Proposez-vous des formations sur mesure pour les organisations ?',
      answer: "Oui. CJ Development accompagne les entreprises, institutions publiques et ONG avec des programmes entièrement adaptés à leurs besoins stratégiques. Nous réalisons également des missions de conseil, d'audit de compétences et d'accompagnement au changement. Contactez-nous pour un devis personnalisé.",
    },
    {
      question: "Comment fonctionne l'Espace Étudiant ?",
      answer: "L'Espace Étudiant est votre tableau de bord personnel : vous y retrouvez vos cours, ressources pédagogiques, attestations et le suivi de votre progression. Les accès vous sont communiqués par email dès la confirmation de votre inscription. Des tutoriels sont disponibles pour vous guider à la première connexion.",
    },
    {
      question: "Obtient-on un certificat à l'issue de la formation ?",
      answer: "Oui, une attestation de participation ou un certificat professionnel est délivré à l'issue de chaque formation, sous réserve d'assiduité et, selon le programme, de la validation des acquis. Les détails sur la certification sont précisés sur chaque page de formation.",
    },
    {
      question: 'Comment obtenir des précisions sur le paiement ?',
      answer: "Les modalités de paiement (tarif, facilités, prise en charge par l'employeur) varient selon le programme et la session. Contactez notre équipe via le formulaire de contact ou par téléphone pour recevoir les informations adaptées à votre situation personnelle ou professionnelle.",
    },
  ],
  en: [
    {
      question: 'How can I view open sessions?',
      answer: 'The Open Sessions page presents all currently available opportunities with their essential information: dates, location, enrollment process and eligibility requirements. You can filter by field or level to quickly find what suits you.',
    },
    {
      question: 'How do I enroll in a training program?',
      answer: 'Choose the training program or session that interests you, then follow the enrollment path shown on its page. The process is entirely online and takes only a few minutes. Our team remains available to guide you if needed or if you have specific questions.',
    },
    {
      question: 'Do you offer custom training for organizations?',
      answer: 'Yes. CJ Development supports companies, public institutions and NGOs with programs fully adapted to their strategic needs. We also provide consulting, skills audits and change management services. Contact us for a personalized quote.',
    },
    {
      question: 'How does the Student Space work?',
      answer: 'The Student Space is your personal dashboard: you will find your courses, learning resources, certificates and progress tracking. Access credentials are sent by email upon enrollment confirmation. Tutorials are available to guide you through your first login.',
    },
    {
      question: 'Will I receive a certificate upon completion?',
      answer: 'Yes, a certificate of attendance or professional certificate is issued upon completion of each program, subject to attendance requirements and, depending on the program, skills validation. Certification details are specified on each training page.',
    },
    {
      question: 'How can I get details about payment options?',
      answer: 'Payment terms (pricing, installments, employer funding) vary by program and session. Contact our team via the contact form or by phone to receive information tailored to your personal or professional situation.',
    },
  ],
}

const faqIcons = ['🗓️', '📝', '🏢', '🎓', '📜', '💳']

export default function HomeFAQ({ locale }: HomeFAQProps) {
  const language = locale === 'en' ? 'en' : 'fr'
  const [items, setItems] = useState<FAQItem[]>(fallbackFaq[language])
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    let mounted = true
    setItems(fallbackFaq[language])
    setOpenIndex(0)

    fetch('/api/faq')
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return

        // English must never silently display an untranslated French record.
        const localizedItems = language === 'en'
          ? data.filter((item: FAQItem) => item.questionEn?.trim() && item.answerEn?.trim())
          : data

        if (localizedItems.length > 0) setItems(localizedItems)
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [language])

  const text =
    language === 'fr'
      ? {
          eyebrow: 'Questions fréquentes',
          title: 'Tout ce que vous devez',
          titleHighlight: 'savoir',
          description:
            'Retrouvez les réponses aux questions les plus posées sur nos formations, sessions et services.',
          contact: 'Vous ne trouvez pas votre réponse ?',
          contactLink: 'Parlez à notre équipe',
          contactSub: 'Réponse garantie sous 24h ouvrées',
          trust: [
            'Équipe disponible du lundi au vendredi',
            'Vos données sont sécurisées',
            'Support en français et en anglais',
          ],
          stats: ["Années d'expérience", 'Taux de satisfaction'],
        }
      : {
          eyebrow: 'Frequently asked questions',
          title: 'Everything you need to',
          titleHighlight: 'know',
          description:
            'Find answers to the most common questions about our training programs, sessions and services.',
          contact: "Can't find your answer?",
          contactLink: 'Talk to our team',
          contactSub: 'Response guaranteed within 24 business hours',
          trust: [
            'Team available Monday to Friday',
            'Your data is secure and confidential',
            'Support in French and English',
          ],
          stats: ['Years of experience', 'Satisfaction rate'],
        }

  return (
    <section
      aria-labelledby="home-faq-title"
      className="relative overflow-hidden bg-slate-950 py-16 sm:py-20 lg:py-28"
    >
      {/* Decorative background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-cjblue-900/30 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-cjred/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cjblue-800/20 blur-[80px]" />
      </div>


      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-cjblue-500/30 bg-cjblue-900/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-cjblue-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cjred" aria-hidden="true" />
            {text.eyebrow}
          </span>
          <h2
            id="home-faq-title"
            className="mt-5 font-montserrat text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl"
          >
            {text.title}{' '}
            <span className="bg-gradient-to-r from-cjblue-400 to-cjblue-200 bg-clip-text text-transparent">
              {text.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
            {text.description}
          </p>
        </div>

        {/* Main grid: accordion + sticky card */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12 xl:grid-cols-[1fr_360px]">
          {/* FAQ accordion */}
          <div className="space-y-3">
            {items.map((item, index) => {
              const isOpen = openIndex === index
              const question = language === 'en' ? item.questionEn! : item.question
              const answer = language === 'en' ? item.answerEn! : item.answer
              const icon = faqIcons[index % faqIcons.length]

              return (
                <article
                  key={item.id ?? `${question}-${index}`}
                  className={`group rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-cjblue-500/50 bg-cjblue-900/30 shadow-lg shadow-cjblue-900/20'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`home-faq-answer-${index}`}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6 sm:py-6"
                    >
                      {/* Icon badge */}
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-300 ${
                          isOpen ? 'bg-cjblue-600 shadow-md shadow-cjblue-900/40' : 'bg-slate-700/60 group-hover:bg-slate-700'
                        }`}
                        aria-hidden="true"
                      >
                        {icon}
                      </span>

                      {/* Question */}
                      <span
                        className={`flex-1 text-base font-semibold leading-6 transition-colors duration-200 sm:text-[1.0625rem] ${
                          isOpen ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {question}
                      </span>

                      {/* Chevron */}
                      <span
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                          isOpen
                            ? 'rotate-180 bg-cjblue-500 text-white'
                            : 'bg-slate-700/60 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                        }`}
                        aria-hidden="true"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 4L6 8L10 4"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </h3>

                  {/* Answer panel */}
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0">
                      <p
                        id={`home-faq-answer-${index}`}
                        className="px-5 pb-6 pl-[3.75rem] pr-6 text-sm leading-7 text-slate-400 sm:text-[0.9375rem]"
                      >
                        {answer}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Sticky contact card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-3xl border border-cjblue-500/30 bg-gradient-to-br from-cjblue-900/60 to-slate-900/80 p-8 backdrop-blur-sm">
              {/* Glow accents */}
              <div
                aria-hidden="true"
                className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cjblue-500/20 blur-2xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-cjred/10 blur-2xl"
              />

              <div className="relative">
                {/* Chat icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cjblue-500 to-cjblue-700 shadow-lg shadow-cjblue-900/50">
                  <svg
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>

                <h3 className="font-montserrat text-xl font-bold text-white">{text.contact}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text.contactSub}</p>

                <Link
                  href={`/${locale}/contact`}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cjblue-500 to-cjblue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cjblue-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:from-cjblue-400 hover:to-cjblue-500 hover:shadow-xl hover:shadow-cjblue-900/50"
                >
                  {text.contactLink} →
                </Link>

                {/* Trust indicators */}
                <div className="mt-6 space-y-3 border-t border-slate-700/50 pt-6">
                  {[
                    { icon: '✅', label: text.trust[0] },
                    { icon: '🔒', label: text.trust[1] },
                    { icon: '🌐', label: text.trust[2] },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-base" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span className="text-xs text-slate-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 text-center">
                <p className="font-montserrat text-2xl font-black text-cjblue-400">10+</p>
                <p className="mt-1 text-xs text-slate-500">{text.stats[0]}</p>
              </div>
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 text-center">
                <p className="font-montserrat text-2xl font-black text-cjblue-400">98%</p>
                <p className="mt-1 text-xs text-slate-500">{text.stats[1]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
