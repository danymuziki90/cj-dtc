'use client'

import { redirect, useParams } from 'next/navigation'

export default function StudentCertificatesRedirect() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  redirect(`/${locale}/espace-etudiants/mes-certificats`)
  return null
}
