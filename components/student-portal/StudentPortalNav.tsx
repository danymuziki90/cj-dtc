'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Award,
  UserCircle,
  FileText,
} from 'lucide-react'

const items = [
  { href: '/espace-etudiants', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/espace-etudiants/travaux', label: 'Mes Travaux', icon: FileText },
  { href: '/espace-etudiants/mes-formations', label: 'Mes formations', icon: GraduationCap },
  { href: '/espace-etudiants/supports', label: 'Supports pédagogiques', icon: BookOpen },
  { href: '/espace-etudiants/resultats', label: 'Résultats', icon: BookOpen },
  { href: '/espace-etudiants/mes-certificats', label: 'Certificats', icon: Award },
  { href: '/espace-etudiants/mon-compte', label: 'Mon compte', icon: UserCircle },
]

export default function StudentPortalNav() {
  const pathname = usePathname()
  const match = pathname ? pathname.match(/^\/(fr|en)/) : null
  const localePrefix = match ? match[0] : '/fr'

  return (
    <nav className="overflow-x-auto rounded-[24px] border border-white/70 bg-white/85 p-2 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.32)] backdrop-blur">
      <ul className="flex min-w-max gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const targetHref = `${localePrefix}${href}`
          const active =
            href === '/espace-etudiants'
              ? pathname === targetHref || pathname === '/espace-etudiants'
              : pathname.startsWith(targetHref) || pathname.startsWith(href)

          return (
            <li key={href}>
              <Link
                href={targetHref}
                className={[
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition',
                  active
                    ? 'bg-[var(--cj-blue)] text-white shadow-lg shadow-blue-900/20 font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[var(--cj-blue)]',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
