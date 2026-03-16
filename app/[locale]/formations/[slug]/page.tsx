import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight, Award, BookOpenText, Clock3, GraduationCap, Layers3 } from 'lucide-react'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import { generatePageMetadata } from '../../../../components/PageMetadata'
import { prisma } from '../../../../lib/prisma'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

interface PageProps {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string }
}

const copy = publicMessages.formationDetail

function normalizeText(value?: string | null) {
  return value?.trim() || ''
}

function toItems(value?: string | null) {
  return normalizeText(value)
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]

  const formation = await prisma.formation.findUnique({
    where: { slug: resolvedParams.slug },
  })

  if (!formation) {
    return generatePageMetadata({
      title: t.metadataMissingTitle,
      description: t.metadataMissingDescription,
      noIndex: true,
    })
  }

  return generatePageMetadata({
    title: formation.title,
    description:
      normalizeText(formation.description) ||
      `${t.metadataFallbackDescriptionPrefix}${formation.title}${t.metadataFallbackDescriptionSuffix}`,
    keywords: ['formation', formation.title, 'CJ DTC', 'professional training'],
    image: formation.imageUrl || '/logo.png',
  })
}

export default async function FormationDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolveSiteLocale(resolvedParams.locale)
  const t = copy[locale]

  let formation = null
  try {
    formation = await prisma.formation.findUnique({
      where: { slug: resolvedParams.slug },
    })
  } catch (error) {
    console.error('Formation detail database error:', error)
  }

  if (!formation) {
    notFound()
  }

  const modules = toItems(formation.modules)
  const objectives = toItems(formation.objectifs)

  const infoCards = [
    {
      label: t.category,
      value: normalizeText(formation.categorie) || t.categoryFallback,
      icon: BookOpenText,
    },
    {
      label: t.duration,
      value: normalizeText(formation.duree) || t.durationFallback,
      icon: Clock3,
    },
    {
      label: t.certification,
      value: normalizeText(formation.certification) || t.certificationFallback,
      icon: Award,
    },
    {
      label: t.methods,
      value: normalizeText(formation.methodes) || t.methodsFallback,
      icon: Layers3,
    },
  ]

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: t.breadcrumb, href: `/${locale}/formations` },
            { label: formation.title },
          ]}
        />

        <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
          <div className="bg-[linear-gradient(135deg,#02142f_0%,#002d72_45%,#0c4da2_100%)] px-6 py-10 text-white sm:px-8 lg:px-10 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                  <GraduationCap className="h-4 w-4" />
                  {t.badge}
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{formation.title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
                  {normalizeText(formation.description) || t.heroFallback}
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">{t.keyInfoTitle}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {infoCards.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <div className="flex items-center gap-2 text-blue-100">
                        <item.icon className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.16em]">{item.label}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className="space-y-8">
              <section className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{t.overviewTitle}</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">
                  {normalizeText(formation.description) || t.overviewFallback}
                </p>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{t.objectivesTitle}</h2>
                {objectives.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
                    {objectives.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-cjred" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-base leading-8 text-slate-700">{t.objectivesFallback}</p>
                )}
              </section>
            </div>

            <div className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{t.modulesTitle}</h2>
                {modules.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
                    {modules.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-cjblue" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-base leading-8 text-slate-700">{t.modulesFallback}</p>
                )}
              </section>

              <section className="rounded-3xl border border-cjblue/10 bg-slate-950 p-6 text-white shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">CJ DTC</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{formation.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {normalizeText(formation.methodes) || t.methodsFallback}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/${locale}/espace-etudiants/inscription`} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cj-red)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                    {t.enrollCta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={`/${locale}/programmes`} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15">
                    {t.sessionsCta}
                  </Link>
                  <Link href={`/${locale}/espace-etudiants`} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-200 hover:text-white">
                    {t.studentSpaceCta}
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
