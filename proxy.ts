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
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Static files & Next.js internals → pass through
  if (pathname.startsWith('/_next') || pathname.match(/\.(.+)$/)) {
    return NextResponse.next()
  }

  // ── 2. Public API routes → pass through
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/student/system')
  ) {
    return NextResponse.next()
  }

  // ── 2b. Student API routes — verify cookie, reject if invalid
  if (pathname.startsWith('/api/student/')) {
    // Auth endpoints are always public
    if (pathname.startsWith('/api/student/auth/')) return NextResponse.next()

    // For /api/student/system/* verify the student token
    if (pathname.startsWith('/api/student/system')) {
      const studentToken = request.cookies.get(STUDENT_AUTH_COOKIE)?.value
      if (!studentToken) {
        return NextResponse.json(
          { error: 'Session expirée. Veuillez vous reconnecter.', success: false },
          { status: 401 }
        )
      }
      const studentPayload = await verifyStudentToken(studentToken)
      if (!studentPayload) {
        return NextResponse.json(
          { error: 'Session expirée. Veuillez vous reconnecter.', success: false },
          { status: 401 }
        )
      }
      return NextResponse.next()
    }

    // All other /api/student/* routes pass through (guarded at route level)
    return NextResponse.next()
  }

  // ── 3. Admin API protection
  if (pathname.startsWith('/api/admin')) {
    if (pathname.startsWith('/api/admin/auth/')) return NextResponse.next()
    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null
    if (adminPayload) return NextResponse.next()
    const legacyToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (isEmergencyAdminLoginAllowed() && legacyToken?.role === 'ADMIN') return NextResponse.next()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 4. Admin UI protection
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const adminToken = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    const adminPayload = adminToken ? await verifyAdminToken(adminToken) : null
    if (adminPayload) return NextResponse.next()
    const legacyToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (isEmergencyAdminLoginAllowed() && legacyToken?.role === 'ADMIN') return NextResponse.next()
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 5. Student space protection
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
  }

  // ── 6. All locale routes → next-intl middleware handles locale detection & routing
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

export default proxy
