import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Briefcase,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { resolveSiteLocale, type SiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type AboutModernPageProps = {
  locale?: string
  homeHref: string
  formationsHref: string
  contactHref: string
}

const copy = publicMessages.about

const statsIcons = [Globe2, Users, Award, Target]
const statsValues = ['10+', '8500+', '29+', '95%']
const valueIcons = [Sparkles, ShieldCheck, Briefcase, HeartHandshake]

export default function AboutModernPage({
  locale,
  homeHref,
  formationsHref,
  contactHref,
}: AboutModernPageProps) {
  const resolvedLocale: SiteLocale = resolveSiteLocale(locale)
  const t = copy[resolvedLocale]

  return (
    <div className="bg-[var(--cj-blue-50)] text-slate-900">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#002D72_0%,#003b96_70%,#E30613_150%)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.35),_transparent_45%),radial-gradient(circle_at_20%_30%,_rgba(227,6,19,0.20),_transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            {t.backHome}
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-300">{t.heroEyebrow}</p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 text-lg text-blue-100">{t.heroDescription}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.stats.map((label, index) => {
              const Icon = statsIcons[index]
              return (
                <article key={label} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <Icon className="h-5 w-5 text-blue-300" />
                  <p className="mt-4 text-3xl font-bold">{statsValues[index]}</p>
                  <p className="mt-1 text-sm text-blue-100">{label}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-cjblue">{t.missionEyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold">{t.missionTitle}</h2>
          <p className="mt-4 text-gray-600">{t.missionDescription}</p>
        </article>

        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-cjblue">{t.visionEyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold">{t.visionTitle}</h2>
          <p className="mt-4 text-gray-600">{t.visionDescription}</p>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-8">
          <h3 className="text-2xl font-bold">{t.valuesTitle}</h3>
          <p className="mt-2 text-gray-600">{t.valuesDescription}</p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {t.values.map((value, index) => {
              const Icon = valueIcons[index]
              return (
                <article key={value.title} className="rounded-2xl border border-blue-100 bg-[var(--cj-blue-50)] p-5">
                  <Icon className="h-5 w-5 text-cjblue" />
                  <h4 className="mt-3 font-semibold">{value.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{value.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-8">
          <h3 className="text-2xl font-bold">{t.timelineTitle}</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {t.timeline.map((item) => (
              <article key={item.year} className="rounded-2xl border border-blue-100 p-5">
                <p className="inline-flex rounded-full bg-cjblue px-3 py-1 text-xs font-semibold text-white">{item.year}</p>
                <p className="mt-3 text-sm text-gray-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cjblue to-blue-800 p-8 text-white sm:p-10">
          <h3 className="text-3xl font-bold">{t.ctaTitle}</h3>
          <p className="mt-3 max-w-3xl text-blue-100">{t.ctaDescription}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={formationsHref}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-cjblue transition hover:bg-blue-50"
            >
              {t.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={contactHref}
              className="inline-flex items-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
