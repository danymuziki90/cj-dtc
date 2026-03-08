import Link from 'next/link'
import {
  Download,
  FileUp,
  FolderCheck,
  Home,
  IdCard,
  Presentation,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type TileItem = {
  label: string
  description: string
  href: string
  icon: LucideIcon
  tone: string
}

export default async function EspaceEtudiantsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const tiles: TileItem[] = [
    {
      label: 'Dashboard / Home',
      description: "Vue d'ensemble de votre espace etudiant",
      href: `/${locale}/espace-etudiants`,
      icon: Home,
      tone: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'My Session',
      description: 'Consulter votre session et vos formations',
      href: `/${locale}/espace-etudiants/mes-formations`,
      icon: Presentation,
      tone: 'from-indigo-500 to-blue-600',
    },
    {
      label: 'Upload Assignment',
      description: 'Deposer un devoir ou un travail',
      href: `/${locale}/espace-etudiants/travaux`,
      icon: FileUp,
      tone: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'My Submissions',
      description: 'Suivre le statut de vos soumissions',
      href: `/${locale}/espace-etudiants/travaux`,
      icon: FolderCheck,
      tone: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Certificate Download',
      description: 'Telecharger vos certificats',
      href: `/${locale}/espace-etudiants/mes-certificats`,
      icon: Download,
      tone: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Profile',
      description: 'Mettre a jour votre compte',
      href: `/${locale}/espace-etudiants/mon-compte`,
      icon: IdCard,
      tone: 'from-rose-500 to-pink-600',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-8 rounded-3xl bg-[radial-gradient(circle_at_top_right,_#2563eb,_#1e3a8a_55%,_#0f172a)] p-6 text-white shadow-2xl md:p-8">
        <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
          Espace Etudiant
        </p>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">Quick Access Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
          Navigation moderne par tuiles avec icones, directement sur la surface principale.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Link
              key={tile.label}
              href={tile.href}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${tile.tone} p-3 text-white shadow`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{tile.label}</h2>
              <p className="mt-1 text-sm text-gray-600">{tile.description}</p>
              <span className="mt-4 inline-block text-xs font-semibold text-cjblue transition group-hover:translate-x-1">
                Open section -&gt;
              </span>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
