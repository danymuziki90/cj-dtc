'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from './Header'
import Footer from './Footer'

/**
 * Detect if the current route is strictly the Home Page.
 * For the Home Page, we do NOT apply the global top padding, so the Hero can slide up underneath the transparent header.
 * For all other internal pages, we apply the top padding so the solid blue header sits independently above the content.
 */
function isHomePage(pathname: string): boolean {
  // Matches strictly root /fr, /en, or /
  return /^\/(fr|en)\/?$/.test(pathname) || pathname === '/' || pathname === ''
}

const pageFadeUpVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1], // cubic-bezier for smooth deceleration
    },
  },
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isAdmin = pathname.includes('/admin')
  const isEspaceEtudiant = pathname.includes('/espace-etudiants')

  return (
    <>
      {!isAdmin && <Header />}
      {/* 
        Positionnement propre sous la navbar fixe :
        - Mobile & tablette : pt-[70px] (hauteur de la navbar mobile)
        - Desktop : lg:pt-[108px] (hauteur de la top-bar + main-bar desktop)
        Ainsi, toutes les Hero Sections commencent exactement sous la navbar sans masquer le haut des images.
      */}
      <main className={isAdmin ? '' : 'pt-[70px] lg:pt-[108px]'}>
        {isAdmin || isEspaceEtudiant ? (
          children
        ) : (
          <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            variants={pageFadeUpVariants}
            className="w-full flex-1"
          >
            {children}
          </motion.div>
        )}
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}
