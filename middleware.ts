
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import {
  ADMIN_AUTH_COOKIE,
  STUDENT_AUTH_COOKIE,
  verifyAdminToken,
  verifyStudentToken,
} from '@/lib/auth-portal/jwt'

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const localeRedirect = localeMiddleware(request)
  if (localeRedirect) return localeRedirect

  // Normalize only /auth paths for localized legacy auth pages.
  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/fr${pathname}`
    return NextResponse.redirect(url)
  }

  if (pathname === '/espace-etudiants' || pathname.startsWith('/espace-etudiants/')) {
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
    const isLegacyAdminAuthenticated = legacyAdminToken?.role === 'ADMIN'

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
  const isStudentPortalPublicRoute = pathname === '/student/login' || pathname === '/api/student/auth/login' || pathname === '/api/student/auth/logout'

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
