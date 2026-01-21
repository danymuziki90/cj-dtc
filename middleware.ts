import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'

// Middleware pour gérer les locales
const localeMiddleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  
  // Rediriger la racine vers /fr
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr', request.url))
  }
  
  return NextResponse.next()
}

// Middleware pour l'authentification admin
const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Permettre l'accès si l'utilisateur a le rôle admin
      return token?.role === 'admin'
    }
  },
  pages: {
    signIn: '/api/auth/signin'
  }
})

// Middleware principal
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rediriger /fr/admin vers /admin
  if (pathname === '/fr/admin' || pathname.startsWith('/fr/admin/')) {
    const newPath = pathname.replace('/fr/admin', '/admin')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/fr${pathname}`
    return NextResponse.redirect(url)
  }
  
  // Gérer la redirection de locale
  if (pathname === '/') {
    return localeMiddleware(request)
  }
  
  // Gérer l'auth pour /admin (sauf les routes API auth)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/auth')) {
    return authMiddleware(request as any, {} as any) as NextResponse
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/fr/admin/:path*',
    '/auth/:path*',
    '/(fr|en)/:path*'
  ]
}
