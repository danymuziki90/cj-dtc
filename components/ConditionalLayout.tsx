'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

/**
 * Detect if the current route has a UnifiedHero at the very top.
 * For these pages, we do NOT apply the global top padding, so the Hero can slide up underneath the transparent header.
 */
function isHeroPage(pathname: string): boolean {
  // Matches root home or specific main sections that start with a UnifiedHero
  const regex = /^\/(fr|en)(\/(about|formations|sessions|entreprises|actualites|emplois|contact|galerie|partenaires|espace-etudiants))?\/?$/
  return regex.test(pathname)
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isAdmin = pathname.includes('/admin')
  const hasHero = isHeroPage(pathname)

  return (
    <>
      {!isAdmin && <Header />}
      {/* 
        Le Header global possède désormais un fond solide et indépendant.
        Toutes les pages publiques doivent conserver ce padding supérieur
        pour éviter que le contenu ne glisse sous la barre de navigation.
      */}
      <main className="pt-[70px] lg:pt-[105px]">{children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}
