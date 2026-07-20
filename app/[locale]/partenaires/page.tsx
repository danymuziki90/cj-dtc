import Link from 'next/link'
import { ArrowRight, Globe2, HeartHandshake, Landmark, UsersRound } from 'lucide-react'
import Breadcrumbs from '../../../components/Breadcrumbs'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type PageProps = {
  params: Promise<{ locale: string }> | { locale: string }
}

const copy = publicMessages.partners

const icons = [Landmark, HeartHandshake, UsersRound, Globe2]
const network = ['World Bank', 'UNESCO', 'African Union', 'SHRM', 'Harvard Business', 'Microsoft']

export default async function PartenairesPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: t.breadcrumb }]} />

        {/* Hero Section floating card */}
        <section className="cj-hero-card mb-6">
          <div className="relative z-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="cj-eyebrow-dark mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
                {t.heroBadge}
              </span>
              <h1 className="cj-hero-title mb-3 font-montserrat">{t.heroTitle}</h1>
              <p className="max-w-3xl text-sm leading-7 text-white sm:text-base font-opensans">{t.heroDescription}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {t.stats.map((label, index) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur shadow-lg">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-blue-200">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white font-montserrat">{t.statValues[index]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Cards */}
        <section className="mt-10">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl font-black text-[var(--cj-blue)] font-montserrat tracking-tight">{t.sectionTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 font-opensans">{t.sectionDescription}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {t.cards.map((card, index) => {
              const Icon = icons[index]
              return (
                <article key={card.title} className="cj-card-interactive">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900 font-montserrat">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-650 font-opensans">{card.description}</p>
                  <ul className="mt-5 space-y-3 text-sm text-slate-700 font-opensans">
                    {card.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--cj-red)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </section>

        {/* Network & Final CTA Grid */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="cj-card-static">
            <h2 className="text-2xl font-black text-slate-900 font-montserrat tracking-tight mb-4">{t.networkTitle}</h2>
            <p className="text-sm leading-relaxed text-slate-600 font-opensans mb-6">{t.networkDescription}</p>
            <div className="flex flex-wrap gap-2">
              {network.map((item) => (
                <span key={item} className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="cj-cta-banner">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <span className="cj-eyebrow-dark mb-4">
                  CJ DTC
                </span>
                <h2 className="text-2xl font-black text-white font-montserrat mb-4">{t.ctaTitle}</h2>
                <p className="text-sm leading-relaxed text-blue-100 font-opensans mb-8">{t.ctaDescription}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/${locale}/contact`} className="cj-btn-primary">
                  {t.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/${locale}/contact`} className="cj-btn-secondary-dark">
                  {t.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
