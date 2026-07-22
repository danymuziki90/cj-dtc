'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navRow1 = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/reports', label: 'Pilotage' },
  { href: '/admin/formations', label: 'Formations' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/students', label: 'Étudiants' },
  { href: '/admin/enrollments', label: 'Inscriptions' },
  { href: '/admin/assignments', label: 'Travaux' },
]

const navRow2 = [
  { href: '/admin/documents', label: 'Supports pédagogiques' },
  { href: '/admin/certificates', label: 'Certificats' },
  { href: '/admin/evaluations', label: 'Témoignages' },
  { href: '/admin/articles', label: 'Actualités' },
  { href: '/admin/b2b', label: 'Entreprises' },
  { href: '/admin/settings', label: 'Paramètres' },
]

const navLinks = [...navRow1, ...navRow2]

export default function AdminHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`))

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-black shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between px-3 py-3 sm:px-4 lg:px-5 xl:px-6 2xl:px-8">
        <Link href="/admin/dashboard" className="shrink-0" aria-label="Accueil admin">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gray-100 ring-1 ring-gray-300">
            <img src="/logo.png" alt="CJ DTC" className="h-10 w-10 object-contain" />
          </div>
        </Link>

        {/* Navigation Desktop sur 2 Lignes */}
        <div className="hidden flex-col gap-1.5 md:flex">
          <nav className="flex items-center gap-1.5" aria-label="Navigation Ligne 1">
            {navRow1.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-[var(--admin-primary)] ring-1 ring-blue-200 font-bold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex items-center gap-1.5 border-t border-gray-100 pt-1" aria-label="Navigation Ligne 2">
            {navRow2.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                  isActive(link.href)
                    ? 'bg-blue-50 text-[var(--admin-primary)] ring-1 ring-blue-200 font-bold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-gray-800 transition hover:bg-gray-100 md:hidden"
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
        className={`overflow-hidden border-t border-gray-200 bg-white transition-all duration-300 ease-out md:hidden ${
          menuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex w-full flex-col gap-1 px-3 py-3 sm:px-4 lg:px-5 xl:px-6 2xl:px-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1">Ligne 1</p>
          {navRow1.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive(link.href)
                  ? 'bg-blue-50 text-[var(--admin-primary)] ring-1 ring-blue-200'
                  : 'text-gray-800 hover:bg-gray-100 hover:text-black'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-2 border-t border-gray-100">Ligne 2</p>
          {navRow2.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive(link.href)
                  ? 'bg-blue-50 text-[var(--admin-primary)] ring-1 ring-blue-200'
                  : 'text-gray-800 hover:bg-gray-100 hover:text-black'
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
