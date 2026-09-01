'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export default function PublicPageFadeUp({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname() ?? ''

  useEffect(() => {
    // L'espace étudiant possède ses propres interactions et ne doit pas être
    // affecté indirectement par l'animation globale des pages publiques.
    if (pathname.includes('/admin') || pathname.includes('/student') || pathname.includes('/espace-etudiants')) return

    const container = containerRef.current
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('section, article, [data-fade-up-target]')
    ).filter((element) => {
      // Le hero, l'en-tête et le footer conservent leurs propres comportements.
      // Les autres sections et groupes marqués explicitement partagent cette animation.
      return !element.matches('.hero-bg-unified, [data-no-fade-up]')
        && !element.closest('header, footer, nav, [data-no-fade-up]')
    })

    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-fade-up', 'visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )

    sections.forEach((section, index) => {
      section.style.setProperty('--fade-up-delay', `${(index % 4) * 80}ms`)
      section.setAttribute('data-fade-up', 'pending')
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [pathname])

  return <div ref={containerRef}>{children}</div>
}
