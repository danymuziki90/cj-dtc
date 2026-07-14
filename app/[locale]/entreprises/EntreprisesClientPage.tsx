'use client'

import { useState } from 'react'
import {
  ArrowRight, Award, BarChart3, BookOpen, Briefcase, Building2,
  CheckCircle2, ChevronDown, ChevronUp, Globe2, GraduationCap,
  HeartHandshake, Heart, Landmark, Layers, Lightbulb, MessageCircleIcon,
  Rocket, ShieldIcon, TargetIcon, TrendingUp, Users, ZapIcon,
} from 'lucide-react'
import EntrepriseContactForm from '@/components/entreprises/EntrepriseContactForm'

type Locale = 'fr' | 'en'

// ─── COPY bilingue ────────────────────────────────────────────────────────────
const COPY = {
  fr: {
    heroBadge:      'Partenaire stratégique RH & Formation',
    heroTitle:      'Nous renforçons vos talents, votre leadership et votre fonction RH.',
    heroSub:        "CJ Development Training Center accompagne les organisations dans le développement des compétences, la professionnalisation des équipes, le renforcement du leadership et l'amélioration de la performance organisationnelle.",
    heroCta1:       'Demander un échange entreprise',
    heroCta2:       'Découvrir nos solutions',
    whyBadge:       'Pourquoi CJ Development ?',
    whyTitle:       'Un partenaire qui produit des résultats mesurables.',
    whySub:         'Nos interventions sont conçues pour créer un impact réel sur vos équipes et votre organisation, dès les premières semaines.',
    solutionsBadge: 'Nos solutions corporate',
    solutionsTitle: 'Des offres conçues pour les organisations exigeantes.',
    solutionsSub:   'Chaque dispositif est adapté à votre contexte, vos équipes et vos objectifs stratégiques.',
    showAll:        'Voir toutes nos solutions',
    showLess:       'Réduire',
    sectorsBadge:   'Secteurs accompagnés',
    sectorsTitle:   'Nous intervenons dans tous les secteurs.',
    sectorsSub:     "De la PME familiale à l'institution internationale, nous adaptons notre approche à votre réalité.",
    methodBadge:    'Notre méthode',
    methodTitle:    "Un accompagnement structuré, de l'analyse à l'impact.",
    methodSub:      'Six étapes éprouvées pour transformer un besoin en performance concrète.',
    differsBadge:   'Ce qui nous différencie',
    differsTitle:   'Pourquoi nos interventions produisent des résultats.',
    trustBadge:     'Preuves de crédibilité',
    trustTitle:     'Ils nous font confiance.',
    trustSub:       'Des milliers de professionnels et organisations ont choisi CJ Development pour transformer leurs équipes.',
    faqBadge:       'FAQ décideurs',
    faqTitle:       'Questions fréquentes des responsables RH et dirigeants.',
    ctaBadge:       "Passez à l'action",
    ctaTitle:       'Prêt à développer le potentiel de vos équipes ?',
    ctaSub:         "Prenez contact avec notre équipe corporate pour un premier échange sans engagement. Nous vous proposerons une solution adaptée à votre organisation sous 48h.",
    ctaBtn1:        'Demander un échange entreprise',
    ctaBtn2:        'Obtenir un devis personnalisé',
    learnMore:      'En savoir plus',
    benefits:       'Bénéfices',
    audience:       'Public concerné',
  },
  en: {
    heroBadge:      'Strategic HR & Training Partner',
    heroTitle:      "We strengthen your talent, leadership and HR function.",
    heroSub:        'CJ Development Training Center partners with organisations to develop skills, professionalize teams, strengthen leadership and improve organisational performance.',
    heroCta1:       'Request a corporate meeting',
    heroCta2:       'Discover our solutions',
    whyBadge:       'Why CJ Development?',
    whyTitle:       'A partner that delivers measurable results.',
    whySub:         'Our interventions are designed to create real impact on your teams and organisation from the very first weeks.',
    solutionsBadge: 'Our corporate solutions',
    solutionsTitle: 'Offerings designed for demanding organisations.',
    solutionsSub:   'Every solution is adapted to your context, teams and strategic objectives.',
    showAll:        'See all our solutions',
    showLess:       'Collapse',
    sectorsBadge:   'Sectors we serve',
    sectorsTitle:   'We work across all sectors.',
    sectorsSub:     'From family-owned SMEs to international institutions, we adapt our approach to your reality.',
    methodBadge:    'Our method',
    methodTitle:    'A structured approach — from analysis to impact.',
    methodSub:      'Six proven steps to turn a need into measurable performance.',
    differsBadge:   'What sets us apart',
    differsTitle:   'Why our interventions produce results.',
    trustBadge:     'Proof of credibility',
    trustTitle:     'They trust us.',
    trustSub:       'Thousands of organisations and professionals have chosen CJ Development to transform their teams.',
    faqBadge:       'Decision-maker FAQ',
    faqTitle:       'Frequently asked questions from HR leaders and executives.',
    ctaBadge:       'Take action',
    ctaTitle:       "Ready to unlock your team's potential?",
    ctaSub:         'Contact our corporate team for a first no-commitment conversation. We will propose a solution tailored to your organisation within 48h.',
    ctaBtn1:        'Request a corporate meeting',
    ctaBtn2:        'Get a custom quote',
    learnMore:      'Learn more',
    benefits:       'Benefits',
    audience:       'TargetIcon audience',
  },
}

