'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
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

export default function AdminHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`))

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-black shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/admin/dashboard" className="shrink-0" aria-label="Accueil admin">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gray-100 ring-1 ring-gray-300">
            <img src="/logo.png" alt="CJ DTC" className="h-12 w-12 object-contain" />
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navigation admin">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? 'bg-gray-100 text-black ring-1 ring-gray-300'
                  : 'text-gray-800 hover:bg-gray-100 hover:text-black'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
                  ? 'bg-gray-100 text-black ring-1 ring-gray-300'
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

