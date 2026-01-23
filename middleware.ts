
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth-token'

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

// Middleware to handle locales (simplified version)
const localeMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr', request.url))
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Handle Locales (Root Redirect)
  const localeRedirect = localeMiddleware(request)
  if (localeRedirect) return localeRedirect

  // 2. Handle /fr/admin -> /admin normalization
  if (pathname === '/fr/admin' || pathname.startsWith('/fr/admin/')) {
    const newPath = pathname.replace('/fr/admin', '/admin')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // 3. Handle /auth and /student normalization
  if (pathname === '/auth' || pathname.startsWith('/auth/') || pathname === '/student' || pathname.startsWith('/student/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/fr${pathname}`
    return NextResponse.redirect(url)
  }

  // 4. Check if route is protected (Admin or Student)
  // We check if it starts with /admin, /student, or is a dashboard route
  const isAdminRoute = pathname.startsWith('/admin') || pathname.includes('/admin/')
  const isStudentRoute = pathname.startsWith('/student') || pathname.includes('/student/') || pathname.includes('/dashboard')

  // If it's not a protected route, proceed directly
  if (!isAdminRoute && !isStudentRoute) {
    return NextResponse.next()
  }

  // 5. Exclude explicit public routes if they happened to match (unlikely for admin/student, but good practice)
  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === `/fr${route}`)
  if (isPublic) {
    return NextResponse.next()
  }

  // 6. Verify Authentication
  // Check for 'student-token' cookie first (Created by our custom login)
  const token = request.cookies.get('student-token')?.value
  // Also check NextAuth cookie fallback (for legacy/admin access via NextAuth)
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value

  let user = null

  if (token) {
    // Verify custom JWT
    const payload = await verifyJWT(token)
    if (payload) {
      user = payload
    }
  }

  // If no custom token, we might want to let NextAuth middleware handle it, 
  // OR we can try to decode it here if we want a unified middleware without "withAuth" wrapper.
  // For now, if we have a robust custom JWT requirement, we prioritize that. 
  // If user is null and we are on a protected route, we redirect.

  if (!user) {
    // No valid session found
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 7. Role-Based Access Control
  const role = (user as any).role

  if (isAdminRoute && role !== 'ADMIN' && role !== 'admin') {
    // User is authenticated but not authorized for Admin
    return NextResponse.redirect(new URL('/403', request.url)) // Or redirect to their dashboard
  }

  if (isStudentRoute && role !== 'STUDENT' && role !== 'student' && role !== 'ADMIN' && role !== 'admin') {
    // Unlikely to happen if we only have two roles, but good safeguard
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/student/:path*',
    '/fr/admin/:path*',
    '/fr/student/:path*',
    '/auth/:path*',
    '/(fr|en)/:path*'
  ]
}