// ─── Données statiques ────────────────────────────────────────────────────────

const TRUST_STATS = [
  { value: '8 500+', fr: 'Professionnels formés',     en: 'Professionals trained'    },
  { value: '200+',   fr: 'Organisations accompagnées', en: 'Organisations supported'  },
  { value: '10+',    fr: 'Pays couverts',              en: 'Countries covered'         },
  { value: '95%',    fr: 'Taux de satisfaction',       en: 'Satisfaction rate'         },
]

const WHY_CARDS = {
  fr: [
    { icon: TrendingUp, title: 'Montée en compétences',         desc: 'Des programmes calibrés sur les besoins métiers réels pour élever le niveau collectif.' },
    { icon: BarChart3,  title: 'Performance améliorée',         desc: 'Des méthodes orientées terrain qui produisent des résultats mesurables dès les premières semaines.' },
    { icon: Rocket,     title: 'Leadership renforcé',           desc: 'Développement des leaders à tous les niveaux pour une organisation plus résiliente.' },
    { icon: Heart,      title: 'Fidélisation des talents',      desc: "L'investissement formation réduit le turnover et renforce l'engagement collaborateur." },
    { icon: Layers,     title: 'Accompagnement du changement',  desc: 'Soutien aux équipes lors des transformations organisationnelles ou changements stratégiques.' },
    { icon: ShieldIcon,     title: 'Pratiques RH professionnalisées', desc: 'Structuration des processus RH pour une gestion des talents plus efficace et durable.' },
  ],
  en: [
    { icon: TrendingUp, title: 'Skills development',            desc: 'Programs calibrated to real business needs to raise collective performance.' },
    { icon: BarChart3,  title: 'Improved performance',          desc: 'Field-oriented methods that produce measurable results from the first weeks.' },
    { icon: Rocket,     title: 'Stronger leadership',           desc: 'Leadership development at all levels for a more resilient organisation.' },
    { icon: Heart,      title: 'Talent retention',              desc: 'Investing in training reduces turnover and strengthens employee engagement.' },
    { icon: Layers,     title: 'Change management',             desc: 'Supporting teams through organisational or strategic transformations.' },
    { icon: ShieldIcon,     title: 'Professionalised HR practices', desc: 'Structuring HR processes for more effective and sustainable talent management.' },
  ],
}

