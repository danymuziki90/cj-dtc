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

const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/api/auth/login', '/api/auth/register', '/api/auth/verify']

const localeMiddleware = (request: NextRequest) => {
  if (request.nextUrl.pathname === '/') return NextResponse.redirect(new URL('/fr', request.url))
  return null
}

const canonicalAdminRouteMap: Record<string, string> = {
  '/admin': '/admin/dashboard',
  '/admin/dashboard': '/admin/dashboard',
  '/admin/inscriptions': '/admin/inscriptions',
  '/admin/students': '/admin/students',
  '/admin/students-management': '/admin/students-management',
  '/admin/formations': '/admin/formations',
  '/admin/courses-management': '/admin/courses-management',
  '/admin/exams-management': '/admin/exams-management',
  '/admin/certificates': '/admin/certificates',
  '/admin/reports': '/admin/reports',
  '/admin/settings': '/admin/settings',
  '/admin/assignments': '/admin/assignments',
  '/admin/b2b': '/admin/b2b',
  '/admin/contacts': '/admin/contacts',
  '/admin/faq': '/admin/faq',
  '/admin/testimonials': '/admin/testimonials',
}

function resolveLocalizedAdminRedirect(pathname: string) {
  const match = pathname.match(/^\/(fr|en)(\/admin(?:\/.*)?$)/)
  if (!match) return null
  return canonicalAdminRouteMap[match[2]] || '/admin/dashboard'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const localeRedirect = localeMiddleware(request)
  if (localeRedirect) return localeRedirect

  const localizedAdminRedirectPath = resolveLocalizedAdminRedirect(pathname)
  if (localizedAdminRedirectPath) {
    const url = request.nextUrl.clone()
    url.pathname = localizedAdminRedirectPath
    return NextResponse.redirect(url, 308)
  }

  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/fr${pathname}`
    return NextResponse.redirect(url)
  }

  const isAdminPortalPage = pathname.startsWith('/admin')
  const isAdminPortalApi = pathname.startsWith('/api/admin')
  const isAdminPortalPublicRoute = pathname === '/admin/login' || pathname === '/api/admin/auth/login' || pathname === '/api/admin/auth/logout'
  if ((isAdminPortalPage || isAdminPortalApi) && !isAdminPortalPublicRoute) {
    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null
    const legacyAdminToken = adminPayload ? null : await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const isLegacyAdminAuthenticated = isEmergencyAdminLoginAllowed() && legacyAdminToken?.role === 'ADMIN'
    if (!adminPayload && !isLegacyAdminAuthenticated) {
      if (isAdminPortalApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const isStudentPortalPage = pathname.startsWith('/student')
  const isStudentPortalApi = pathname.startsWith('/api/student/system')
  const isStudentPortalPublicRoute = ['/student/login', '/student/register', '/student/forgot-password', '/student/reset-password', '/api/student/auth/login', '/api/student/auth/logout', '/api/student/auth/register', '/api/student/auth/forgot-password', '/api/student/auth/reset-password'].includes(pathname)
  const isStudentAuthPage = pathname === '/student/login' || pathname === '/student/register'
  if (isStudentPortalPage || isStudentPortalApi) {
    const studentToken = request.cookies.get(STUDENT_AUTH_COOKIE)?.value
    const studentPayload = studentToken ? await verifyStudentToken(studentToken) : null
    if (studentPayload && isStudentAuthPage) return NextResponse.redirect(new URL('/student/dashboard', request.url))
    if (!studentPayload && !isStudentPortalPublicRoute) {
      if (isStudentPortalApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const loginUrl = new URL('/student/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  const isLocalizedStudentSpaceRoute = /^\/(fr|en)\/espace-etudiants(\/|$)/.test(pathname) || pathname.startsWith('/espace-etudiants')
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

  const isLegacyAdminRoute = /^\/(fr|en)\/admin(\/|$)/.test(pathname)
  const isLegacyStudentRoute = /^\/(fr|en)\/student(\/|$)/.test(pathname) || (pathname.includes('/dashboard') && !pathname.startsWith('/admin') && !pathname.startsWith('/student') && !isLocalizedStudentSpaceRoute)
  if (!isLegacyAdminRoute && !isLegacyStudentRoute) return NextResponse.next()

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route) || pathname === `/fr${route}`)
  if (isPublic) return NextResponse.next()

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const loginUrl = new URL('/fr/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  const userRole = token.role as string
  if (isLegacyAdminRoute && userRole !== 'ADMIN') return NextResponse.redirect(new URL('/403', request.url))
  if (isLegacyStudentRoute && userRole !== 'STUDENT' && userRole !== 'ADMIN') return NextResponse.redirect(new URL('/fr/auth/login', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/api/admin/:path*', '/student/:path*', '/api/student/system/:path*', '/espace-etudiants/:path*', '/fr/admin/:path*', '/en/admin/:path*', '/fr/student/:path*', '/fr/espace-etudiants/:path*', '/auth/:path*', '/(fr|en)/:path*'],
}
