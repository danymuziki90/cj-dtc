'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type ContactFormData = {
  name: string
  email: string
  subject: string
  message: string
}

type ContactCard = {
  icon: LucideIcon
  title: string
  value: string
  detail: string
  href?: string
}

const copy = publicMessages.contact

export default function ContactPage() {
  const params = useParams<{ locale?: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]

  const contactCards: ContactCard[] = [
    {
      icon: Mail,
      title: t.cards[0].title,
      value: 'contact@cjdevelopmenttc.org',
      detail: t.cards[0].detail,
      href: 'mailto:contact@cjdevelopmenttc.org',
    },
    {
      icon: Phone,
      title: t.cards[1].title,
      value: '+243 995 136 626',
      detail: t.cards[1].detail,
      href: 'tel:+243995136626',
    },
    {
      icon: MapPin,
      title: t.cards[2].title,
      value: locale === 'fr' ? 'Republique Democratique du Congo' : 'Democratic Republic of the Congo',
      detail: t.cards[2].detail,
    },
    {
      icon: Clock3,
      title: t.cards[3].title,
      value: locale === 'fr' ? 'Traitement prioritaire' : 'Priority handling',
      detail: t.cards[3].detail,
    },
  ]

  const supportHighlights: Array<{ icon: LucideIcon; title: string; description: string }> = [
    {
      icon: ShieldCheck,
      title: t.highlights[0].title,
      description: t.highlights[0].description,
    },
    {
      icon: Sparkles,
      title: t.highlights[1].title,
      description: t.highlights[1].description,
    },
  ]

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange =
    (field: keyof ContactFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((previous) => ({ ...previous, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || t.submitError)
      }

      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : t.unexpectedError
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-12">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(0,45,114,0.16),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(227,6,19,0.14),transparent_45%)]" />
      <div className="pointer-events-none absolute -left-24 top-20 -z-10 h-80 w-80 rounded-full bg-cjblue/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-8 -z-10 h-72 w-72 rounded-full bg-cjred/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cjblue/10 blur-3xl" />

      <div className="container mx-auto px-4">
        <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(130deg,#002D72_0%,#003b96_60%,#E30613_150%)] px-6 py-10 text-white shadow-[0_35px_90px_rgba(0,45,114,0.34)] sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.22),transparent_40%),radial-gradient(circle_at_88%_10%,rgba(227,6,19,0.45),transparent_36%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.18)_70%,rgba(255,255,255,0.35)_100%)] sm:block" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
                {t.heroBadge}
              </p>
              <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">{t.heroTitle}</h1>
              <p className="max-w-3xl text-base text-blue-100 sm:text-lg">{t.heroDescription}</p>
            </div>

            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-lg shadow-[0_20px_45px_rgba(0,0,0,0.25)]">
              <p className="text-sm font-semibold text-white/90">{t.quickHelp}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href={`/${locale}/programmes`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-cjblue transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  {t.sessionsCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="tel:+243995136626"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  {t.callNow}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {contactCards.map((card) => {
            const content = (
              <>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#002D72_0%,#003b96_70%,#E30613_160%)] text-white shadow-lg">
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.title}</p>
                <p className="mt-2 text-base font-bold text-slate-900">{card.value}</p>
                <p className="mt-1 text-sm text-slate-600">{card.detail}</p>
              </>
            )

            if (card.href) {
              return (
                <a
                  key={card.title}
                  href={card.href}
                  className="group relative rounded-2xl border border-slate-200/80 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_45px_rgba(15,23,42,0.09)] transition duration-300 hover:-translate-y-1 hover:border-cjblue/30 hover:shadow-[0_24px_60px_rgba(0,45,114,0.2)]"
                >
                  {content}
                </a>
              )
            }

            return (
              <div key={card.title} className="relative rounded-2xl border border-slate-200/80 bg-white/85 p-5 backdrop-blur-sm shadow-[0_18px_45px_rgba(15,23,42,0.09)]">
                {content}
              </div>
            )
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <div className="relative">
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-cjblue/25 via-cjblue/5 to-cjred/20 blur-xl" />
            <div className="relative h-full rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_80px_rgba(0,45,114,0.12)] backdrop-blur-xl sm:p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-cjblue">{t.supportEyebrow}</p>
              <h2 className="mb-4 text-2xl font-bold text-cjblue sm:text-3xl">{t.supportTitle}</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{t.supportDescription}</p>

              <div className="mt-8 space-y-4">
                {supportHighlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cjblue/10 text-cjblue">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[linear-gradient(135deg,rgba(0,45,114,0.97)_0%,rgba(0,59,150,0.96)_70%,rgba(227,6,19,0.92)_150%)] p-5 text-white shadow-xl">
                <p className="text-sm font-semibold text-blue-100">{t.priorityChannel}</p>
                <a
                  href="mailto:contact@cjdevelopmenttc.org"
                  className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-white hover:text-blue-100"
                >
                  contact@cjdevelopmenttc.org
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-cjred/25 via-white/0 to-cjblue/20 blur-xl" />
            <div className="relative rounded-[1.75rem] border border-white/70 bg-white/95 p-6 shadow-[0_32px_90px_rgba(15,23,42,0.17)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cjred/10 text-cjred">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="mb-0 text-2xl font-bold text-cjblue sm:text-3xl">{t.formTitle}</h2>
                  <p className="mb-0 text-sm text-slate-600">{t.formDescription}</p>
                </div>
              </div>

              {success && (
                <div role="status" className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{t.successTitle}</p>
                      <p className="text-sm">{t.successDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                      {t.fields.name}
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange('name')}
                      placeholder={t.fields.namePlaceholder}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-cjblue focus:outline-none focus:ring-4 focus:ring-cjblue/15"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                      {t.fields.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange('email')}
                      placeholder={t.fields.emailPlaceholder}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-cjblue focus:outline-none focus:ring-4 focus:ring-cjblue/15"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.fields.subject}
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange('subject')}
                    placeholder={t.fields.subjectPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-cjblue focus:outline-none focus:ring-4 focus:ring-cjblue/15"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700">
                    {t.fields.message}
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange('message')}
                    placeholder={t.fields.messagePlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-cjblue focus:outline-none focus:ring-4 focus:ring-cjblue/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#E30613_0%,#b3040f_100%)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_rgba(227,6,19,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(227,6,19,0.42)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? t.submitting : t.submit}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
