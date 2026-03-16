'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Medal,
  NotebookText,
  UserRound,
} from 'lucide-react'

const items = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/mes-sessions', label: 'Mes sessions', icon: GraduationCap },
  { href: '/student/ressources', label: 'Ressources', icon: BookOpen },
  { href: '/student/resultats', label: 'Resultats', icon: NotebookText },
  { href: '/student/certificats', label: 'Certificats', icon: Medal },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student/submissions', label: 'Travaux', icon: NotebookText },
  { href: '/student/profile', label: 'Profil', icon: UserRound },
]

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function StudentPortalNav() {
  const pathname = usePathname()

  return (
    <nav className="overflow-x-auto rounded-[24px] border border-white/70 bg-white/85 p-2 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.32)] backdrop-blur">
      <ul className="flex min-w-max gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isItemActive(pathname, href)
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition',
                  active
                    ? 'bg-[var(--cj-blue)] text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[var(--cj-blue)]',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
