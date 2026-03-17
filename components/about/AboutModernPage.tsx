import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
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
const navigationCopy = publicMessages.header

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
  const nav = navigationCopy[resolvedLocale]

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: nav.about }]} homeHref={homeHref} />

        <section className="relative overflow-hidden rounded-3xl border border-[#0B3A8E]/20 bg-gradient-to-br from-cjblue via-[#0B3A8E] to-[#001B47] p-8 text-white shadow-2xl sm:p-10 lg:p-12">
          <div className="absolute -right-16 -top-14 h-56 w-56 rounded-full bg-cjred/25 blur-3xl" />
          <div className="absolute -bottom-20 left-12 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_360px] lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                {t.heroEyebrow}
              </span>
              <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t.heroTitle}
              </h1>
              <p className="mt-4 max-w-3xl text-base text-blue-100 sm:text-lg">{t.heroDescription}</p>

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

            <div className="space-y-4">
              <article className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-100">{t.missionEyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold text-white">{t.missionTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-blue-50">{t.missionDescription}</p>
              </article>

              <article className="rounded-[28px] border border-white/15 bg-slate-950/20 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-red-100">{t.visionEyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold text-white">{t.visionTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-blue-50">{t.visionDescription}</p>
              </article>
            </div>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {t.stats.map((label, index) => {
              const Icon = statsIcons[index]
              return (
                <article key={label} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <Icon className="h-5 w-5 text-blue-300" />
                  <p className="mt-4 text-3xl font-bold text-white">{statsValues[index]}</p>
                  <p className="mt-1 text-sm text-blue-100">{label}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-cjblue">{t.valuesTitle}</h2>
            <p className="mt-2 text-slate-600">{t.valuesDescription}</p>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {t.values.map((value, index) => {
                const Icon = valueIcons[index]
                return (
                  <article
                    key={value.title}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cjblue/10 text-cjblue">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{value.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
                  </article>
                )
              })}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-cjblue">{t.timelineTitle}</h2>
            <div className="mt-7 space-y-4">
              {t.timeline.map((item) => (
                <article key={item.year} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="inline-flex rounded-full bg-cjblue px-3 py-1 text-xs font-semibold text-white">
                    {item.year}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 pb-10">
          <div className="rounded-3xl border border-[#0B3A8E]/15 bg-gradient-to-r from-cjblue via-[#0B3A8E] to-[#001B47] p-8 text-white shadow-xl sm:p-10">
            <h2 className="text-3xl font-bold text-white">{t.ctaTitle}</h2>
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
    </div>
  )
}

