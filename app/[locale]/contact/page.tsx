'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Compass,
  MailIcon,
  MapPinIcon,
  MessageCircle,
  Phone,
  Send,
  UserCheck,
  Users,
} from 'lucide-react'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'
import UnifiedHero from '@/components/ui/UnifiedHero'
import type { HeroSectionData } from '@/lib/hero/types'

const copy = publicMessages.contact

// ─── Types ────────────────────────────────────────────────────────────────────
type FormData = {
  name: string
  email: string
  phone: string
  org: string
  reason: string
  subject: string
  message: string
}

const EMPTY_FORM: FormData = {
  name: '', email: '', phone: '', org: '', reason: '', subject: '', message: '',
}

// ─── Icon map (why-cards) ─────────────────────────────────────────────────────
const WHY_ICONS = { UserCheck, Users, Clock3, Compass }

// ─── Channel icon map ─────────────────────────────────────────────────────────
const CHANNEL_ICONS: Record<string, React.ElementType> = {
  Mail: MailIcon,
  MessageCircle,
  Phone,
  MapPin: MapPinIcon,
}

// ─── Section badge ────────────────────────────────────────────────────────────
function SectionBadge({ text }: { text: string }) {
  return (
    <span className="mb-2.5 inline-block rounded-full border border-[var(--cj-blue)]/20 bg-[var(--cj-blue)]/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[var(--cj-blue)]">
      {text}
    </span>
  )
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-[var(--cj-blue)]/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-900">{question}</span>
        {open
          ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-[var(--cj-blue)]" />
          : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
          <p className="text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const params = useParams<{ locale?: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]

  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [heroData, setHeroData] = useState<HeroSectionData | null>(null)

  useEffect(() => {
    fetch('/api/hero-images?pageKey=contact')
      .then((r) => r.json())
      .then((data) => setHeroData(data))
      .catch(() => {})
  }, [])

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? t.submitError)
      setSuccess(true)
      setForm(EMPTY_FORM)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.unexpectedError)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--cj-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--cj-blue)]/10'
  const labelCls = 'mb-1 block text-xs sm:text-sm font-semibold text-slate-700'

  return (
    <div className="bg-slate-50 text-slate-900">
      {/* ── SECTION 1 — HERO COMPACT ──────────────────────────────────────── */}
      <UnifiedHero
        eyebrow={t.heroBadge}
        title={t.heroTitle}
        description={t.heroSubtitle}
        image="/img/team.jpeg"
        ctas={[
          { label: t.heroCta1, href: '#contact-form', variant: 'primary' },
          { label: t.heroCta2, href: `/${locale}/formations`, variant: 'secondary' }
        ]}
        heroData={heroData}
        locale={locale}
        compact
      >
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-5 sm:gap-8">
            {[
              { value: '15+', label: locale === 'fr' ? 'Années' : 'Years' },
              { value: '10+', label: locale === 'fr' ? 'Pays' : 'Countries' },
              { value: '8 500+', label: locale === 'fr' ? 'Étudiants' : 'Students' },
            ].map((stat) => (
              <div key={stat.label} className="text-left font-opensans">
                <div className="text-lg sm:text-xl font-black text-white font-montserrat">{stat.value}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 border border-white/15 backdrop-blur-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-white">
              {locale === 'fr' ? 'Réponse sous 24h' : 'Reply within 24h'}
            </span>
          </div>
        </div>
      </UnifiedHero>

      {/* ── SECTION 2 — CONTACT CHANNELS ─────────────────────────────────── */}
      <section id="contact-channels" className="bg-white py-10 sm:py-14 lg:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
            <SectionBadge text={t.contactSectionBadge} />
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {t.contactSectionTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-slate-500">
              {t.contactSectionDescription}
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.channels.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.icon] ?? MailIcon
              const isExternal = channel.href.startsWith('http')
              return (
                <div
                  key={channel.id}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--cj-blue)]/8 text-[var(--cj-blue)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {channel.label}
                  </div>
                  <div className="mb-1.5 text-sm font-semibold text-slate-900 break-all">
                    {channel.value}
                  </div>
                  <p className="mb-3 flex-1 text-xs leading-relaxed text-slate-500">
                    {channel.description}
                  </p>
                  <span className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {channel.available}
                  </span>
                  {isExternal ? (
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      {channel.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <a
                      href={channel.href}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      {channel.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — HOURS + FORM ──────────────────────────────────────── */}
      <section className="bg-slate-50 py-10 sm:py-14 lg:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">

            {/* LEFT: Hours panel */}
            <div>
              <SectionBadge text={t.hoursBadge} />
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {t.hoursTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {t.hoursDescription}
              </p>

              {/* Schedule */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                {t.schedule.map((row, i) => (
                  <div
                    key={row.day}
                    className={`flex items-center justify-between px-5 py-3.5 sm:px-6 ${i !== t.schedule.length - 1 ? 'border-b border-slate-100' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                  >
                    <span className="text-sm font-semibold text-slate-700">{row.day}</span>
                    <span className={`text-sm font-medium ${row.hours === 'Fermé' || row.hours === 'Closed' ? 'text-[var(--cj-red)]' : 'text-slate-900'}`}>
                      {row.hours}
                    </span>
                  </div>
                ))}
              </div>

              {/* Response times */}
              <div className="mt-6">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {locale === 'fr' ? 'Délais de réponse' : 'Response times'}
                </h3>
                <div className="space-y-2.5">
                  {t.responseTimes.map((rt) => (
                    <div key={rt.channel} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-2.5">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">{rt.channel}</span>
                      <span className="text-xs font-medium text-slate-500">{rt.delay}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response badge */}
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-3.5 sm:px-6">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-xs sm:text-sm font-semibold text-green-800">{t.responseBadge}</span>
              </div>
            </div>

            {/* RIGHT: Contact form */}
            <div id="contact-form" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <SectionBadge text={t.formBadge} />
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                {t.formTitle}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500">{t.formDescription}</p>

              {success ? (
                <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 px-5 py-6 sm:px-6 sm:py-8 text-center">
                  <CheckCircle2 className="mx-auto mb-2.5 h-9 w-9 text-green-500" />
                  <p className="text-base font-bold text-green-800">{t.successTitle}</p>
                  <p className="mt-1 text-xs sm:text-sm text-green-700">{t.successDescription}</p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-5 rounded-xl border-2 border-green-600 px-5 py-2 text-xs sm:text-sm font-semibold text-green-700 transition hover:bg-green-600 hover:text-white"
                  >
                    {locale === 'fr' ? 'Envoyer un autre message' : 'Send another message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                  {/* Name + Email (2-col) */}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-name" className={labelCls}>{t.fields.name}</label>
                      <input
                        id="cf-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={update('name')}
                        placeholder={t.fields.namePlaceholder}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="cf-email" className={labelCls}>{t.fields.email}</label>
                      <input
                        id="cf-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={update('email')}
                        placeholder={t.fields.emailPlaceholder}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Phone + Org (2-col) */}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-phone" className={labelCls}>{t.fields.phone}</label>
                      <input
                        id="cf-phone"
                        type="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        placeholder={t.fields.phonePlaceholder}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="cf-org" className={labelCls}>{t.fields.org}</label>
                      <input
                        id="cf-org"
                        type="text"
                        value={form.org}
                        onChange={update('org')}
                        placeholder={t.fields.orgPlaceholder}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Reason select */}
                  <div>
                    <label htmlFor="cf-reason" className={labelCls}>{t.reasonLabel}</label>
                    <select
                      id="cf-reason"
                      required
                      value={form.reason}
                      onChange={update('reason')}
                      className={inputCls}
                    >
                      <option value="">{t.reasonPlaceholder}</option>
                      {t.reasons.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="cf-subject" className={labelCls}>{t.fields.subject}</label>
                    <input
                      id="cf-subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={update('subject')}
                      placeholder={t.fields.subjectPlaceholder}
                      className={inputCls}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="cf-message" className={labelCls}>{t.fields.message}</label>
                    <textarea
                      id="cf-message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={update('message')}
                      placeholder={t.fields.messagePlaceholder}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cj-blue)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {t.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t.submit}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 — WHY CONTACT US ───────────────────────────────────── */}
      <section className="bg-white py-10 sm:py-14 lg:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
            <SectionBadge text={t.whyBadge} />
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {t.whyTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-slate-500">
              {t.whyDescription}
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.whyCards.map((card) => {
              const Icon = WHY_ICONS[card.icon as keyof typeof WHY_ICONS] ?? UserCheck
              return (
                <div
                  key={card.icon}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
                >
                  <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--cj-blue)]/8 text-[var(--cj-blue)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-slate-900">{card.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-500">{card.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="bg-slate-50 py-10 sm:py-14 lg:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10 text-center max-w-3xl mx-auto">
            <SectionBadge text={t.faqBadge} />
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {t.faqTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base text-slate-500">
              {t.faqDescription}
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-2.5">
            {t.faq.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--cj-blue)] px-6 py-10 sm:px-12 sm:py-14 text-center shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,6,19,0.25),transparent_50%)] pointer-events-none" />
            <div className="relative z-10 mx-auto max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 border border-white/20 mb-3 backdrop-blur-sm">
                {t.ctaBadge}
              </span>
              <h2 className="mt-1 text-2xl font-black text-white font-montserrat sm:text-3xl lg:text-4xl">
                {t.ctaTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-blue-100 font-opensans">
                {t.ctaDescription}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link href={`/${locale}/formations`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-red)] px-7 py-3 text-sm font-bold text-white shadow-lg transition duration-200 hover:bg-[var(--cj-red-700)] hover:scale-[1.02]">
                  {t.ctaBtn1}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#contact-form" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition duration-200 hover:bg-white/20 hover:scale-[1.02]">
                  {t.ctaBtn2}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
