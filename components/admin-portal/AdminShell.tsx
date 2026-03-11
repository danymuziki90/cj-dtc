'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const quickLinks = [
  { href: '/admin/dashboard', label: 'Vue globale' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/students', label: 'Etudiants' },
  { href: '/admin/enrollments', label: 'Inscriptions' },
  { href: '/admin/payments', label: 'Paiements' },
  { href: '/admin/submissions', label: 'Travaux' },
  { href: '/admin/certificates', label: 'Certificats' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/articles', label: 'Actualités' },
  { href: '/admin/settings', label: 'Parametres' },
]

export default function AdminShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(0,48,160,0.2),_transparent_42%),radial-gradient(circle_at_top_left,_rgba(255,0,0,0.08),_transparent_38%)]" />
      <main className="overflow-hidden rounded-3xl border border-blue-100 bg-white/95 shadow-[0_25px_70px_-50px_rgba(0,48,160,0.45)] backdrop-blur">
        <div className="flex flex-col gap-4 border-b border-blue-100 bg-gradient-to-r from-[var(--admin-primary-700)] to-[var(--admin-primary)] px-4 py-5 text-white md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-100">Back-office central</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-1 text-sm text-blue-100">Pilotage des sessions, etudiants, paiements et contenus.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded-xl bg-[var(--admin-accent)]/15 px-4 py-2 text-sm font-semibold text-red-100 ring-1 ring-red-200/40 transition hover:bg-[var(--admin-accent)]/30 disabled:opacity-70"
            >
              {loggingOut ? 'Deconnexion...' : 'Se deconnecter'}
            </button>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-3 md:px-6">
          {quickLinks.map((link) => {
            const active =
              pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(`${link.href}/`))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-gray-100 text-black ring-1 ring-gray-300'
                    : 'bg-white text-black ring-1 ring-gray-200 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}

