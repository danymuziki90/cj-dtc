'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navRow1 = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/travaux', label: 'Travaux' },
  { href: '/admin/students', label: 'Étudiants' },
  { href: '/admin/enrollments', label: 'Inscriptions' },
]

const navRow2 = [
  { href: '/admin/documents', label: 'Supports pédagogiques' },
  { href: '/admin/certificates', label: 'Certificats' },
  { href: '/admin/evaluations', label: 'Témoignages' },
  { href: '/admin/articles', label: 'Actualités' },
  { href: '/admin/emplois', label: "Offres d'emploi" },
  { href: '/admin/b2b', label: 'Entreprises' },
  { href: '/admin/heroes', label: 'Apparence' },
  { href: '/admin/settings', label: 'Paramètres' },
]

export default function AdminHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`))

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-3 group" aria-label="Accueil admin">
          <img src="/logo.png" alt="CJ Development Training Center" className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105" />
          <div className="hidden sm:block border-l border-slate-200 pl-3">
            <p className="text-sm font-black tracking-tight text-slate-900 leading-tight">CJ Development</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-primary)]">Administration</p>
          </div>
        </Link>

        {/* Navigation Desktop sur 2 Lignes */}
        <div className="hidden flex-col gap-1.5 md:flex">
          <nav className="flex items-center gap-1.5" aria-label="Navigation Ligne 1">
            {navRow1.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  isActive(link.href)
                    ? 'bg-[var(--admin-primary)] text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 hover:text-[var(--admin-primary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex items-center gap-1.5 border-t border-slate-100 pt-1.5" aria-label="Navigation Ligne 2">
            {navRow2.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  isActive(link.href)
                    ? 'bg-[var(--admin-primary)] text-white shadow-sm shadow-blue-900/20'
                    : 'text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 hover:text-[var(--admin-primary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
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
        className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 ease-out md:hidden ${
          menuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex w-full flex-col gap-1 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">Opérations & Pilotage</p>
          {navRow1.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                isActive(link.href)
                  ? 'bg-[var(--admin-primary)] text-white'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-2 border-t border-slate-100">Ressources & Management</p>
          {navRow2.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                isActive(link.href)
                  ? 'bg-[var(--admin-primary)] text-white'
                  : 'text-slate-800 hover:bg-slate-50'
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
