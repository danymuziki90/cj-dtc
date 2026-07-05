import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UseStudentAuthOptions {
  requiredRole?: string
  redirectTo?: string
}

/**
 * Hook pour protéger les routes étudiantes
 * Vérifie que l'utilisateur est authentifié et a le rôle approprié
 * Redirige automatiquement vers la page de login si non authentifié
 * 
 * @param options Configuration pour la protection
 * @returns État de session et de chargement
 */
export function useStudentAuth(options: UseStudentAuthOptions = {}) {
  const { requiredRole = 'STUDENT', redirectTo = '/auth/login' } = options
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      // Rediriger vers la page de login
      const currentPath =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : ''
      const loginUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`
      router.push(loginUrl)
      return
    }

    if (session && session.user) {
      // Vérifier le rôle si spécifié
      if (
        requiredRole &&
        (session.user as any).role &&
        (session.user as any).role !== requiredRole
      ) {
        router.push('/auth/error?error=unauthorized_role')
        return
      }
    }
  }, [status, session, router, requiredRole, redirectTo])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    user: session?.user,
  }
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useStudentRole() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role

  return {
    isStudent: userRole === 'STUDENT',
    isAdmin: userRole === 'ADMIN',
    role: userRole,
  }
}

/**
 * Hook pour rediriger après connexion réussie
 */
export function usePostLoginRedirect() {
  const router = useRouter()

  const redirectAfterLogin = (defaultPath = '/student/dashboard') => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl')

      if (callbackUrl) {
        router.push(callbackUrl)
      } else {
        router.push(defaultPath)
      }
    }
  }

  return { redirectAfterLogin }
}
