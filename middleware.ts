import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken, ADMIN_AUTH_COOKIE } from '@/lib/auth-portal/jwt'
import { getToken } from 'next-auth/jwt'

// next-intl middleware for locale routing
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Admin API protection ---
  if (pathname.startsWith('/api/admin/')) {
    // Always allow auth endpoints through
    if (pathname.startsWith('/api/admin/auth/')) {
      return NextResponse.next()
    }

    // 1. Try custom admin JWT cookie
    const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
    if (token) {
      const payload = await verifyAdminToken(token)
      if (payload?.sub) {
        return NextResponse.next()
      }
    }

    // 2. Fallback: NextAuth token
    try {
      const nextAuthToken = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET,
      })
      if (
        nextAuthToken &&
        (nextAuthToken.role === 'ADMIN' || nextAuthToken.role === 'SUPER_ADMIN')
      ) {
        return NextResponse.next()
      }
    } catch (err) {
      console.error('Middleware NextAuth fallback failed:', err)
    }

    return NextResponse.json({ error: 'Unauthorized access to admin API' }, { status: 401 })
  }

  // --- next-intl locale routing ---
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Match locale routes (skip /_next, /admin UI, static files, and non-admin /api routes)
    '/((?!_next|admin|.*\\..*).*)',
    // Also match /api/admin paths so the auth guard above runs
    '/api/admin/:path*',
  ],
}
