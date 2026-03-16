'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import HomeSections from '../../components/HomeSections'
import RecentSessions from '../../components/RecentSessions'
import RecentArticles from '../../components/RecentArticles'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

const copy = publicMessages.home

const cardStatsValues = [
  ['50+', '98%'],
  ['15+', '10+'],
  ['85%', '500+'],
]

export default function HomePage() {
  const params = useParams<{ locale?: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const t = copy[locale]
  const heroImages = ['/books-wood.jpg', '/lor-de-formation.jpeg']
  const [currentBg, setCurrentBg] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroImages.length])

  return (
    <div>
      <section className="relative overflow-hidden py-24 text-white md:py-32">
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${currentBg === index ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200 md:text-base">{t.heroEyebrow}</p>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mb-4 max-w-3xl text-lg font-light text-blue-100 drop-shadow md:text-xl lg:text-2xl">
            {t.heroDescription}
          </p>
          <p className="mx-auto mb-10 max-w-2xl text-base font-semibold text-white drop-shadow md:text-lg">
            ✨ {t.heroTagline}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={`/${locale}/formations`} className="rounded-lg bg-[#E30613] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700">
              {t.primaryCta}
            </Link>
            <Link href={`/${locale}/contact`} className="rounded-lg border-2 border-white bg-black/20 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all hover:bg-white hover:text-[#002D72]">
              {t.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -right-12 bottom-6 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(239,68,68,0.12),transparent_35%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div className="space-y-7">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              {t.aboutBadge}
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">{t.aboutTitle}</h2>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{t.aboutDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold text-white">2018</p>
                <p className="text-xs uppercase tracking-wider text-slate-300">{t.aboutStats[0]}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold text-white">8500+</p>
                <p className="text-xs uppercase tracking-wider text-slate-300">{t.aboutStats[1]}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:col-span-1">
                <p className="text-2xl font-extrabold text-white">10+</p>
                <p className="text-xs uppercase tracking-wider text-slate-300">{t.aboutStats[2]}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/about`} className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100">
                {t.aboutPrimaryCta}
              </Link>
              <Link href={`/${locale}/formations`} className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                {t.aboutSecondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/30 to-red-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-2 backdrop-blur">
              <Image
                src="/apropos.jpeg"
                alt="CJ DTC - Formation et accompagnement"
                width={760}
                height={520}
                className="h-[360px] w-full rounded-2xl object-cover sm:h-[430px]"
                priority
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-black/45 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200">{t.aboutImageEyebrow}</p>
                <p className="mt-2 text-sm font-semibold text-white sm:text-base">{t.aboutImageDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
        <div className="absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-blue-400 opacity-20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 animate-pulse rounded-full bg-blue-400 opacity-20 blur-3xl delay-1000" />
        <div className="absolute left-1/3 top-1/2 h-40 w-40 animate-pulse rounded-full bg-blue-400 opacity-10 blur-3xl delay-500" />

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-16 lg:mb-20">
            <div className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-blue-100 px-4 py-2 sm:mb-8 sm:px-6 sm:py-3">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-blue-600 sm:mr-3 sm:h-3 sm:w-3" />
              <span className="text-sm font-semibold text-blue-800 sm:text-base">{t.whyChooseBadge}</span>
            </div>

            <h2 className="mb-4 text-3xl font-black sm:text-4xl lg:text-5xl xl:text-6xl sm:mb-6">
              {t.whyChooseTitlePrefix}
              <span className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 bg-clip-text text-transparent">{t.whyChooseTitleHighlight}</span>
              {t.whyChooseTitleSuffix}
            </h2>

            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl">{t.whyChooseDescription}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-10">
            {t.whyChooseCards.map((card, index) => {
              const gradient = index === 2 ? 'from-blue-500 to-red-600' : 'from-blue-500 to-blue-600'
              const frame = index === 2 ? 'from-blue-100 to-red-100' : 'from-blue-100 to-blue-100'
              const glow = index === 2 ? 'from-blue-500 to-red-600' : 'from-blue-500 to-blue-600'
              const icon = ['🎓', '🌍', '🚀'][index]
              const statColors = index === 2 ? ['text-blue-600', 'text-red-600'] : ['text-blue-600', 'text-blue-600']

              return (
                <div key={card.title} className="group relative">
                  <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${glow} opacity-25 blur transition duration-1000 group-hover:opacity-40 sm:rounded-3xl`} />

                  <div className="relative rounded-2xl border border-blue-100 bg-white p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:rounded-3xl sm:p-8 lg:p-10">
                    <div className="relative mb-6 sm:mb-8">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${frame} transition-transform duration-300 group-hover:rotate-6 sm:rounded-3xl ${index === 1 ? '-rotate-3 group-hover:-rotate-6' : index === 2 ? 'rotate-6 group-hover:rotate-12' : 'rotate-3'}`} />
                      <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl sm:h-20 sm:w-20 sm:text-4xl lg:h-24 lg:w-24 lg:text-5xl sm:rounded-3xl`}>
                        <span>{icon}</span>
                      </div>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 sm:mb-4 sm:text-2xl lg:text-3xl">
                      {card.title}
                    </h3>

                    <p className="mb-4 text-sm leading-relaxed text-gray-600 sm:mb-6 sm:text-base lg:text-lg">
                      {card.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 sm:pt-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold sm:text-3xl ${statColors[0]}`}>{cardStatsValues[index][0]}</div>
                        <div className="text-xs text-gray-500 sm:text-sm">{card.stats[0]}</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold sm:text-3xl ${statColors[1]}`}>{cardStatsValues[index][1]}</div>
                        <div className="text-xs text-gray-500 sm:text-sm">{card.stats[1]}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 text-center sm:mt-16 lg:mt-20">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 p-8 text-white sm:rounded-3xl sm:p-12 lg:p-16">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute left-4 top-4 h-20 w-20 rounded-full bg-white" />
                <div className="absolute bottom-4 right-4 h-32 w-32 rounded-full bg-white" />
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-white" />
              </div>

              <div className="relative z-10">
                <h3 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl lg:text-4xl">
                  {t.featuredCtaTitlePrefix}
                  <span className="bg-gradient-to-r from-red-300 to-red-300 bg-clip-text text-transparent">{t.featuredCtaTitleHighlight}</span>
                  {t.featuredCtaTitleSuffix}
                </h3>
                <p className="mx-auto mb-6 max-w-2xl text-base text-blue-100 sm:mb-8 sm:text-lg lg:text-xl">{t.featuredCtaDescription}</p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                  <Link href={`/${locale}/programmes`} className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-gray-100 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base lg:px-12 lg:py-5 lg:text-lg">
                    {t.featuredPrimaryCta}
                  </Link>
                  <Link href={`/${locale}/contact`} className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-800 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base lg:px-12 lg:py-5 lg:text-lg">
                    {t.featuredSecondaryCta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RecentSessions />
      <RecentArticles />

      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-cjblue">{t.bottomCtaTitle}</h2>
          <p className="mb-8 text-lg text-gray-600">{t.bottomCtaDescription}</p>
          <Link href={`/${locale}/programmes`} className="btn-primary">
            {t.bottomCtaButton}
          </Link>
        </div>
      </section>

      <HomeSections locale={locale} />
    </div>
  )
}
