'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Home } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SectionHeroBadge = {
  icon?: React.ReactNode
  label: string
  color?: 'blue' | 'green' | 'red' | 'purple' | 'amber'
}

export type SectionHeroCta = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}

export type BreadcrumbItem = {
  label: string
  href?: string
}

export interface SectionHeroProps {
  /** Page identifier for background color if no image */
  image: string
  imageAlt?: string
  eyebrow?: string
  title: React.ReactNode
  description: string
  badges?: SectionHeroBadge[]
  ctas?: SectionHeroCta[]
  breadcrumbs?: BreadcrumbItem[]
  /** Home breadcrumb label */
  homeLabel?: string
  homeHref?: string
  /** Extra overlay darkness 0–100, default 55 */
  overlayOpacity?: number
  compact?: boolean
}

// ─── Badge color map ──────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  blue:   'bg-blue-500/20 border-blue-300/30 text-blue-100',
  green:  'bg-emerald-500/20 border-emerald-300/30 text-emerald-100',
  red:    'bg-red-500/20 border-red-300/30 text-red-100',
  purple: 'bg-purple-500/20 border-purple-300/30 text-purple-100',
  amber:  'bg-amber-500/20 border-amber-300/30 text-amber-100',
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay } }),
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({ opacity: 1, transition: { duration: 0.5, delay } }),
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SectionHero({
  image, imageAlt = '', eyebrow, title, description,
  badges = [], ctas = [], breadcrumbs = [],
  homeLabel = 'Accueil', homeHref = '/',
  overlayOpacity = 55, compact = false,
}: SectionHeroProps) {
  const overlayStyle = { opacity: overlayOpacity / 100 }

  return (
    <section className={`relative overflow-hidden flex flex-col justify-end ${compact ? 'min-h-[52vh]' : 'min-h-[62vh]'} pt-28 pb-10`}>

      {/* ── Background image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image} alt={imageAlt} fill priority
          className="object-cover scale-[1.03] transition-transform duration-[8000ms] ease-out"
          sizes="100vw"
        />
      </div>

      {/* ── Gradient overlays ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#001020]/80 via-[#001737]/60 to-[#002d72]/40" style={overlayStyle} />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#000d1f]/70 via-transparent to-[#000d1f]/30" />
      {/* Top fade for navbar */}
      <div className="absolute inset-x-0 top-0 h-32 z-10 bg-gradient-to-b from-[#000d1f]/50 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-2">

        {/* Breadcrumb */}
        {(breadcrumbs.length > 0) && (
          <motion.nav
            aria-label="Breadcrumb"
            initial="hidden" animate="visible" custom={0}
            variants={fadeIn}
            className="mb-6 flex items-center gap-1.5 text-xs font-medium text-white/60"
          >
            <Link href={homeHref} className="inline-flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />{homeLabel}
            </Link>
            {breadcrumbs.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                {item.href
                  ? <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                  : <span className="text-white/90 font-semibold">{item.label}</span>
                }
              </span>
            ))}
          </motion.nav>
        )}

        {/* Eyebrow */}
        {eyebrow && (
          <motion.div initial="hidden" animate="visible" custom={0.05} variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200 backdrop-blur-sm shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)] animate-pulse" />
            {eyebrow}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1 initial="hidden" animate="visible" custom={0.12} variants={fadeUp}
          className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p initial="hidden" animate="visible" custom={0.2} variants={fadeUp}
          className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
          {description}
        </motion.p>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div initial="hidden" animate="visible" custom={0.28} variants={fadeUp}
            className="mt-5 flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span key={i} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${BADGE_COLORS[b.color || 'blue']}`}>
                {b.icon && <span className="shrink-0">{b.icon}</span>}
                {b.label}
              </span>
            ))}
          </motion.div>
        )}

        {/* CTAs */}
        {ctas.length > 0 && (
          <motion.div initial="hidden" animate="visible" custom={0.35} variants={fadeUp}
            className="mt-7 flex flex-wrap gap-3">
            {ctas.map((cta, i) => (
              cta.variant === 'secondary'
                ? <Link key={i} href={cta.href}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition duration-200 hover:bg-white/20 hover:scale-[1.02] active:scale-95">
                    {cta.label}
                  </Link>
                : <Link key={i} href={cta.href}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition duration-200 hover:bg-[var(--cj-red-700)] hover:scale-[1.02] active:scale-95">
                    {cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Bottom fade into page content ── */}
      <div className="absolute inset-x-0 bottom-0 h-20 z-10 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>
  )
}