const SOLUTIONS = {
  fr: [
    { icon: BookOpen,   title: 'Formation intra-entreprise',    desc: 'Sessions animées dans vos locaux, adaptées à votre culture et vos équipes.',                  benefits: ["Cohésion d'équipe", 'Pertinence contextuelle', 'Flexibilité horaire'],      audience: 'Équipes, services, directions' },
    { icon: Layers,     title: 'Formation sur mesure',          desc: 'Ingénierie pédagogique complète à partir de vos enjeux métiers et objectifs stratégiques.',    benefits: ['Programme 100% adapté', 'ROI mesurable', 'Contenu propriétaire'],           audience: 'Toute organisation' },
    { icon: TargetIcon,     title: 'Coaching individuel',           desc: 'Accompagnement personnalisé de dirigeants, managers et hauts potentiels.',                     benefits: ['Progression rapide', 'Confidentialité', 'Plan de développement'],          audience: 'Dirigeants, managers, talents' },
    { icon: Users,      title: "Coaching d'équipe",             desc: 'Renforcement de la cohésion, la communication et la performance collective.',                  benefits: ["Synergie d'équipe", 'Résolution de conflits', 'Alignement'],              audience: 'CODIR, équipes projet' },
    { icon: Rocket,     title: 'Leadership & management',       desc: 'Programmes certifiants pour développer les compétences managériales à tous les niveaux.',      benefits: ['Certification reconnue', 'Impact opérationnel', 'Engagement accru'],      audience: 'Managers, cadres, directeurs' },
    { icon: ShieldIcon,     title: 'Accompagnement RH',             desc: 'Audit, structuration et professionnalisation de la fonction RH de votre organisation.',        benefits: ['Processus optimisés', 'Conformité', "Attractivité employeur"],            audience: 'DRH, responsables RH' },
    { icon: TrendingUp, title: 'Gestion des talents',           desc: 'Identification, développement et fidélisation des profils clés.',                              benefits: ['Plans de succession', 'Cartographie compétences', 'Rétention'],           audience: 'DRH, directions générales' },
    { icon: ZapIcon,        title: 'Employabilité jeunes talents',  desc: "Programmes d'insertion professionnelle pour alternants, stagiaires et nouveaux recrutés.",     benefits: ['Onboarding accéléré', 'Fidélisation', 'Compétences opérationnelles'],     audience: 'Jeunes professionnels, RH' },
    { icon: Globe2,     title: 'Séminaires & ateliers',         desc: "Événements sur mesure pour booster la dynamique d'équipe et stimuler l'innovation.",           benefits: ['Énergie collective', 'Innovation', 'Alignement stratégique'],            audience: 'Équipes dirigeantes, managers' },
    { icon: HeartHandshake,  title: 'Conférences professionnelles',  desc: 'Interventions d\'experts pour vos événements internes et conventions corporate.',               benefits: ['Crédibilité externe', 'Inspiration', 'Mise en réseau'],                  audience: 'Toute organisation' },
    { icon: Lightbulb,  title: 'Interventions corporate',       desc: 'Facilitation stratégique, ateliers de co-construction et missions de conseil.',                benefits: ['Décisions éclairées', 'Intelligence collective', 'Résultats concrets'],   audience: 'COMEX, équipes stratégiques' },
    { icon: BarChart3,  title: 'Diagnostic & conseil RH',       desc: 'Analyse de votre maturité RH et recommandations pour optimiser votre organisation.',           benefits: ["Vision objective", "Plan d'action priorisé", 'Quick wins identifiés'],    audience: 'DRH, PDG, COO' },
  ],
  en: [
    { icon: BookOpen,   title: 'In-company training',           desc: 'Sessions delivered at your premises, tailored to your culture and teams.',                     benefits: ['Team cohesion', 'Contextual relevance', 'Scheduling flexibility'],        audience: 'Teams, departments, leadership' },
    { icon: Layers,     title: 'Custom training',               desc: 'Full learning design built around your business challenges and strategic goals.',               benefits: ['100% tailored program', 'Measurable ROI', 'Proprietary content'],         audience: 'Any organisation' },
    { icon: TargetIcon,     title: 'Individual coaching',           desc: 'Personalised support for executives, managers and high-potential talent.',                      benefits: ['Rapid progression', 'Confidentiality', 'Development plan'],              audience: 'Executives, managers, talents' },
    { icon: Users,      title: 'Team coaching',                 desc: 'Strengthening cohesion, communication and collective performance.',                             benefits: ['Team synergy', 'Conflict resolution', 'Alignment'],                      audience: 'Executive committees, project teams' },
    { icon: Rocket,     title: 'Leadership & management',       desc: 'Certified programs to develop managerial skills at every level.',                               benefits: ['Recognised certification', 'Operational impact', 'Higher engagement'],   audience: 'Managers, executives, directors' },
    { icon: ShieldIcon,     title: 'HR advisory',                   desc: 'Audit, structuring and professionalisation of your HR function.',                               benefits: ['Optimised processes', 'Compliance', 'Employer branding'],                audience: 'CHROs, HR managers' },
    { icon: TrendingUp, title: 'Talent management',             desc: 'Identifying, developing and retaining key profiles within your organisation.',                  benefits: ['Succession plans', 'Skills mapping', 'Retention'],                       audience: 'CHROs, senior management' },
    { icon: ZapIcon,        title: 'Youth employability',           desc: 'Professional integration programs for apprentices, interns and new hires.',                     benefits: ['Accelerated onboarding', 'Retention', 'Operational skills'],              audience: 'Young professionals, HR' },
    { icon: Globe2,     title: 'Seminars & workshops',          desc: 'Bespoke events to boost team energy and stimulate innovation.',                                 benefits: ['Collective energy', 'Innovation', 'Strategic alignment'],                audience: 'Executive teams, managers' },
    { icon: HeartHandshake,  title: 'Professional conferences',      desc: 'Expert speaking and facilitation for your internal events and corporate conventions.',          benefits: ['External credibility', 'Inspiration', 'Networking'],                     audience: 'Any organisation' },
    { icon: Lightbulb,  title: 'Corporate interventions',       desc: 'Strategic facilitation, co-design workshops and one-off advisory missions.',                    benefits: ['Informed decisions', 'Collective intelligence', 'Concrete results'],     audience: 'Executive committees, strategic teams' },
    { icon: BarChart3,  title: 'HR diagnosis & advisory',       desc: 'Analysis of your HR maturity and recommendations to optimise your organisation.',               benefits: ['Objective view', 'Prioritised action plan', 'Quick wins identified'],     audience: 'CHROs, CEOs, COOs' },
  ],
}

