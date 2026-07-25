'use client'

import { redirect, useParams } from 'next/navigation'

export default function StudentElearningRedirect() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  redirect(`/${locale}/espace-etudiants/elearning`)
  return null
}
