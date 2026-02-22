
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify'
]

// Handle locale redirection
const localeMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr', request.url))
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Handle locale redirection
  const localeRedirect = localeMiddleware(request)
  if (localeRedirect) return localeRedirect

  // 2. Normalize /auth and /student paths
  if (pathname === '/auth' || pathname.startsWith('/auth/') || pathname === '/student' || pathname.startsWith('/student/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/fr${pathname}`
    return NextResponse.redirect(url)
  }

  // 3. Check if route is protected
  const isAdminRoute = pathname.startsWith('/admin') || pathname.includes('/admin/')
  const isStudentRoute = pathname.includes('/espace-etudiants') || pathname.includes('/dashboard')

  // If it's not a protected route, proceed
  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next()
  }

  // 4. Check if route is public
  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === `/fr${route}`)
  if (isPublic) {
    return NextResponse.next()
  }

  // 5. Verify authentication using NextAuth JWT
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  if (!token) {
    const loginUrl = new URL('/fr/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 6. Role-based access control
  const userRole = token.role as string

  if (isAdminRoute && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  if (isStudentRoute && userRole !== 'STUDENT' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/fr/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/student/:path*',
    '/espace-etudiants/:path*',
    '/fr/admin/:path*',
    '/fr/student/:path*',
    '/fr/espace-etudiants/:path*',
    '/auth/:path*',
    '/(fr|en)/:path*'
  ]
}