const SECTORS = {
  fr: [
    { icon: Building2,     label: 'Entreprises privées'           },
    { icon: Briefcase,     label: 'PME & startups'                },
    { icon: TrendingUp,    label: 'Grandes entreprises'           },
    { icon: Heart,         label: 'ONG & associations'            },
    { icon: Globe2,        label: 'Organisations internationales' },
    { icon: Landmark,      label: 'Administrations publiques'     },
    { icon: GraduationCap, label: 'Universités & écoles'          },
    { icon: ShieldIcon,        label: 'Institutions financières'      },
    { icon: Layers,        label: 'Industries & manufactures'     },
    { icon: Users,         label: 'Coopératives & mutuelles'      },
  ],
  en: [
    { icon: Building2,     label: 'Private companies'             },
    { icon: Briefcase,     label: 'SMEs & startups'               },
    { icon: TrendingUp,    label: 'Large enterprises'             },
    { icon: Heart,         label: 'NGOs & associations'           },
    { icon: Globe2,        label: 'International organisations'   },
    { icon: Landmark,      label: 'Public administrations'        },
    { icon: GraduationCap, label: 'Universities & schools'        },
    { icon: ShieldIcon,        label: 'Financial institutions'        },
    { icon: Layers,        label: 'Industry & manufacturing'      },
    { icon: Users,         label: 'Cooperatives & mutuals'        },
  ],
}

