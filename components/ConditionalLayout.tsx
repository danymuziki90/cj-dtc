'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

/**
 * Detect if the current route is the locale homepage (e.g. /fr, /en)
 * where the Hero section renders edge-to-edge behind the transparent navbar.
 */
function isHomepage(pathname: string): boolean {
  return /^\/(fr|en)\/?$/.test(pathname)
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isAdmin = pathname.includes('/admin')
  const isHome = isHomepage(pathname)

  return (
    <>
      {!isAdmin && <Header />}
      {/* Homepage: no top padding — Hero sits under the transparent fixed navbar.
          Other pages: lg:pt-[72px] compensates for the fixed header height. */}
      <main className={isHome ? '' : 'lg:pt-[72px]'}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}
