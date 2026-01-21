"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

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

        {/* Mobile menu button - deterministic initial markup */}
        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--cj-blue)]"
          >
            <span className="text-xl">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav - rendered server and client with same initial closed state */}
      <div className={`md:hidden transition-max-height duration-300 overflow-hidden ${open ? 'max-h-96' : 'max-h-0'}`} aria-hidden={!open}>
        <nav className="px-4 pb-4 flex flex-col gap-3">
          <Link href="/fr" className="text-sm text-gray-700 hover:text-[var(--cj-blue)]">Accueil</Link>
          <Link href="/fr/about" className="text-sm text-gray-700 hover:text-[var(--cj-blue)]">À propos</Link>
          <Link href="/fr/formations" className="text-sm text-gray-700 hover:text-[var(--cj-blue)]">Formations</Link>
          <Link href="/fr/programmes" className="text-sm text-gray-700 hover:text-[var(--cj-blue)]">Programmes</Link>
          <Link href="/fr/espace-etudiants" className="text-sm text-gray-700 hover:text-[var(--cj-blue)]">Espace Étudiants</Link>
          <Link href="/fr/actualites" className="text-sm text-gray-700 hover:text-[var(--cj-blue)]">Actualités</Link>
          <Link href="/fr/contact" className="inline-block btn-primary">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