const STEPS = {
  fr: [
    { n: '01', title: 'Diagnostic des besoins',        desc: "Analyse du contexte, des enjeux et des attentes de votre organisation." },
    { n: '02', title: 'Analyse des compétences',       desc: "Cartographie des écarts entre le niveau actuel et les objectifs visés." },
    { n: '03', title: 'Conception personnalisée',      desc: "Ingénierie d'un dispositif sur mesure aligné sur vos priorités stratégiques." },
    { n: '04', title: 'Déploiement',                   desc: "Mise en œuvre rigoureuse de la formation ou de l'accompagnement par nos experts." },
    { n: '05', title: 'Évaluation des résultats',      desc: "Mesure de l'impact réel sur les compétences et la performance organisationnelle." },
    { n: '06', title: 'Suivi & amélioration continue', desc: "Bilan post-intervention, recommandations et plan de consolidation des acquis." },
  ],
  en: [
    { n: '01', title: 'Needs diagnosis',                    desc: "Analysis of your organisation's context, challenges and expectations." },
    { n: '02', title: 'Skills analysis',                    desc: "Mapping the gap between current levels and target objectives." },
    { n: '03', title: 'Personalised design',                desc: "Engineering a bespoke solution aligned with your strategic priorities." },
    { n: '04', title: 'Deployment',                         desc: "Rigorous delivery of the training or advisory engagement by our experts." },
    { n: '05', title: 'Results evaluation',                 desc: "Measuring real impact on skills and organisational performance." },
    { n: '06', title: 'Follow-up & continuous improvement', desc: "Post-intervention review, recommendations and a plan to consolidate gains." },
  ],
}

const DIFFERENTIATORS = {
  fr: [
    { icon: TargetIcon,    title: 'Approche orientée résultats',      desc: "Chaque programme est conçu avec des indicateurs de succès clairs et mesurables dès la conception." },
    { icon: Users,     title: 'Formateurs expérimentés',          desc: "Nos intervenants sont des praticiens reconnus, alliant expertise théorique et expérience terrain." },
    { icon: Lightbulb, title: 'Pédagogie interactive',            desc: "Études de cas réels, simulations, jeux de rôles et ateliers pratiques pour un apprentissage ancré." },
    { icon: ShieldIcon,    title: 'Coaching post-formation',          desc: "Un accompagnement continu après la formation pour consolider les acquis et ancrer le changement." },
    { icon: Globe2,    title: 'Ancrage dans le contexte africain', desc: "Nos programmes intègrent les réalités du marché, des cultures et des enjeux spécifiques à l'Afrique." },
    { icon: Award,     title: 'Certification reconnue',           desc: "Nos certifications renforcent la crédibilité et l'employabilité de vos collaborateurs sur le marché." },
  ],
  en: [
    { icon: TargetIcon,    title: 'Results-oriented approach',        desc: "Every program is designed with clear, measurable success indicators from the design phase." },
    { icon: Users,     title: 'Experienced facilitators',         desc: "Our trainers are recognised practitioners combining theoretical expertise with field experience." },
    { icon: Lightbulb, title: 'Interactive pedagogy',             desc: "Real case studies, simulations, role plays and practical workshops for grounded learning." },
    { icon: ShieldIcon,    title: 'Post-training coaching',           desc: "Continued support after training to consolidate learning and embed sustainable change." },
    { icon: Globe2,    title: 'African context expertise',        desc: "Our programs integrate the realities of African markets, cultures and specific challenges." },
    { icon: Award,     title: 'Recognised certification',         desc: "Our certifications enhance the employability and credibility of your teams on the market." },
  ],
}

