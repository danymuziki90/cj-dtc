import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import {
  ADMIN_AUTH_COOKIE,
  STUDENT_AUTH_COOKIE,
  verifyAdminToken,
  verifyStudentToken,
} from '@/lib/auth-portal/jwt'
import { isEmergencyAdminLoginAllowed } from '@/lib/auth-portal/security'

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
]

const localeMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr', request.url))
  }
  return null
}

const legacyAdminRouteMap: Record<string, string> = {
  '/admin': '/admin/dashboard',
  '/admin/dashboard': '/admin/dashboard',
  '/admin/inscriptions': '/admin/enrollments',
  '/admin/students': '/admin/students',
  '/admin/students-management': '/admin/students',
  '/admin/formations': '/admin/formations',
  '/admin/courses-management': '/admin/formations',
  '/admin/exams-management': '/admin/evaluations',
  '/admin/assignments': '/admin/submissions',
  '/admin/submissions': '/admin/submissions',
  '/admin/certificates': '/admin/certificates',
  '/admin/reports': '/admin/analytics',
  '/admin/settings': '/admin/settings',
}

function resolveLegacyAdminRedirect(pathname: string) {
  const match = pathname.match(/^\/(fr|en)(\/admin(?:\/.*)?$)/)
  if (!match) return null
  const legacyPath = match[2]

  // Bypass legacy redirect for canonical localized pages
  const localizedBypassRoutes = [
    '/admin/testimonials',
    '/admin/submissions',
  ]
  if (
    localizedBypassRoutes.some(
      (route) => legacyPath === route || legacyPath.startsWith(route + '/')
    )
  ) {
    return null
  }

  return legacyAdminRouteMap[legacyPath] || '/admin/dashboard'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect bare / to /fr
  const localeRedirect = localeMiddleware(request)
  if (localeRedirect) return localeRedirect

  // Legacy localized admin redirects (e.g. /fr/admin/inscriptions → /admin/enrollments)
  const legacyAdminRedirectPath = resolveLegacyAdminRedirect(pathname)
  if (legacyAdminRedirectPath) {
    const url = request.nextUrl.clone()
    url.pathname = legacyAdminRedirectPath
    return NextResponse.redirect(url)
  }

  // Normalize /auth/* → /fr/auth/*
  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/fr${pathname}`
    return NextResponse.redirect(url)
  }

  // ─── Admin portal JWT protection ───────────────────────────────────────────
  const isAdminPortalPage = pathname.startsWith('/admin')
  const isAdminPortalApi = pathname.startsWith('/api/admin')
  const isAdminPortalPublicRoute =
    pathname === '/admin/login' ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout'

  if ((isAdminPortalPage || isAdminPortalApi) && !isAdminPortalPublicRoute) {
    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null
    const legacyAdminToken = adminPayload
      ? null
      : await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const isLegacyAdminAuthenticated =
      isEmergencyAdminLoginAllowed() && legacyAdminToken?.role === 'ADMIN'

    if (!adminPayload && !isLegacyAdminAuthenticated) {
      if (isAdminPortalApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ─── Student portal JWT protection ────────────────────────────────────────
  const isStudentPortalPage = pathname.startsWith('/student')
  const isStudentPortalApi = pathname.startsWith('/api/student/system')

  // Public routes — no token required
  const isStudentPortalPublicRoute =
    pathname === '/student/login' ||
    pathname === '/student/register' ||
    pathname === '/student/forgot-password' ||
    pathname === '/student/reset-password' ||
    pathname === '/api/student/auth/login' ||
    pathname === '/api/student/auth/logout' ||
    pathname === '/api/student/auth/register' ||
    pathname === '/api/student/auth/forgot-password' ||
    pathname === '/api/student/auth/reset-password'

  // Auth pages — redirect to dashboard if already logged in
  const isStudentAuthPage =
    pathname === '/student/login' || pathname === '/student/register'

  if (isStudentPortalPage || isStudentPortalApi) {
    const studentToken = request.cookies.get(STUDENT_AUTH_COOKIE)?.value
    const studentPayload = studentToken ? await verifyStudentToken(studentToken) : null

    // Already authenticated → skip login/register
    if (studentPayload && isStudentAuthPage) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }

    // Protected route without valid token → login
    if (!studentPayload && !isStudentPortalPublicRoute) {
      if (isStudentPortalApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/student/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // ─── Legacy localized espace-etudiants protection ─────────────────────────
  const isLocalizedStudentSpaceRoute = /^\/(fr|en)\/espace-etudiants(\/|$)/.test(pathname)

  if (isLocalizedStudentSpaceRoute) {
    const studentToken = request.cookies.get(STUDENT_AUTH_COOKIE)?.value
    const studentPayload = studentToken ? await verifyStudentToken(studentToken) : null

    if (!studentPayload) {
      const locale = pathname.startsWith('/en/') ? 'en' : 'fr'
      const loginUrl = new URL(`/${locale}/auth/student-login`, request.url)
      loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ─── Legacy localized admin/student routes (NextAuth) ─────────────────────
  const isLegacyAdminRoute = /^\/(fr|en)\/admin(\/|$)/.test(pathname)
  const isLegacyStudentRoute =
    /^\/(fr|en)\/student(\/|$)/.test(pathname) ||
    (pathname.includes('/dashboard') &&
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/student') &&
      !isLocalizedStudentSpaceRoute)

  if (!isLegacyAdminRoute && !isLegacyStudentRoute) {
    return NextResponse.next()
  }

  const isPublic = publicRoutes.some(
    (route) => pathname.startsWith(route) || pathname === `/fr${route}`
  )
  if (isPublic) return NextResponse.next()

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const loginUrl = new URL('/fr/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const userRole = token.role as string

  if (isLegacyAdminRoute && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  if (isLegacyStudentRoute && userRole !== 'STUDENT' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/fr/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/api/admin/:path*',
    '/student/:path*',
    '/api/student/system/:path*',
    '/espace-etudiants/:path*',
    '/fr/admin/:path*',
    '/fr/student/:path*',
    '/fr/espace-etudiants/:path*',
    '/auth/:path*',
    '/(fr|en)/:path*',
  ],
}
