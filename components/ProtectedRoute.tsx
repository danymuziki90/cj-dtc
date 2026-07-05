'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  fallback?: ReactNode
}

/**
 * Composant pour protéger une route côté client
 * Redirige automatiquement vers la page de login si non authentifié
 * 
 * Usage:
 * ```tsx
 * <ProtectedRoute requiredRole="STUDENT">
 *   <YourComponent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole = 'STUDENT',
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      const currentPath =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : ''
      const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
      return
    }

    // Vérifier le rôle si spécifié
    if (requiredRole && (session?.user as any)?.role !== requiredRole) {
      router.push('/auth/error?error=unauthorized_role')
    }
  }, [status, session, router, requiredRole])

  // Afficher le fallback pendant le chargement
  if (status === 'loading') {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    )
  }

  // Ne rien afficher si non authentifié (la redirection va se faire)
  if (status === 'unauthenticated') {
    return null
  }

  // Vérifier le rôle si spécifié
  if (requiredRole && (session?.user as any)?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

/**
 * Composant pour afficher les informations d'authentification
 * Utile pour déboguer les problèmes d'authentification
 */
export function AuthDebugInfo() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="p-4 bg-gray-100 text-gray-700">Chargement de la session...</div>
  }

  return (
    <div className="p-4 bg-gray-100 text-sm text-gray-700 rounded">
      <div>Status: {status}</div>
      <div>Role: {(session?.user as any)?.role || 'N/A'}</div>
      <div>Email: {session?.user?.email || 'N/A'}</div>
      <div>Student ID: {(session?.user as any)?.studentId || 'N/A'}</div>
    </div>
  )
}
