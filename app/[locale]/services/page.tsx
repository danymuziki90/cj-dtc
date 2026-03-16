import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Briefcase, Building2, GraduationCap, ShieldCheck, Users2 } from 'lucide-react'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { generatePageMetadata } from '../../../components/PageMetadata'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type PageProps = {
  params: Promise<{ locale: string }> | { locale: string }
}

const copy = publicMessages.services

const icons = [ShieldCheck, Users2, GraduationCap, Building2, Briefcase]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]

  return generatePageMetadata({
    title: t.metadataTitle,
    description: t.metadataDescription,
    keywords: ['services', 'enterprise', 'training', 'CJ DTC'],
  })
}

export default async function ServicesPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: t.breadcrumb }]} />

        <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#02142f_0%,#002d72_45%,#0c4da2_100%)] px-6 py-10 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                {t.heroBadge}
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{t.heroTitle}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">{t.heroDescription}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {t.stats.map((label, index) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-blue-100">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{t.statValues[index]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{t.sectionTitle}</h2>
            <p className="mt-3 text-base leading-8 text-slate-600">{t.sectionDescription}</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {t.cards.map((card, index) => {
              const Icon = icons[index]
              return (
                <article key={card.slug} id={card.slug} className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cjblue/10 text-cjblue">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                  <ul className="mt-5 space-y-3 text-sm text-slate-700">
                    {card.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-cjred" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cjblue">CJ DTC</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{t.processTitle}</h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
              {t.processSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cjblue text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">CJ DTC</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{t.ctaTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{t.ctaDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cj-red)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                {t.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/${locale}/programmes`} className="inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                {t.secondaryCta}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
