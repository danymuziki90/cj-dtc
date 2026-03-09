import Link from 'next/link'
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

type AboutModernPageProps = {
  homeHref: string
  formationsHref: string
  contactHref: string
}

const stats = [
  { value: '10+', label: 'Pays accompagnes', icon: Globe2 },
  { value: '8500+', label: 'Jeunes impactes', icon: Users },
  { value: '29+', label: 'Promotions certifiees', icon: Award },
  { value: '95%', label: 'Taux de satisfaction', icon: Target },
]

const values = [
  {
    title: 'Excellence',
    description: 'Nous construisons des parcours concrets, exigeants et adaptes au marche africain.',
    icon: Sparkles,
  },
  {
    title: 'Integrite',
    description: 'Nous travaillons avec transparence, discipline et responsabilite dans chaque programme.',
    icon: ShieldCheck,
  },
  {
    title: 'Leadership utile',
    description: 'Nous formons des profils capables de prendre des decisions et de faire avancer leurs equipes.',
    icon: Briefcase,
  },
  {
    title: 'Impact social',
    description: 'Chaque session vise un resultat mesurable sur les personnes, les organisations et la communaute.',
    icon: HeartHandshake,
  },
]

const timeline = [
  { year: '2018', text: 'Lancement du centre a Kinshasa, RDC.' },
  { year: '2019', text: 'Demarrage du programme IOP et premiers partenariats.' },
  { year: '2021', text: 'Extension des cohortes dans plusieurs pays.' },
  { year: '2024', text: 'Renforcement digital, suivi et certification à grande échelle.' },
]

export default function AboutModernPage({
  homeHref,
  formationsHref,
  contactHref,
}: AboutModernPageProps) {
  return (
    <div className="bg-[var(--cj-blue-50)] text-slate-900">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#002D72_0%,#003b96_70%,#E30613_150%)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.35),_transparent_45%),radial-gradient(circle_at_20%_30%,_rgba(227,6,19,0.20),_transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            Retour à l'accueil
          </Link>

          <div className="mt-8 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-300">CJ Development Training Center</p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl">
              A propos: un centre de formation moderne, axe sur l'impact.
            </h1>
            <p className="mt-5 text-lg text-blue-100">
              Nous aidons les jeunes et les professionnels a passer d'un potentiel brut a une competence
              operationnelle reconnue.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <item.icon className="h-5 w-5 text-blue-300" />
                <p className="mt-4 text-3xl font-bold">{item.value}</p>
                <p className="mt-1 text-sm text-blue-100">{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-cjblue">Mission</p>
          <h2 className="mt-3 text-2xl font-bold">Former des profils directement employables.</h2>
          <p className="mt-4 text-gray-600">
            Notre mission est de combiner pratique, discipline et accompagnement pour accelerer
            l'insertion professionnelle et la progression de carriere.
          </p>
        </article>

        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-cjblue">Vision</p>
          <h2 className="mt-3 text-2xl font-bold">Devenir la reference panafricaine des talents.</h2>
          <p className="mt-4 text-gray-600">
            Nous voulons batir un ecosysteme de formation capable de produire des leaders utiles aux
            entreprises, institutions et communautes africaines.
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-8">
          <h3 className="text-2xl font-bold">Nos valeurs</h3>
          <p className="mt-2 text-gray-600">Un cadre de travail clair, professionnel et orientee resultats.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {values.map((value) => (
              <article key={value.title} className="rounded-2xl border border-blue-100 bg-[var(--cj-blue-50)] p-5">
                <value.icon className="h-5 w-5 text-cjblue" />
                <h4 className="mt-3 font-semibold">{value.title}</h4>
                <p className="mt-2 text-sm leading-6 text-gray-600">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-8">
          <h3 className="text-2xl font-bold">Parcours du centre</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item) => (
              <article key={item.year} className="rounded-2xl border border-blue-100 p-5">
                <p className="inline-flex rounded-full bg-cjblue px-3 py-1 text-xs font-semibold text-white">{item.year}</p>
                <p className="mt-3 text-sm text-gray-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cjblue to-blue-800 p-8 text-white sm:p-10">
          <h3 className="text-3xl font-bold">Prets a evoluer avec CJ DTC ?</h3>
          <p className="mt-3 max-w-3xl text-blue-100">
            Decouvrez nos programmes, choisissez votre session et construisez votre prochaine etape
            professionnelle avec un cadre structure.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={formationsHref}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-cjblue transition hover:bg-blue-50"
            >
              Explorer les formations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={contactHref}
              className="inline-flex items-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contacter notre equipe
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

