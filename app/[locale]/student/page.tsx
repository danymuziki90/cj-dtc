'use client'

import { redirect, useParams } from 'next/navigation'

export default function StudentPageRedirect() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  redirect(`/${locale}/espace-etudiants`)
  return null
}
