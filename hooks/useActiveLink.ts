'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

/**
 * Helper to normalize paths:
 * - Strips any hash fragment.
 * - Removes language prefixes (e.g., /fr or /en).
 * - Standardizes slashes and removes trailing slashes (except for root).
 */
function normalizePath(p: string): string {
  // Strip hash fragment
  let path = p.split('#')[0] || '/'
  
  // Remove locale prefix (e.g. /fr/about -> /about, /fr -> /)
  path = path.replace(/^\/(fr|en)(\/|$)/, '/')
  
  // Remove trailing slash except for root
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1)
  }
  
  return path || '/'
}

/**
 * Returns true when the given href matches the current active pathname.
 *
 * Matching rules:
 * - Root link ('/' or '/fr') is only active on exact root match.
 * - 'espace-etudiants' matches if the pathname starts with '/espace-etudiants', '/student', or student auth routes.
 * - 'actualites' matches if the pathname starts with '/actualites' or '/blog'.
 * - 'about' matches if the pathname starts with '/about', '/a-propos', or '/public/a-propos'.
 * - Formations vs Sessions:
 *   - If the link has a hash (like '#sessions'), it is active only when the current page is '/formations' and the URL hash is '#sessions'.
 *   - If the link has no hash (like '/formations'), it is active when the page is '/formations' (and subpages) and the URL hash is NOT '#sessions'.
 * - General prefix match for other routes.
 */
export function useActiveLink(href: string): boolean {
  const pathname = usePathname() ?? '/'
  const searchParams = useSearchParams()
  const [currentHash, setCurrentHash] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash)

      const handleHashChange = () => {
        setCurrentHash(window.location.hash)
      }
      
      window.addEventListener('hashchange', handleHashChange)
      return () => {
        window.removeEventListener('hashchange', handleHashChange)
      }
    }
  }, [pathname, searchParams])

  const normPathname = normalizePath(pathname)
  const normHref = normalizePath(href)

  // 1. Root matching: exact only
  if (normHref === '/') {
    return normPathname === '/'
  }

  // 2. Custom route mappings

  // A. Espace Etudiants (links to /espace-etudiants)
  if (normHref === '/espace-etudiants') {
    return (
      normPathname === '/espace-etudiants' ||
      normPathname.startsWith('/espace-etudiants/') ||
      normPathname === '/student' ||
      normPathname.startsWith('/student/') ||
      normPathname === '/auth/student-login' ||
      normPathname.startsWith('/auth/student-login/') ||
      normPathname === '/auth/login' ||
      normPathname.startsWith('/auth/login/')
    )
  }

  // B. Actualités / Blog (links to /actualites)
  if (normHref === '/actualites') {
    return (
      normPathname === '/actualites' ||
      normPathname.startsWith('/actualites/') ||
      normPathname === '/blog' ||
      normPathname.startsWith('/blog/')
    )
  }

  // C. About / À propos (links to /about)
  if (normHref === '/about') {
    return (
      normPathname === '/about' ||
      normPathname.startsWith('/about/') ||
      normPathname === '/a-propos' ||
      normPathname.startsWith('/a-propos/') ||
      normPathname === '/public/a-propos' ||
      normPathname.startsWith('/public/a-propos/')
    )
  }

  // D. Formations vs Sessions
  if (normHref === '/formations') {
    const isFormationsPath = normPathname === '/formations' || normPathname.startsWith('/formations/')
    if (!isFormationsPath) return false

    // Check if the checked link is specifically the '#sessions' anchor link
    const targetHasSessionsHash = href.includes('#sessions')
    const currentHasSessionsHash = currentHash === '#sessions'

    if (targetHasSessionsHash) {
      return currentHasSessionsHash
    } else {
      // Normal formations link is active ONLY if we are NOT on the sessions section
      return !currentHasSessionsHash
    }
  }

  // 3. Default matching: exact or prefix match
  return normPathname === normHref || normPathname.startsWith(normHref + '/')
}

