import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Espace Etudiant — CJ Development Training Center',
    default: 'Espace Etudiant — CJ Development Training Center',
  },
  description: 'Accedez a vos sessions, travaux, ressources et certificats depuis votre espace etudiant.',
  robots: { index: false, follow: false },
}

/**
 * Layout racine de l'espace etudiant (/student/*).
 *
 * La protection des routes est assurée à deux niveaux :
 *  1. Côté API : chaque route /api/student/system/* appelle requireStudent()
 *     qui vérifie le cookie JWT et renvoie 401 si absent/expiré.
 *  2. Côté client : les hooks useStudentDashboardData() et les pages individuelles
 *     redirigent vers /student/login lors d'un 401/403.
 *
 * Les pages /student/login, /student/register, /student/forgot-password et
 * /student/reset-password sont publiques (pas de vérification nécessaire).
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
