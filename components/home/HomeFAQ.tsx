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
      answer: 'La page Sessions ouvertes présente les opportunités actuellement disponibles et leurs informations essentielles.',
    },
    {
      question: "Comment s'inscrire à une formation ?",
      answer: "Choisissez la formation ou la session qui vous intéresse, puis utilisez le parcours d'inscription indiqué sur sa page. Notre équipe reste disponible si vous avez besoin d'être orienté.",
    },
    {
      question: 'Proposez-vous des formations sur mesure pour les organisations ?',
      answer: "Oui. CJ Development accompagne les entreprises et institutions avec des programmes adaptés à leurs besoins, ainsi que des services de conseil et d'accompagnement.",
    },
    {
      question: 'Comment fonctionne l’Espace Étudiant ?',
      answer: "L’Espace Étudiant réunit les ressources et le suivi liés à votre parcours. Les modalités d'accès sont communiquées dans le cadre de votre inscription.",
    },
    {
      question: 'Comment obtenir des précisions sur le paiement ou les certificats ?',
      answer: "Ces modalités peuvent varier selon le programme et la session. Contactez notre équipe pour recevoir les informations adaptées à votre situation.",
    },
  ],
  en: [
    {
      question: 'How can I view open sessions?',
      answer: 'The Open Sessions page presents the opportunities currently available and their essential information.',
    },
    {
      question: 'How do I enroll in a training program?',
      answer: 'Choose the training program or session that interests you, then follow the enrollment path shown on its page. Our team remains available to guide you if needed.',
    },
    {
      question: 'Do you offer custom training for organizations?',
      answer: 'Yes. CJ Development supports companies and institutions with programs adapted to their needs, along with advisory and support services.',
    },
    {
      question: 'How does the Student Space work?',
      answer: 'The Student Space brings together resources and follow-up related to your learning path. Access arrangements are communicated as part of your enrollment.',
    },
    {
      question: 'How can I get details about payment or certificates?',
      answer: 'These arrangements may vary by program and session. Contact our team to receive information tailored to your situation.',
    },
  ],
}

export default function HomeFAQ({ locale }: HomeFAQProps) {
  const language = locale === 'en' ? 'en' : 'fr'
  const [items, setItems] = useState<FAQItem[]>(fallbackFaq[language])
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    let mounted = true

    fetch('/api/faq')
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) setItems(data)
      })
      .catch(() => undefined)

    return () => {
      mounted = false
    }
  }, [])

  const text = language === 'fr'
    ? {
        eyebrow: 'FAQ',
        title: 'Foire aux questions',
        description: 'Les réponses aux questions les plus fréquentes sur nos formations, nos sessions et nos services.',
        contact: 'Une question reste en suspens ?',
        contactLink: 'Échangez avec notre équipe',
      }
    : {
        eyebrow: 'FAQ',
        title: 'Frequently asked questions',
        description: 'Answers to the most common questions about our training, sessions and services.',
        contact: 'Still have a question?',
        contactLink: 'Talk to our team',
      }

  return (
    <section aria-labelledby="home-faq-title" className="border-t border-slate-200/80 bg-[#fbfcfe] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20 lg:px-8">
        <div className="lg:pt-2">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--cj-blue)]">
            <span className="h-px w-8 bg-[var(--cj-red)]" aria-hidden="true" />
            {text.eyebrow}
          </p>
          <h2 id="home-faq-title" className="mt-4 max-w-md font-montserrat text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl">
            {text.title}
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            {text.description}
          </p>
          <div className="mt-7 hidden border-l-2 border-[var(--cj-red)] pl-4 text-sm leading-6 text-slate-600 lg:block">
            <p>{text.contact}</p>
            <Link href={`/${locale}/contact`} className="mt-1 inline-flex font-semibold text-[var(--cj-blue)] transition-colors hover:text-[var(--cj-blue-700)]">
              {text.contactLink}
            </Link>
          </div>
        </div>

        <div className="border-y border-slate-200">
          {items.map((item, index) => {
            const isOpen = openIndex === index
            const question = language === 'en' ? item.questionEn || item.question : item.question
            const answer = language === 'en' ? item.answerEn || item.answer : item.answer

            return (
              <article key={item.id ?? `${question}-${index}`} className="border-b border-slate-200 last:border-b-0">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`home-faq-answer-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className={`group flex w-full items-center justify-between gap-5 py-5 text-left transition-colors sm:py-6 ${isOpen ? 'text-[var(--cj-blue)]' : 'text-slate-900 hover:text-[var(--cj-blue)]'}`}
                  >
                    <span className="text-base font-semibold leading-6 sm:text-[1.0625rem]">{question}</span>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center border text-xl font-light leading-none transition-colors ${isOpen ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white' : 'border-slate-300 text-slate-500 group-hover:border-[var(--cj-blue)] group-hover:text-[var(--cj-blue)]'}`} aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                </h3>
                <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="min-h-0">
                    <p id={`home-faq-answer-${index}`} className="max-w-3xl pb-6 pr-10 text-sm leading-7 text-slate-600 sm:text-[0.9375rem]">
                      {answer}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="border-l-2 border-[var(--cj-red)] pl-4 text-sm leading-6 text-slate-600 lg:hidden">
          <p>{text.contact}</p>
          <Link href={`/${locale}/contact`} className="mt-1 inline-flex font-semibold text-[var(--cj-blue)] transition-colors hover:text-[var(--cj-blue-700)]">
            {text.contactLink}
          </Link>
        </div>
      </div>
    </section>
  )
}
