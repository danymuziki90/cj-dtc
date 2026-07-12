import Link from 'next/link'
import { BookOpen, CalendarDays, UserPlus, Layout, CheckCircle2 } from 'lucide-react'

type Props = {
  locale: 'fr' | 'en'
}

const STEPS_FR = [
  {
    icon: BookOpen,
    title: 'Choisissez une formation',
    description: 'Parcourez notre catalogue et identifiez le programme adapté à vos objectifs professionnels.',
    color: 'bg-blue-100 text-[var(--cj-blue)]',
    border: 'border-blue-200',
  },
  {
    icon: CalendarDays,
    title: 'Consultez les sessions disponibles',
    description: 'Vérifiez les dates, le format (présentiel, en ligne, hybride) et les places encore disponibles.',
    color: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200',
  },
  {
    icon: CheckCircle2,
    title: 'Réservez votre place',
    description: 'Cliquez sur « Réserver ma place » et remplissez le formulaire d\'inscription. Confirmation immédiate.',
    color: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    icon: UserPlus,
    title: 'Créez votre compte étudiant',
    description: 'Si vous n\'en avez pas encore, créez votre espace étudiant pour suivre votre inscription et accéder aux ressources.',
    color: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
  },
  {
    icon: Layout,
    title: 'Accédez à votre espace étudiant',
    description: 'Suivez l\'avancement de votre dossier, téléchargez vos supports et accédez à votre certificat après la formation.',
    color: 'bg-red-100 text-[var(--cj-red)]',
    border: 'border-red-200',
  },
]

const STEPS_EN = [
  {
    icon: BookOpen,
    title: 'Choose a training program',
    description: 'Browse our catalog and identify the program that matches your professional goals.',
    color: 'bg-blue-100 text-[var(--cj-blue)]',
    border: 'border-blue-200',
  },
  {
    icon: CalendarDays,
    title: 'View available sessions',
    description: 'Check the dates, format (on-site, online, hybrid) and remaining spots.',
    color: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200',
  },
  {
    icon: CheckCircle2,
    title: 'Reserve your spot',
    description: 'Click "Reserve my spot" and fill in the registration form. Immediate confirmation.',
    color: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    icon: UserPlus,
    title: 'Create your student account',
    description: 'If you don\'t have one yet, create your student space to track your registration and access resources.',
    color: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
  },
  {
    icon: Layout,
    title: 'Access your student space',
    description: 'Track your application, download your course materials and get your certificate after training.',
    color: 'bg-red-100 text-[var(--cj-red)]',
    border: 'border-red-200',
  },
]

export default function HowToRegister({ locale }: Props) {
  const steps = locale === 'fr' ? STEPS_FR : STEPS_EN
  const isFr = locale === 'fr'

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            {isFr ? "Parcours d'inscription" : 'Registration process'}
          </span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            {isFr ? "Comment s'inscrire ?" : 'How to register?'}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-base text-slate-600">
            {isFr
              ? "Cinq étapes simples pour passer de la découverte à l'inscription confirmée."
              : 'Five simple steps from discovery to confirmed registration.'}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-slate-200" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* Number + Icon */}
                <div className="relative mb-4">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 ${step.border} ${step.color} shadow-sm`}>
                    <step.icon className="h-9 w-9" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--cj-blue)] text-xs font-bold text-white shadow">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-[var(--cj-blue)] via-[#0B3A8E] to-[#001B47] p-8 text-center text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-2">
            {isFr ? 'Prêt à vous lancer ?' : 'Ready to get started?'}
          </h3>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto text-sm">
            {isFr
              ? "Consultez les sessions ouvertes et réservez votre place dès aujourd'hui. Les inscriptions ferment dès que les places sont épuisées."
              : 'View the open sessions and reserve your spot today. Registrations close once seats are filled.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#sessions"
              className="inline-block rounded-xl bg-[var(--cj-red)] px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-red-700"
            >
              {isFr ? 'Voir les sessions' : 'View sessions'}
            </a>
            <Link
              href={`/${locale}/contact`}
              className="inline-block rounded-xl border-2 border-white/50 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {isFr ? 'Parler à un conseiller' : 'Talk to an advisor'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
