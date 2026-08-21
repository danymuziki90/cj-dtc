'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import Breadcrumbs from '@/components/Breadcrumbs'
import {
  MapPin, Briefcase, Calendar, Building2, Globe, GraduationCap,
  Clock, DollarSign, Mail, ExternalLink, Users, ArrowLeft,
  CheckCircle2, Loader2, AlertCircle, ArrowRight,
} from 'lucide-react'

type EmploiMeta = {
  company: string; contractType: string; location: string; remote: string
  domain: string; educationLevel: string; experience: string; salary: string
  positions: number; deadline: string; applyUrl: string; contactEmail: string
  whereToApply: string; howToApply: string
  missions: string; profile: string; skills: string; excerpt: string; status: string
}
type Emploi = {
  id: string; title: string; content: string; published: boolean
  publicationDate: string; imageDataUrl: string | null
  tags: string[]; metadata: EmploiMeta
}

function formatDate(iso: string, locale: string) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long' }).format(new Date(iso))
}

function daysUntil(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

const REMOTE_LABELS: Record<string, string> = { oui: 'Télétravail', hybride: 'Hybride', non: 'Présentiel' }

// ─── Section block ────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--cj-blue)]/10 text-[var(--cj-blue)]">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Rich text renderer ───────────────────────────────────────────────────────
function RichContent({ html }: { html: string }) {
  if (!html?.trim()) return null
  // Plain text with line breaks (if no HTML tags)
  if (!/<[a-z]/i.test(html)) {
    return (
      <div className="space-y-1">
        {html.split('\n').filter(Boolean).map((line, i) => (
          <p key={i} className="text-sm text-slate-600 leading-relaxed">{line}</p>
        ))}
      </div>
    )
  }
  return (
    <div className="prose prose-sm prose-slate max-w-none text-slate-600"
      dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export default function EmploiDetailPage() {
  const params = useParams<{ locale: string; slug: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const slug   = params?.slug

  const [emploi, setEmploi] = useState<Emploi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/emplois/${slug}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject('Offre introuvable.'))
      .then(d => setEmploi(d.emploi))
      .catch(e => setError(typeof e === 'string' ? e : 'Erreur de chargement.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center text-slate-400 gap-2">
      <Loader2 className="h-8 w-8 animate-spin" /> Chargement…
    </div>
  )

  if (error || !emploi) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-slate-600">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="font-bold text-xl">{error || 'Offre introuvable.'}</p>
      <Link href={`/${locale}/emplois`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-5 py-2.5 text-sm font-bold text-white">
        <ArrowLeft className="h-4 w-4" /> Retour aux offres
      </Link>
    </div>
  )

  const m = emploi.metadata
  const days = m.deadline ? daysUntil(m.deadline) : null
  const urgent = days !== null && days <= 7 && days >= 0
  const expired = days !== null && days < 0

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-[#001737] via-[#002d72] to-[#0c4da2] text-white pt-28 pb-12">
        {emploi.imageDataUrl && (
          <div className="absolute inset-0 opacity-15">
            <img src={emploi.imageDataUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001737]/80 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {m.contractType && <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-sm">{m.contractType}</span>}
            {REMOTE_LABELS[m.remote] && <span className="rounded-full border border-purple-300/30 bg-purple-500/20 px-3 py-1 text-xs font-bold">{REMOTE_LABELS[m.remote]}</span>}
            {urgent && <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold animate-pulse">⚡ Expire bientôt</span>}
            {expired && <span className="rounded-full bg-slate-500/80 px-3 py-1 text-xs font-bold">Expirée</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">{emploi.title}</h1>
          {m.company && (
            <p className="flex items-center gap-2 text-white/80 text-base font-semibold">
              <Building2 className="h-5 w-5" />{m.company}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
            {m.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[var(--cj-red)]" />{m.location}</span>}
            {m.domain   && <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{m.domain}</span>}
            {m.deadline && <span className={`flex items-center gap-1.5 ${urgent ? 'text-red-300 font-semibold' : ''}`}><Calendar className="h-4 w-4" />Limite : {formatDate(m.deadline, locale)}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: "Offres d'emploi", href: `/${locale}/emplois` },
          { label: emploi.title },
        ]} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left column: main content ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <Section title="Description du poste" icon={Briefcase}>
              <RichContent html={emploi.content} />
            </Section>

            {m.missions?.trim() && (
              <Section title="Missions principales" icon={CheckCircle2}>
                <RichContent html={m.missions} />
              </Section>
            )}

            {m.profile?.trim() && (
              <Section title="Profil recherché" icon={Users}>
                <RichContent html={m.profile} />
              </Section>
            )}

            {m.skills?.trim() && (
              <Section title="Compétences requises" icon={GraduationCap}>
                <RichContent html={m.skills} />
              </Section>
            )}

            {m.whereToApply?.trim() && (
              <Section title="Où postuler" icon={MapPin}>
                <p className="text-sm text-slate-600 leading-relaxed">{m.whereToApply}</p>
              </Section>
            )}

            {m.howToApply?.trim() && (
              <Section title="Comment postuler" icon={ArrowRight}>
                <RichContent html={m.howToApply} />
              </Section>
            )}

            {/* Tags */}
            {emploi.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emploi.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── Right column: info + CTA ── */}
          <div className="space-y-5">
            {/* CTA Apply */}
            <div className="rounded-2xl border border-[var(--cj-blue)]/20 bg-[var(--cj-blue)] p-6 text-white shadow-lg">
              <h3 className="font-black text-lg mb-1">Postuler à cette offre</h3>
              {m.deadline && (
                <p className={`text-sm mb-4 ${urgent ? 'text-red-200 font-bold' : 'text-white/70'}`}>
                  {expired ? 'Offre expirée' : `${days} jour${days !== 1 ? 's' : ''} restant${days !== 1 ? 's' : ''}`}
                </p>
              )}
              {!expired && (m.applyUrl || m.contactEmail) && (
                <>
                  {m.applyUrl && (
                    <a href={m.applyUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[var(--cj-blue)] hover:bg-blue-50 transition mb-2">
                      <ExternalLink className="h-4 w-4" /> Postuler en ligne
                    </a>
                  )}
                  {m.contactEmail && (
                    <a href={`mailto:${m.contactEmail}?subject=Candidature : ${emploi.title}`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition">
                      <Mail className="h-4 w-4" /> Envoyer un email
                    </a>
                  )}
                </>
              )}
              {expired && <p className="text-sm text-white/70">Les candidatures pour ce poste sont closes.</p>}
            </div>

            {/* Job info card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Informations</h3>
              {[
                { icon: Briefcase,      label: 'Contrat',      value: m.contractType },
                { icon: MapPin,         label: 'Lieu',         value: m.location },
                { icon: Globe,          label: 'Télétravail',  value: REMOTE_LABELS[m.remote] },
                { icon: GraduationCap,  label: 'Études',       value: m.educationLevel },
                { icon: Clock,          label: 'Expérience',   value: m.experience },
                { icon: DollarSign,     label: 'Salaire',      value: m.salary },
                { icon: Users,          label: 'Postes',       value: m.positions > 0 ? String(m.positions) : '' },
                { icon: Calendar,       label: 'Publication',  value: formatDate(emploi.publicationDate, locale) },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-start gap-2.5">
                  <row.icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{row.label}</p>
                    <p className="text-sm font-semibold text-slate-700">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Back link */}
            <Link href={`/${locale}/emplois`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <ArrowLeft className="h-4 w-4" /> Retour aux offres
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
