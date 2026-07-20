import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Edge Middleware — Route Protection
 *
 * Protège les routes admin et espace étudiant en vérifiant
 * la présence des cookies JWT avant tout rendu de page.
 *
 * Cela élimine le "flash of content" visible lorsque la
 * vérification était uniquement côté API (après le chargement).
 */

const ADMIN_COOKIE = 'admin_token'
const STUDENT_COOKIE = 'student_token'

// Routes admin publiques (pas de redirection)
const ADMIN_PUBLIC_PATHS = [
  '/admin/login',
]

// Segments de routes étudiant publiques (inscription, connexion, vérification)
const STUDENT_PUBLIC_SEGMENTS = [
  '/inscription',
  '/connexion',
  '/confirm-inscription',
  '/verification',
  '/auth',
]

function isAdminPublicPath(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some(p => pathname === p || pathname === p + '/')
}

function isStudentPublicPath(pathname: string): boolean {
  return STUDENT_PUBLIC_SEGMENTS.some(segment => pathname.includes(segment))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Protection des routes Admin ───────────────────────────────────────────
  const isAdminRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/fr/admin') ||
    pathname.startsWith('/en/admin')

  if (isAdminRoute && !isAdminPublicPath(pathname)) {
    const adminToken = request.cookies.get(ADMIN_COOKIE)
    if (!adminToken?.value) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Protection des routes Espace Étudiant ─────────────────────────────────
  const isStudentRoute =
    pathname.includes('/espace-etudiants') ||
    pathname.includes('/student/')

  if (isStudentRoute && !isStudentPublicPath(pathname)) {
    const studentToken = request.cookies.get(STUDENT_COOKIE)
    if (!studentToken?.value) {
      // Détecter la locale depuis l'URL
      const locale = pathname.startsWith('/en') ? 'en' : 'fr'
      const loginUrl = new URL(`/${locale}/espace-etudiants/inscription`, request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Matcher sur les routes admin et espace étudiant.
     * Exclut explicitement : _next/static, _next/image, favicon, api
     */
    '/admin/:path*',
    '/:locale/admin/:path*',
    '/:locale/espace-etudiants/:path*',
    '/student/:path*',
    '/:locale/student/:path*',
  ],
}
