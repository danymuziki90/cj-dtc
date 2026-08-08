'use client'

import { usePathname } from 'next/navigation'
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

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isAdmin = pathname.includes('/admin')
  const isHome = isHomePage(pathname)

  return (
    <>
      {!isAdmin && <Header />}
      {/* 
        Home page: no top padding so Hero slides under transparent header.
        Internal pages: pt-[70px] lg:pt-[105px] so content stays below the solid blue header.
      */}
      <main className={isHome ? '' : 'pt-[70px] lg:pt-[105px]'}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}
