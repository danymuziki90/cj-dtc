'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Award, BookOpen, CalendarDays, Sparkle, TrendingUp, Users } from 'lucide-react'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import type { Formation } from '@/lib/types/formation'
import { calculateCatalogStats, getPublishedFormations } from '@/lib/formations/catalog'
import FormationCard     from '@/components/formations/FormationCard'
import FormationFAQ      from '@/components/formations/FormationFAQ'
import FormationGuidance from '@/components/formations/FormationGuidance'
import FormationStats    from '@/components/formations/FormationStats'
import HowToRegister     from '@/components/formations/HowToRegister'
import SessionsHub       from '@/components/formations/SessionsHub'

export default function FormationsPage() {
  const params = useParams()
  const locale = resolveSiteLocale(params?.locale as string | undefined)
  const isFr   = locale === 'fr'

  /* ── state ── */
  const [formations, setFormations]   = useState<Formation[]>([])
  const [isLoading, setIsLoading]     = useState(true)

  /* ── data ── */
  useEffect(() => {
    let alive = true
    setIsLoading(true)
    fetch('/api/formations')
      .then(r => r.json())
      .then(d => { if (alive) setFormations(getPublishedFormations(d.formations ?? [])) })
      .catch(console.error)
      .finally(() => { if (alive) setIsLoading(false) })
    return () => { alive = false }
  }, [])

  /* ── derived ── */
  const stats    = useMemo(() => calculateCatalogStats(formations), [formations])
  const featured = useMemo(() => formations.filter(f => f.featured).slice(0, 3), [formations])

  /* ── render ── */
  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero Section floating card */}
        <section className="cj-hero-card text-center mb-10">
          <div className="relative z-10 flex flex-col items-center">
            <span className="cj-eyebrow-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
              {isFr ? 'Catalogue officiel' : 'Official catalog'} · CJ Development
            </span>
            <h1 className="cj-hero-title mb-6 max-w-4xl">
              {isFr ? 'Formations' : 'Training Programs'}
              <span className="block text-white/80">
                {isFr ? '& Sessions ouvertes' : '& Open Sessions'}
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white sm:text-lg mb-8">
              {isFr
                ? 'Découvrez nos programmes certifiants et réservez directement votre place dans une session disponible. Tout au même endroit.'
                : 'Explore our certified programs and book your spot in an available session — all in one place.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <a href="#sessions" className="cj-btn-primary">
                <CalendarDays className="w-4 h-4" />
                {isFr ? 'Voir les sessions ouvertes' : 'Browse open sessions'}
              </a>
            </div>
            <div className="w-full border-t border-white/10 pt-8 mt-2">
              <FormationStats stats={stats} />
            </div>
          </div>
        </section>

      {/* ═══ PUBLIC CIBLES ═══ */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              {isFr ? 'Une formation pour chaque ambition' : 'A program for every ambition'}
            </h2>
            <p className="text-base text-slate-600">
              {isFr
                ? "Nos programmes s'adressent à tous les profils : étudiants, professionnels, managers, entrepreneurs, entreprises et institutions."
                : 'Our programs serve all profiles: students, professionals, managers, entrepreneurs, businesses and institutions.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              { icon: BookOpen,   color: 'bg-blue-100 text-[var(--cj-blue)]', label: isFr ? 'Étudiants'      : 'Students'      },
              { icon: Users,      color: 'bg-green-100 text-green-700',        label: isFr ? 'Professionnels' : 'Professionals' },
              { icon: TrendingUp, color: 'bg-purple-100 text-purple-700',      label: isFr ? 'Entrepreneurs'  : 'Entrepreneurs' },
              { icon: Award,      color: 'bg-orange-100 text-orange-700',      label: isFr ? 'Organisations'  : 'Organizations' },
            ] as {icon: any; color: string; label: string}[]).map(({ icon: Icon, color, label }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FORMATIONS VEDETTES ═══ */}
      {featured.length > 0 && (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--cj-blue)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white mb-3">
                <Sparkle className="h-3.5 w-3.5" />
                {isFr ? 'Programmes phares' : 'Featured programs'}
              </span>
              <h2 className="text-3xl font-black text-slate-900">
                {isFr ? 'Nos formations vedettes' : 'Our featured trainings'}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map(f => <FormationCard key={f.id} formation={f} locale={locale} featured />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SESSIONS OUVERTES ═══ */}
      <SessionsHub locale={locale} />

      {/* ═══ PARCOURS INSCRIPTION ═══ */}
      <HowToRegister locale={locale} />

      {/* ═══ ORIENTATION ═══ */}
      <FormationGuidance locale={locale} />

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">
              {isFr ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
            <p className="mt-2 text-base text-slate-600">
              {isFr
                ? "Tout ce qu'il faut savoir sur nos formations et les inscriptions."
                : 'Everything you need to know about our programs and registration.'}
            </p>
          </div>
          <FormationFAQ />
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="cj-cta-banner mt-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-white sm:text-4xl mb-4 font-montserrat">
            {isFr ? 'Prêt à transformer votre carrière ?' : 'Ready to transform your career?'}
          </h2>
          <p className="text-base text-blue-100 mb-8 font-opensans leading-relaxed">
            {isFr
              ? 'Rejoignez les milliers de professionnels formés par CJ Development Training Center.'
              : 'Join the thousands of professionals trained by CJ Development Training Center.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#sessions" className="cj-btn-primary">
              {isFr ? 'Voir les sessions ouvertes' : 'See open sessions'}
            </a>
            <Link href={`/${locale}/contact`} className="cj-btn-secondary-dark">
              {isFr ? 'Parler à un conseiller' : 'Talk to an advisor'}
            </Link>
          </div>
        </div>
      </section>

      </div>
    </div>
  )
}
