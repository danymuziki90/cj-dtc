'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/formations', label: 'Formations' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/articles', label: 'Actualites' },
  { href: '/admin/enrollments', label: 'Inscriptions' },
  { href: '/admin/payments', label: 'Paiements' },
  { href: '/admin/students', label: 'Etudiants' },
]

export default function AdminHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`))

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 text-slate-100 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/admin/dashboard" className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/20 ring-1 ring-cyan-300/40">
              <img src="/logo.png" alt="CJ DTC" className="h-5 w-5 object-contain" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin portal</p>
              <span className="text-sm font-semibold text-white">CJ Development Training</span>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navigation admin">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-200 transition hover:bg-slate-800 md:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-slate-800 transition-all duration-300 ease-out md:hidden ${
          menuOpen ? 'max-h-[24rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(link.href)
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
