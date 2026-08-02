import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ADMIN_AUTH_COOKIE,
  STUDENT_AUTH_COOKIE,
  verifyAdminToken,
  verifyStudentToken,
} from '@/lib/auth-portal/jwt'
import { isEmergencyAdminLoginAllowed } from '@/lib/auth-portal/security'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Static files & Next.js internals → pass through immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(.+)$/)
  ) {
    return NextResponse.next()
  }

  // ── 2. Public API routes → pass through
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin') && !pathname.startsWith('/api/student/system')) {
    return NextResponse.next()
  }

  // ── 3. Admin API protection
  if (pathname.startsWith('/api/admin')) {
    if (pathname.startsWith('/api/admin/auth/')) return NextResponse.next()

    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null
    if (adminPayload) return NextResponse.next()

    const legacyToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const isLegacyAdmin = isEmergencyAdminLoginAllowed() && legacyToken?.role === 'ADMIN'
    if (isLegacyAdmin) return NextResponse.next()

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 4. Admin UI protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null
    if (adminPayload) return NextResponse.next()

    const legacyToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const isLegacyAdmin = isEmergencyAdminLoginAllowed() && legacyToken?.role === 'ADMIN'
    if (isLegacyAdmin) return NextResponse.next()

    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 5. Student space protection (localized)
  if (
    /^\/(fr|en)\/espace-etudiants/.test(pathname) ||
    pathname.startsWith('/espace-etudiants')
  ) {
    const studentToken = request.cookies.get(STUDENT_AUTH_COOKIE)?.value
    const studentPayload = studentToken ? await verifyStudentToken(studentToken) : null
    if (!studentPayload) {
      const locale = pathname.startsWith('/en/') ? 'en' : 'fr'
      const loginUrl = new URL(`/${locale}/auth/student-login`, request.url)
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ── 6. Root → redirect to /fr
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr', request.url))
  }

  // ── 7. /auth/* → redirect to /fr/auth/*
  if (pathname === '/auth' || (pathname.startsWith('/auth/') && !pathname.startsWith('/(fr|en)'))) {
    return NextResponse.redirect(new URL(`/fr${pathname}`, request.url))
  }

  // ── 8. All other routes (including /fr/*, /en/*) → let Next.js handle
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)' ,
  ],
}

export default proxy
