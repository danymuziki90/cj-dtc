'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * PublicPageFadeUp
 * ─────────────────
 * Applique une animation Fade-Up (opacity 0 → 1, translateY 30px → 0)
 * à chaque <section>, <article> ou [data-fade-up-target] visible dans
 * les pages publiques, au fur et à mesure du scroll.
 *
 * Stratégie :
 * • On utilise un MutationObserver pour détecter l'apparition tardive
 *   des nœuds DOM (hydratation SSR, chargements asynchrones).
 * • Un IntersectionObserver déclenche l'animation une seule fois par
 *   élément lorsqu'il entre dans le viewport.
 * • Les éléments déjà dans le viewport au chargement initial sont
 *   animés immédiatement (délai court) sans attendre le scroll.
 * • prefers-reduced-motion est respecté (pas d'animation si activé).
 */
export default function PublicPageFadeUp({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname() ?? ''

  useEffect(() => {
    // Pages exclues de l'animation globale
    if (
      pathname.includes('/admin') ||
      pathname.includes('/student') ||
      pathname.includes('/espace-etudiants')
    ) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const container = containerRef.current
    if (!container) return

    // Ensemble des éléments déjà observés (évite les doublons)
    const observed = new Set<Element>()

    const SELECTOR = 'section, article, [data-fade-up-target]'

    /**
     * Filtre un élément pour l'animation :
     * – Pas dans le hero, le header, le footer, la nav
     * – Pas marqué [data-no-fade-up]
     * – Pas déjà observé
     */
    function isAnimatable(el: Element): el is HTMLElement {
      if (observed.has(el)) return false
      if (el.matches('[data-no-fade-up]')) return false
      if (el.closest('header, footer, nav, [data-no-fade-up]')) return false
      if (el.matches('.hero-bg-unified')) return false
      return true
    }

    // ── IntersectionObserver : déclenche le fade-up au scroll ─────────────
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.setAttribute('data-fade-up', 'visible')
          io.unobserve(el)
        })
      },
      // rootMargin légèrement négatif pour éviter un déclenchement
      // sur les éléments partiellement hors-écran en bas
      { rootMargin: '0px 0px -5% 0px', threshold: 0.05 }
    )

    let staggerIndex = 0

    /**
     * Enregistre un élément pour l'animation.
     * Les éléments déjà dans le viewport reçoivent un délai court (≤160ms)
     * pour que l'animation soit visible dès le chargement.
     */
    function registerElement(el: HTMLElement) {
      if (!isAnimatable(el)) return
      observed.add(el)

      const delay = (staggerIndex % 6) * 80
      staggerIndex++

      el.style.setProperty('--fade-up-delay', `${delay}ms`)
      el.setAttribute('data-fade-up', 'pending')
      io.observe(el)
    }

    /**
     * Scanne le container et enregistre tous les éléments
     * correspondant au sélecteur.
     */
    function scanAndRegister() {
      const elements = Array.from(container.querySelectorAll<HTMLElement>(SELECTOR))
      elements.forEach(registerElement)
    }

    // Premier scan : tente de capturer le DOM déjà disponible
    scanAndRegister()

    // ── MutationObserver : capture les nœuds ajoutés après hydratation ────
    // Nécessaire car les Server Components / Client Components chargés
    // dynamiquement peuvent injecter leurs sections APRÈS le premier useEffect.
    const mo = new MutationObserver((mutations) => {
      let hasNewNodes = false
      for (const m of mutations) {
        if (m.addedNodes.length) {
          hasNewNodes = true
          break
        }
      }
      if (!hasNewNodes) return
      scanAndRegister()
    })

    mo.observe(container, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return <div ref={containerRef}>{children}</div>
}
