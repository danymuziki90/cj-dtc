'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, useRef, useEffect, useState } from 'react'

/**
 * PageTransition
 * ──────────────
 * Enveloppe le contenu de chaque page publique et déclenche une animation
 * fade + slide-up (classe .page-transition-enter) à chaque changement de route.
 *
 * Stratégie :
 * - On écoute usePathname() pour détecter les navigations.
 * - À chaque changement, on retire puis remet la classe CSS pour forcer
 *   la re-lecture de l'animation par le navigateur (animation restart trick).
 * - Les routes admin et espace-étudiants sont exclues.
 * - prefers-reduced-motion est respecté via la règle CSS.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const ref = useRef<HTMLDivElement>(null)
  const [animKey, setAnimKey] = useState(0)

  // Exclure les routes protégées
  const isExcluded =
    pathname.includes('/admin') || pathname.includes('/espace-etudiants')

  useEffect(() => {
    if (isExcluded) return
    // Incrémenter la clé force le remontage du div → relance l'animation
    setAnimKey((k) => k + 1)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isExcluded) {
    return <>{children}</>
  }

  return (
    <div
      key={animKey}
      ref={ref}
      className="page-transition-enter w-full"
    >
      {children}
    </div>
  )
}