const FAQ_DATA = {
  fr: [
    { q: 'Les formations peuvent-elles être personnalisées ?',      a: "Oui, absolument. C'est notre approche privilégiée. Nous réalisons d'abord un diagnostic de vos besoins avant de concevoir un programme 100% adapté à votre contexte, vos équipes et vos objectifs." },
    { q: 'Intervenez-vous dans nos locaux ?',                       a: "Oui. Nous proposons des interventions intra-entreprise dans vos locaux ou tout lieu de votre choix. Nous prenons en charge la logistique pédagogique complète." },
    { q: 'Organisez-vous des formations en ligne ?',                a: "Oui, nous proposons des formats présentiel, distanciel et hybride. La modalité est choisie en fonction de vos contraintes organisationnelles et géographiques." },
    { q: "Quelle est la durée moyenne d'un accompagnement ?",       a: "Cela dépend du dispositif : de 1 journée pour un atelier ponctuel à 6 mois pour un programme de développement managérial. Nous définissons ensemble la durée optimale." },
    { q: 'Comment obtenir un devis ?',                              a: "Remplissez notre formulaire ci-dessous ou contactez-nous directement. Nous vous proposerons un devis détaillé sous 48h après un premier échange de cadrage." },
    { q: 'Comment planifier une intervention ?',                    a: "Après réception de votre demande, notre équipe vous contacte sous 24h pour un échange de cadrage, puis nous élaborons ensemble un planning adapté à vos contraintes." },
  ],
  en: [
    { q: 'Can the training be customised?',                         a: "Yes, absolutely. It is our preferred approach. We first carry out a needs diagnosis before designing a program 100% tailored to your context, teams and objectives." },
    { q: 'Do you deliver training at our premises?',                a: "Yes. We offer in-company delivery at your premises or any venue of your choice. We handle all the learning logistics." },
    { q: 'Do you offer online training?',                           a: "Yes, we offer on-site, online and hybrid formats. The modality is chosen based on your organisational and geographical constraints." },
    { q: 'How long does an engagement typically last?',             a: "It depends on the format: from 1 day for a standalone workshop to 6 months for a management development program. We define the optimal duration together." },
    { q: 'How do I get a quote?',                                   a: "Fill in the form below or contact us directly. We will provide a detailed quote within 48h after an initial scoping call." },
    { q: 'How do I schedule an intervention?',                      a: "After receiving your request, our team contacts you within 24h for a scoping call, then we build a schedule together that fits your constraints." },
  ],
}

