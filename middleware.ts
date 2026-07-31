import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken, ADMIN_AUTH_COOKIE } from '@/lib/auth-portal/jwt'
import { getToken } from 'next-auth/jwt'

// Définir les routes qui doivent être gérées par le middleware
export const config = {
  matcher: ['/api/admin/:path*'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exclure les routes d'authentification
  if (pathname.startsWith('/api/admin/auth/')) {
    return NextResponse.next()
  }

  // 1. Essayer le cookie custom admin_token
  const token = request.cookies.get(ADMIN_AUTH_COOKIE)?.value

  if (token) {
    const payload = await verifyAdminToken(token)
    if (payload?.sub) {
      return NextResponse.next()
    }
  }

  // 2. Fallback NextAuth si le custom token échoue ou est absent
  try {
    const nextAuthToken = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (nextAuthToken && (nextAuthToken.role === 'ADMIN' || nextAuthToken.role === 'SUPER_ADMIN')) {
      return NextResponse.next()
    }
  } catch (err) {
    console.error('Middleware NextAuth fallback token check failed:', err)
  }

  // Si on arrive ici, l'accès est refusé
  return NextResponse.json({ error: 'Unauthorized access to admin API' }, { status: 401 })
}
