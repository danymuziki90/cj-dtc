
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
  '/api/auth/verify'
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

const legacyStudentRouteMap: Record<string, string> = {
  '/espace-etudiants': '/student/dashboard',
  '/espace-etudiants/calendrier': '/student/mes-sessions',
  '/espace-etudiants/elearning': '/student/mes-sessions',
  '/espace-etudiants/inscription': '/student/mes-sessions',
  '/espace-etudiants/mes-formations': '/student/mes-sessions',
  '/espace-etudiants/supports': '/student/ressources',
  '/espace-etudiants/resultats': '/student/resultats',
  '/espace-etudiants/mes-certificats': '/student/certificats',
  '/espace-etudiants/mon-compte': '/student/profile',
  '/espace-etudiants/travaux': '/student/submissions',
  '/student': '/student/dashboard',
  '/student/dashboard': '/student/dashboard',
  '/student/profile': '/student/profile',
  '/student/assignments': '/student/submissions',
  '/student/certificates': '/student/certificats',
  '/student/elearning': '/student/mes-sessions',
  '/student/exams': '/student/resultats',
  '/student/inscription': '/student/mes-sessions',
  '/student/inscription/success': '/student/dashboard',
}

function resolveLegacyAdminRedirect(pathname: string) {
  const match = pathname.match(/^\/(fr|en)(\/admin(?:\/.*)?$)/)
  if (!match) return null

  const legacyPath = match[2]
  return legacyAdminRouteMap[legacyPath] || '/admin/dashboard'
}

function resolveLegacyStudentRedirect(pathname: string) {
  const localizedMatch = pathname.match(/^\/(fr|en)(\/(?:espace-etudiants|student)(?:\/.*)?$)/)
  const legacyPath = localizedMatch ? localizedMatch[2] : pathname

  if (!legacyPath.startsWith('/espace-etudiants') && !legacyPath.startsWith('/student')) return null
  return legacyStudentRouteMap[legacyPath] || '/student/dashboard'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const localeRedirect = localeMiddleware(request)
  if (localeRedirect) return localeRedirect

  const legacyAdminRedirectPath = resolveLegacyAdminRedirect(pathname)
  if (legacyAdminRedirectPath) {
    const url = request.nextUrl.clone()
    url.pathname = legacyAdminRedirectPath
    return NextResponse.redirect(url)
  }

  const legacyStudentRedirectPath = resolveLegacyStudentRedirect(pathname)
  if (legacyStudentRedirectPath) {
    const url = request.nextUrl.clone()
    url.pathname = legacyStudentRedirectPath
    return NextResponse.redirect(url)
  }

  // Normalize only /auth paths for localized legacy auth pages.
  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/fr${pathname}`
    return NextResponse.redirect(url)
  }

  // New admin portal JWT protection
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
      : await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        })
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

  // New student portal JWT protection
  const isStudentPortalPage = pathname.startsWith('/student')
  const isStudentPortalApi = pathname.startsWith('/api/student/system')
  const isStudentPortalPublicRoute =
    pathname === '/student/login' ||
    pathname === '/student/forgot-password' ||
    pathname === '/student/reset-password' ||
    pathname === '/api/student/auth/login' ||
    pathname === '/api/student/auth/logout' ||
    pathname === '/api/student/auth/forgot-password' ||
    pathname === '/api/student/auth/reset-password'

  if ((isStudentPortalPage || isStudentPortalApi) && !isStudentPortalPublicRoute) {
    const studentToken = request.cookies.get(STUDENT_AUTH_COOKIE)?.value
    const studentPayload = studentToken ? await verifyStudentToken(studentToken) : null

    if (!studentPayload) {
      if (isStudentPortalApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const loginUrl = new URL('/student/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Legacy protected localized areas (existing project behavior).
  const isLegacyAdminRoute = /^\/(fr|en)\/admin(\/|$)/.test(pathname)
  const isStudentHomeRoute = /^\/(fr|en)\/espace-etudiants\/?$/.test(pathname)
  const isLegacyStudentRoute =
    (pathname.includes('/espace-etudiants') && !isStudentHomeRoute) ||
    /^\/(fr|en)\/student(\/|$)/.test(pathname) ||
    (pathname.includes('/dashboard') && !pathname.startsWith('/admin') && !pathname.startsWith('/student'))

  if (!isLegacyAdminRoute && !isLegacyStudentRoute) {
    return NextResponse.next()
  }

  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === `/fr${route}`)
  if (isPublic) return NextResponse.next()

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

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
    '/(fr|en)/:path*'
  ]
}
