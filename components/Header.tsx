"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="header sticky top-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/fr" className="flex items-center gap-3">
          <Image src="/logo.png" alt="CJ DEVELOPMENT TRAINING CENTER" width={48} height={48} className="h-12 w-auto" />
        </Link>

        {/* Desktop nav - identical markup server/client */}
        <nav className="hidden md:flex gap-6 items-center" aria-label="primary navigation">
          <Link href="/fr" className="text-sm text-gray-700 hover:text-[var(--cj-blue)] transition-colors duration-200">Accueil</Link>
          <Link href="/fr/about" className="text-sm text-gray-700 hover:text-[var(--cj-blue)] transition-colors duration-200">À propos</Link>
          <Link href="/fr/formations" className="text-sm text-gray-700 hover:text-[var(--cj-blue)] transition-colors duration-200">Formations</Link>
          <Link href="/fr/programmes" className="text-sm text-gray-700 hover:text-[var(--cj-blue)] transition-colors duration-200">Programmes</Link>
          <Link href="/fr/espace-etudiants" className="text-sm text-gray-700 hover:text-[var(--cj-blue)] transition-colors duration-200">Espace Étudiants</Link>
          <Link href="/fr/actualites" className="text-sm text-gray-700 hover:text-[var(--cj-blue)] transition-colors duration-200">Actualités</Link>
          <Link href="/fr/contact" className="btn-primary">Contact</Link>
        </nav>

        {/* Bouton burger mobile */}
        <div className="md:hidden">
          <button
            type="button"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--cj-blue)]"
          >
            {open ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-96' : 'max-h-0'}`}
        aria-hidden={!open}
      >
        <nav className="px-4 pb-4 flex flex-col gap-1 border-t border-gray-200 bg-white/95">
          <Link href="/fr" className="py-2 text-sm text-gray-700 hover:text-[var(--cj-blue)]" onClick={() => setOpen(false)}>Accueil</Link>
          <Link href="/fr/about" className="py-2 text-sm text-gray-700 hover:text-[var(--cj-blue)]" onClick={() => setOpen(false)}>À propos</Link>
          <Link href="/fr/formations" className="py-2 text-sm text-gray-700 hover:text-[var(--cj-blue)]" onClick={() => setOpen(false)}>Formations</Link>
          <Link href="/fr/programmes" className="py-2 text-sm text-gray-700 hover:text-[var(--cj-blue)]" onClick={() => setOpen(false)}>Programmes</Link>
          <Link href="/fr/espace-etudiants" className="py-2 text-sm text-gray-700 hover:text-[var(--cj-blue)]" onClick={() => setOpen(false)}>Espace Étudiants</Link>
          <Link href="/fr/actualites" className="py-2 text-sm text-gray-700 hover:text-[var(--cj-blue)]" onClick={() => setOpen(false)}>Actualités</Link>
          <Link href="/fr/contact" className="py-2 inline-block btn-primary" onClick={() => setOpen(false)}>Contact</Link>
        </nav>
      </div>
    </header>
  )
}
