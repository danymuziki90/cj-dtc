'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { href: '/admin/formations', label: 'Formations' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/articles', label: 'Actualités' },
  { href: '/admin/enrollments', label: 'Inscriptions' },
  { href: '/admin/payments', label: 'Paiements' },
  { href: '/admin/invoices', label: 'Factures' },
]

export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-cjblue text-white py-2 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="CJ DTC" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-sm">CJ DTC — Admin</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3 text-sm" aria-label="Navigation admin">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:opacity-90 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bouton burger mobile */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="container mx-auto px-4 py-3 flex flex-col gap-1 border-t border-white/20">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2.5 px-3 rounded-lg hover:bg-white/10 text-sm font-medium"
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