// ─── Composant Badge section ──────────────────────────────────────────────────
function SectionBadge({ text }: { text: string }) {
  return (
    <span className="mb-4 inline-block rounded-full border border-[var(--cj-blue)]/20 bg-[var(--cj-blue)]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--cj-blue)]">
      {text}
    </span>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function EntreprisesClientPage({ locale }: { locale: Locale }) {
  const t        = COPY[locale]
  const isFr     = locale === 'fr'
  const [openFaq, setOpenFaq]     = useState<number | null>(null)
  const [showAll, setShowAll]     = useState(false)

  const whyCards   = WHY_CARDS[locale]
  const solutions  = SOLUTIONS[locale]
  const sectors    = SECTORS[locale]
  const steps      = STEPS[locale]
  const differs    = DIFFERENTIATORS[locale]
  const faqItems   = FAQ_DATA[locale]
  const visible    = showAll ? solutions : solutions.slice(0, 6)

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Hero Section floating card */}
        <section className="cj-hero-card mb-10">
          <div className="relative z-10">
            <div className="max-w-4xl">
              <span className="cj-eyebrow-dark">
                <HeartHandshake className="h-3.5 w-3.5 text-[var(--cj-red)] animate-pulse" />
                {t.heroBadge}
              </span>
              <h1 className="cj-hero-title mb-6 leading-tight">
                {t.heroTitle}
              </h1>
              <p className="mb-8 max-w-2xl text-base leading-8 text-blue-100/90 sm:text-lg">{t.heroSub}</p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a href="#contact" className="cj-btn-primary">
                  <MessageCircleIcon className="h-4 w-4" />
                  {t.heroCta1}
                </a>
                <a href="#solutions" className="cj-btn-secondary-dark">
                  {t.heroCta2}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Stats bar inside card */}
            <div className="mt-10 border-t border-white/10 pt-8">
              <dl className="grid grid-cols-2 gap-y-6 gap-x-4 divide-x divide-white/10 sm:grid-cols-4">
                {TRUST_STATS.map((s, idx) => (
                  <div key={s.value} className={`text-center ${idx === 0 ? '' : 'sm:pl-4'}`}>
                    <dt className="text-3xl font-black text-white sm:text-4xl font-montserrat">{s.value}</dt>
                    <dd className="mt-1 text-xs font-semibold text-blue-200 uppercase tracking-wider font-opensans">{isFr ? s.fr : s.en}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

      {/* ════════════════════════════════════════
          2. POURQUOI CJ DEVELOPMENT
      ════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <SectionBadge text={t.whyBadge} />
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.whyTitle}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-slate-600">{t.whySub}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyCards.map((card, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--cj-blue)]/20">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--cj-blue)]/10 transition group-hover:bg-[var(--cj-blue)]/20">
                  <card.icon className="h-6 w-6 text-[var(--cj-blue)]" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{card.desc}</p>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--cj-red)] transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. SOLUTIONS
      ════════════════════════════════════════ */}
      <section id="solutions" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <SectionBadge text={t.solutionsBadge} />
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.solutionsTitle}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-slate-600">{t.solutionsSub}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((sol, i) => (
              <article key={i} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--cj-blue)]/30">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--cj-blue)]/10">
                  <sol.icon className="h-6 w-6 text-[var(--cj-blue)]" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{sol.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">{sol.desc}</p>
                <div className="mb-3">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">{t.benefits}</p>
                  <ul className="space-y-1">
                    {sol.benefits.map((b, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-5 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <span className="font-bold text-slate-500">{t.audience} : </span>
                  <span className="text-slate-700">{sol.audience}</span>
                </div>
                <a href="#contact" className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cj-blue)] hover:text-[var(--cj-red)] transition-colors">
                  {t.learnMore}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button onClick={() => setShowAll(v => !v)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--cj-blue)] px-7 py-3 text-sm font-bold text-[var(--cj-blue)] transition hover:bg-[var(--cj-blue)] hover:text-white">
              {showAll ? t.showLess : t.showAll}
              {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. SECTEURS
      ════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <SectionBadge text={t.sectorsBadge} />
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.sectorsTitle}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-slate-600">{t.sectorsSub}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {sectors.map((s, i) => (
              <div key={i} className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center transition hover:-translate-y-1 hover:border-[var(--cj-blue)]/30 hover:bg-[var(--cj-blue)]/5 hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm transition group-hover:bg-[var(--cj-blue)]/10">
                  <s.icon className="h-6 w-6 text-[var(--cj-blue)]" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. MÉTHODE
      ════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[#001B47] via-[var(--cj-blue)] to-[#0B3A8E] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100">{t.methodBadge}</span>
            <h2 className="text-3xl font-black text-white sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.methodTitle}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-blue-100">{t.methodSub}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="relative rounded-2xl border border-white/15 bg-white/10 p-7 backdrop-blur-sm transition hover:bg-white/15">
                <span className="mb-4 inline-block text-4xl font-black text-white/20 leading-none">{step.n}</span>
                <div className="mb-4 h-0.5 w-12 rounded-full bg-[var(--cj-red)]" />
                <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-blue-100">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. DIFFÉRENCIANTS
      ════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <SectionBadge text={t.differsBadge} />
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.differsTitle}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {differs.map((d, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:shadow-md">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--cj-red)]/10">
                  <d.icon className="h-5 w-5 text-[var(--cj-red)]" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-slate-900">{d.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          7. CONFIANCE / PREUVES
      ════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <SectionBadge text={t.trustBadge} />
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.trustTitle}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-slate-600">{t.trustSub}</p>
          </div>
          {/* Métriques */}
          <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TRUST_STATS.map(s => (
              <div key={s.value} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <p className="text-4xl font-black text-[var(--cj-blue)]">{s.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{isFr ? s.fr : s.en}</p>
              </div>
            ))}
          </div>
          {/* Témoignages */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(isFr ? [
              { quote: '"CJ Development a transformé notre management. Les résultats sont visibles dès les premières semaines."', name: 'Directeur Général', org: 'Groupe industriel, Kinshasa' },
              { quote: '"Un accompagnement RH structuré, des formateurs de haut niveau et une vraie compréhension de notre contexte."', name: 'DRH', org: 'Institution financière' },
              { quote: '"Nos équipes sont montées en compétences rapidement. Le format hybride était parfaitement adapté."', name: 'Responsable Formation', org: 'ONG internationale' },
            ] : [
              { quote: '"CJ Development transformed our management culture. Results were visible within the first weeks."', name: 'CEO', org: 'Industrial Group, Kinshasa' },
              { quote: '"Structured HR support, top-level trainers and a genuine understanding of our operational context."', name: 'CHRO', org: 'Financial institution' },
              { quote: '"Our teams developed skills quickly. The hybrid format was perfectly suited to our needs."', name: 'Training Manager', org: 'International NGO' },
            ]).map((item, i) => (
              <blockquote key={i} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="mb-5 text-sm leading-relaxed text-slate-700 italic">{item.quote}</p>
                <footer>
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.org}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          8. FAQ
      ════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <SectionBadge text={t.faqBadge} />
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.faqTitle}</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-[var(--cj-blue)]/30">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left">
                  <span className="pr-4 text-sm font-bold text-slate-900">{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-[var(--cj-blue)]" />
                    : <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="border-t border-slate-200 bg-white px-6 py-5">
                    <p className="text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          9. CTA + FORMULAIRE
      ════════════════════════════════════════ */}
      <section id="contact" className="scroll-mt-20 mt-10">
        <div className="cj-cta-banner relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,6,19,0.18),transparent_45%)]" />
          
          <div className="relative z-10 grid gap-14 lg:grid-cols-2 lg:items-start text-white">
            {/* Texte gauche */}
            <div>
              <span className="cj-eyebrow-dark mb-4">
                {t.ctaBadge}
              </span>
              <h2 className="mb-6 text-3xl font-black leading-tight sm:text-4xl font-montserrat">
                {t.ctaTitle}
              </h2>
              <p className="mb-8 text-base leading-relaxed text-blue-100 font-opensans">{t.ctaSub}</p>
              <ul className="mb-10 space-y-3 font-opensans">
                {(isFr
                  ? ['Réponse sous 48h', 'Premier échange sans engagement', 'Devis détaillé et personnalisé', 'Expertise panafricaine reconnue']
                  : ['Response within 48h', 'First meeting with no commitment', 'Detailed personalised quote', 'Recognised pan-African expertise']
                ).map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-blue-100">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-200">
                  {isFr ? 'Contact direct' : 'Direct contact'}
                </p>
                <a href="mailto:corporate@cjdevelopmenttc.org"
                  className="text-sm font-semibold text-white transition-colors hover:text-[var(--cj-red)] break-all">
                  corporate@cjdevelopmenttc.org
                </a>
              </div>
            </div>

            {/* Formulaire droite */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
              <h3 className="mb-4 text-xl font-black text-white font-montserrat">{t.ctaBtn1}</h3>
              <EntrepriseContactForm locale={locale} />
            </div>
          </div>
        </div>
      </section>

      </div>
    </div>
  )
}
