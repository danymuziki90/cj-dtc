import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Globe2,
  GraduationCap,
  MapPinIcon,
  TargetIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
import { resolveSiteLocale, type SiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'
import Breadcrumbs from '@/components/Breadcrumbs'

type AboutModernPageProps = {
  locale?: string
  homeHref: string
  formationsHref: string
  contactHref: string
}

// ─── Contenu statique — page de conviction ────────────────────────────────────

const PROOF_STATS = [
  { value: '8 500+', label: 'Apprenants formés',    labelEn: 'Learners trained',      icon: Users },
  { value: '10+',    label: 'Pays couverts',         labelEn: 'Countries reached',     icon: Globe2 },
  { value: '2018',   label: 'Année de fondation',    labelEn: 'Founded',               icon: TargetIcon },
  { value: '95%',    label: 'Taux de satisfaction',  labelEn: 'Satisfaction rate',     icon: Award },
  { value: '29+',    label: 'Promotions certifiées', labelEn: 'Certified cohorts',     icon: GraduationCap },
  { value: '85%',    label: "Taux d'insertion",      labelEn: 'Placement rate',        icon: TrendingUp },
]

const METHOD_STEPS = {
  fr: [
    {
      num: '01',
      title: 'Apprentissage par la pratique',
      desc: "Chaque module est conçu autour de cas réels, d'exercices terrain et de mises en situation professionnelle. Pas de théorie sans application immédiate.",
    },
    {
      num: '02',
      title: 'Coaching individuel et collectif',
      desc: "Nos formateurs accompagnent chaque apprenant pendant et après la session. Le coaching ne s'arrête pas à la fin du cours.",
    },
    {
      num: '03',
      title: "Orientation vers l'emploi",
      desc: "Chaque programme intègre un volet insertion : préparation CV, simulation d'entretien, mise en réseau avec des partenaires employeurs.",
    },
    {
      num: '04',
      title: 'Suivi post-formation',
      desc: 'Nous suivons le parcours de nos diplômés sur 12 mois. Leur réussite est notre indicateur de performance le plus important.',
    },
  ],
  en: [
    {
      num: '01',
      title: 'Learning by doing',
      desc: 'Every module is built around real cases, field exercises and professional simulations. No theory without immediate application.',
    },
    {
      num: '02',
      title: 'Individual and group coaching',
      desc: 'Our trainers accompany each learner during and after the session. Coaching does not stop at the end of the course.',
    },
    {
      num: '03',
      title: 'Career placement support',
      desc: 'Every program includes an employability component: CV prep, mock interviews, networking with employer partners.',
    },
    {
      num: '04',
      title: 'Post-training follow-up',
      desc: 'We track our graduates for 12 months. Their success is our most important performance indicator.',
    },
  ],
}

const COUNTRIES = [
  'RD Congo', 'Guinée', 'Côte d\'Ivoire', 'Cameroun', 'Sénégal',
  'Bénin', 'Togo', 'Mali', 'Burkina Faso', 'Niger', 'Gabon',
]

const TIMELINE = {
  fr: [
    { year: '2018', text: 'Lancement du centre à Kinshasa, RD Congo. Premier programme IOP.' },
    { year: '2019', text: 'Premiers partenariats institutionnels. Extension en Guinée.' },
    { year: '2021', text: 'Déploiement multi-pays. 1 000 apprenants certifiés.' },
    { year: '2023', text: 'Lancement de la plateforme digitale et des sessions hybrides.' },
    { year: '2024', text: 'Certification à grande échelle. 8 500+ apprenants formés.' },
  ],
  en: [
    { year: '2018', text: 'Center launched in Kinshasa, DRC. First IOP program.' },
    { year: '2019', text: 'First institutional partnerships. Expansion to Guinea.' },
    { year: '2021', text: 'Multi-country rollout. 1,000 certified learners.' },
    { year: '2023', text: 'Launch of the digital platform and hybrid sessions.' },
    { year: '2024', text: 'Large-scale certification. 8,500+ learners trained.' },
  ],
}

const VALUES = {
  fr: [
    {
      icon: Award,
      title: 'Excellence opérationnelle',
      desc: 'Chaque programme est conçu pour produire des compétences directement applicables, pas seulement des diplômes.',
    },
    {
      icon: CheckCircle2,
      title: 'Intégrité et rigueur',
      desc: 'Transparence, discipline et redevabilité dans chaque session, chaque interaction, chaque décision pédagogique.',
    },
    {
      icon: Users,
      title: 'Leadership utile',
      desc: "Nous formons des profils capables de décider, d'agir et de faire avancer leurs équipes dans des contextes africains et globaux.",
    },
    {
      icon: Globe2,
      title: 'Impact social mesurable',
      desc: 'Chaque promotion vise un résultat concret : insertion, promotion, création d\'entreprise ou renforcement institutionnel.',
    },
  ],
  en: [
    {
      icon: Award,
      title: 'Operational excellence',
      desc: 'Every program is designed to produce directly applicable skills, not just credentials.',
    },
    {
      icon: CheckCircle2,
      title: 'Integrity and rigor',
      desc: 'Transparency, discipline and accountability in every session, every interaction, every pedagogical decision.',
    },
    {
      icon: Users,
      title: 'Useful leadership',
      desc: 'We train people who can decide, act and move their teams forward in African and global contexts.',
    },
    {
      icon: Globe2,
      title: 'Measurable social impact',
      desc: 'Every cohort targets a concrete outcome: placement, promotion, business creation or institutional strengthening.',
    },
  ],
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function AboutModernPage({
  locale,
  homeHref,
  formationsHref,
  contactHref,
}: AboutModernPageProps) {
  const resolvedLocale: SiteLocale = resolveSiteLocale(locale)
  const isFr = resolvedLocale === 'fr'
  const t = publicMessages.about[resolvedLocale]
  const nav = publicMessages.header[resolvedLocale]

  const methods = isFr ? METHOD_STEPS.fr : METHOD_STEPS.en
  const values  = isFr ? VALUES.fr : VALUES.en
  const timeline = isFr ? TIMELINE.fr : TIMELINE.en

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: nav.about }]} homeHref={homeHref} />

        {/* ── S1 : Qui nous sommes ─────────────────────────────────────── */}
        <section className="hero-bg-unified rounded-3xl px-6 py-8 shadow-2xl sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="relative grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
            {/* Gauche */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)]" />
                {t.heroEyebrow}
              </span>
              <h1 className="cj-hero-title mt-3">
                {t.heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white sm:text-base">
                {t.heroDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={formationsHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-red)] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--cj-red-700)]"
                >
                  {t.ctaPrimary}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {t.ctaSecondary}
                </Link>
              </div>
            </div>

            {/* Droite — Mission + Vision */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200">
                  {t.missionEyebrow}
                </p>
                <h2 className="mt-3 text-xl font-bold text-white">{t.missionTitle}</h2>
                <p className="mt-2 text-sm leading-7 text-white">{t.missionDescription}</p>
              </div>
              <div className="rounded-2xl border border-[var(--cj-red)]/30 bg-slate-950/30 p-6 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-200">
                  {t.visionEyebrow}
                </p>
                <h2 className="mt-3 text-xl font-bold text-white">{t.visionTitle}</h2>
                <p className="mt-2 text-sm leading-7 text-white">{t.visionDescription}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── S2 : Pourquoi nous existons — Histoire ───────────────────── */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Histoire courte */}
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--cj-red)]">
              {isFr ? 'Notre histoire' : 'Our story'}
            </p>
            <h2 className="mt-3 text-2xl font-black text-[var(--cj-blue)]">
              {isFr
                ? "Né d'un constat : le diplôme seul ne suffit pas."
                : 'Born from an observation: a degree alone is not enough.'}
            </h2>
            <p className="mt-4 text-sm leading-8 text-slate-600">
              {isFr
                ? "En 2018, CJ Development Training Center est fondé à Kinshasa avec une conviction simple : des milliers de jeunes africains obtiennent des diplômes sans trouver d'emploi, parce que leurs compétences opérationnelles ne correspondent pas aux attentes réelles des entreprises. Nous avons créé un espace pour combler cet écart — pas avec des cours supplémentaires, mais avec une méthode pratique, un accompagnement humain et un réseau actif."
                : 'In 2018, CJ Development Training Center was founded in Kinshasa with a simple conviction: thousands of young Africans obtain degrees without finding jobs, because their operational skills do not match what employers actually need. We created a space to bridge that gap — not with more courses, but with a practical method, human support and an active network.'}
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-600">
              {isFr
                ? 'Depuis, plus de 8 500 apprenants dans 10 pays ont suivi nos programmes. Chaque promotion est une preuve que le problème est soluble — et que la solution commence par la formation de qualité.'
                : 'Since then, more than 8,500 learners across 10 countries have completed our programs. Every cohort is proof that the problem is solvable — and the solution starts with quality training.'}
            </p>
          </article>

          {/* Timeline */}
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--cj-red)]">
              {t.timelineTitle}
            </p>
            <div className="mt-5 space-y-4">
              {timeline.map((item, i) => (
                <div key={item.year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--cj-blue)] text-xs font-bold text-white">
                      {item.year}
                    </span>
                    {i < timeline.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-slate-200" />
                    )}
                  </div>
                  <p className="pb-4 pt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* ── S3 : Notre méthode ───────────────────────────────────────── */}
        <section className="mt-10">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--cj-red)]">
              {isFr ? 'Notre méthode' : 'Our method'}
            </p>
            <h2 className="mt-2 text-3xl font-black text-[var(--cj-blue)] sm:text-4xl">
              {isFr ? 'Une pédagogie construite pour le résultat' : 'A pedagogy built for results'}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              {isFr
                ? 'Nous ne formons pas pour former. Chaque étape de notre méthode est conçue pour produire une transformation mesurable.'
                : "We don't train for the sake of training. Every step of our method is designed to produce measurable transformation."}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {methods.map((step) => (
              <article
                key={step.num}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-4xl font-black text-[var(--cj-blue)]/15">{step.num}</span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p>
              </article>
            ))}
          </div>

          {/* Photo sessions */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {['/apropos.jpeg', '/books-wood.jpg', '/lor-de-formation.jpeg'].map((src, i) => (
              <div key={i} className="overflow-hidden rounded-2xl">
                <Image
                  src={src}
                  alt={isFr ? 'Session de formation CJ DTC' : 'CJ DTC training session'}
                  width={600}
                  height={400}
                  className="h-52 w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── S4 : Nos chiffres ────────────────────────────────────────── */}
        <section className="mt-10 overflow-hidden rounded-3xl bg-[var(--cj-blue)] px-8 py-12 text-white sm:px-10">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">
              {isFr ? 'Les chiffres parlent' : 'The numbers speak'}
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              {isFr ? 'Nos preuves en chiffres' : 'Our proof in numbers'}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {PROOF_STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <article
                  key={stat.value}
                  className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-blue-300" />
                  <p className="mt-4 text-3xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs leading-5 text-blue-200">
                    {isFr ? stat.label : stat.labelEn}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        {/* ── S5 : Notre rayonnement ───────────────────────────────────── */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Pays */}
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)]">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  {isFr ? 'Présence géographique' : 'Geographic reach'}
                </p>
                <h2 className="text-xl font-black text-[var(--cj-blue)]">
                  {isFr ? '10+ pays touchés' : '10+ countries reached'}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {isFr
                ? "CJ DTC forme des professionnels en Afrique centrale, de l'Ouest et au-delà. Notre réseau s'étend chaque année grâce à nos partenaires institutionnels et nos anciens apprenants devenus ambassadeurs."
                : 'CJ DTC trains professionals across Central Africa, West Africa and beyond. Our network grows each year through institutional partners and alumni who become ambassadors.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <span
                  key={country}
                  className="rounded-full border border-[var(--cj-blue)]/15 bg-[var(--cj-blue-50)] px-3 py-1 text-xs font-semibold text-[var(--cj-blue)]"
                >
                  {country}
                </span>
              ))}
            </div>
          </article>

          {/* Valeurs */}
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--cj-red)]">
              {t.valuesTitle}
            </p>
            <p className="mt-1 text-sm text-slate-500">{t.valuesDescription}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900">{value.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">{value.desc}</p>
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        {/* ── S6 : Appel à l'action ────────────────────────────────────── */}
        <section className="mt-10 pb-10">
          <div className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#02142f_0%,#002d72_55%,#0c4da2_100%)] px-8 py-12 text-white shadow-xl sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,6,19,0.18),transparent_45%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">
                  {isFr ? 'Prochaine étape' : 'Next step'}
                </p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  {t.ctaTitle}
                </h2>
                <p className="mt-4 max-w-2xl text-base text-white">
                  {t.ctaDescription}
                </p>

                {/* Garanties finales */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {(isFr
                    ? ['Programmes certifiants', 'Coaching inclus', 'Suivi 12 mois', 'Réseau panafricain']
                    : ['Certified programs', 'Coaching included', '12-month follow-up', 'Pan-African network']
                  ).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/90">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:min-w-[200px]">
                <Link
                  href={formationsHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--cj-red-700)]"
                >
                  {t.ctaPrimary}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {t.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
