'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const quickLinks = [
  { href: '/admin/dashboard', label: 'Vue globale' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/enrollments', label: 'Inscriptions' },
  { href: '/admin/payments', label: 'Paiements' },
  { href: '/admin/submissions', label: 'Travaux' },
  { href: '/admin/students', label: 'Etudiants' },
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
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(6,182,212,0.18),_transparent_40%),radial-gradient(circle_at_top_left,_rgba(14,165,233,0.1),_transparent_35%)]" />
      <main className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.65)] backdrop-blur">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-5 text-slate-100 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Back-office central</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-slate-300">Pilotage des sessions, etudiants, paiements et contenus.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              className="rounded-xl bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 ring-1 ring-rose-300/25 transition hover:bg-rose-500/25 disabled:opacity-70"
            >
              {loggingOut ? 'Deconnexion...' : 'Se deconnecter'}
            </button>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 px-4 py-3 md:px-6">
          {quickLinks.map((link) => {
            const active =
              pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(`${link.href}/`))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
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
