'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname() ?? ''
  const isEn = pathname.startsWith('/en')
  const label = isEn ? 'Back to top' : 'Retour en haut'

  useEffect(() => {
    const toggleVisibility = () => {
      // Le bouton devient visible dès que l'utilisateur défile vers le bas (> 300px)
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    toggleVisibility()

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const handleScrollToTop = () => {
    // Respecter la préférence de réduction de mouvement de l'utilisateur
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label={label}
      title={label}
      className={`fixed z-40 right-4 sm:right-8 bottom-20 sm:bottom-8 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0A4FB3] hover:bg-[#1565D8] text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A4FB3] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:transform-none ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
    </button>
  )
}
