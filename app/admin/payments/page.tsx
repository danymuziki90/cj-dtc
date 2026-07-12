'use client'

// Module paiements désactivé — refonte 2026.
// Ce module a été retiré du périmètre admin conformément aux décisions
// de la refonte : pas de gestion des paiements côté back-office.
// La route API /api/payments reste en place pour traçabilité des données
// existantes mais n'est plus exposée via l'interface admin.

import { redirect } from 'next/navigation'

export default function PaymentsPageRedirect() {
  redirect('/admin/dashboard')
}
