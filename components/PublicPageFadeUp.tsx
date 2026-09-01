'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * PublicPageFadeUp
 * ─────────────────
 * Applique une animation Fade-In (entrée) et Fade-Out (sortie) au défilement (scroll)
 * à chaque <section>, <article>, .cj-hero-card, .cj-cta-banner ou [data-fade-up-target]
 * sur toutes les pages et sous-pages publiques.
 *
 * Stratégie :
 * • Un IntersectionObserver observe continuellement les éléments :
 *   - Entrée dans le viewport → data-fade-up="visible" (opacité 1, translateY 0)
 *   - Sortie du viewport → data-fade-up="pending" (opacité 0, translateY 24px)
 * • MutationObserver pour capter dynamiquement le contenu hydraté.
 * • prefers-reduced-motion est respecté (aucune animation si activé).
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

    // Ensemble des éléments déjà observés
    const observed = new Set<Element>()

    const SELECTOR = 'section, article, .cj-hero-card, .cj-cta-banner, [data-fade-up-target]'

    /**
     * Filtre un élément pour l'animation :
     * – Pas dans le header, le footer, la nav
     * – Pas marqué [data-no-fade-up]
     * – Pas la section hero pleine hauteur principale
     */
    function isAnimatable(el: Element): el is HTMLElement {
      if (observed.has(el)) return false
      if (el.matches('[data-no-fade-up]')) return false
      if (el.closest('header, footer, nav, [data-no-fade-up]')) return false
      if (el.matches('.hero-bg-unified') || el.closest('.hero-bg-unified')) return false
      return true
    }

    // ── IntersectionObserver : déclenche le fade-in et fade-out au scroll ─────
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) {
            el.setAttribute('data-fade-up', 'visible')
          } else {
            // Fade out quand l'élément quitte l'écran
            el.setAttribute('data-fade-up', 'pending')
          }
        })
      },
      {
        rootMargin: '0px 0px -4% 0px',
        threshold: 0.05,
      }
    )

    /**
     * Enregistre un élément pour l'animation.
     */
    function registerElement(el: HTMLElement) {
      if (!isAnimatable(el)) return
      observed.add(el)

      // Si l'élément est déjà visible dans le viewport au chargement, on l'affiche directement
      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0

      if (inView) {
        el.setAttribute('data-fade-up', 'visible')
      } else {
        el.setAttribute('data-fade-up', 'pending')
      }

      io.observe(el)
    }

    /**
     * Scanne le container et enregistre tous les éléments ciblés.
     */
    function scanAndRegister() {
      const elements = Array.from(container.querySelectorAll<HTMLElement>(SELECTOR))
      elements.forEach(registerElement)
    }

    // Premier scan
    scanAndRegister()

    // ── MutationObserver : capture les nœuds ajoutés après hydratation ────
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

