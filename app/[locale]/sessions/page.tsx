import { Suspense } from 'react'
import { MainSessionsPage } from '@/app/sessions/page'
import { StudentAuthProvider } from '@/lib/auth/StudentAuthContext'

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Nos Sessions de Formation Ouvertes | CJ DTC',
  description: 'Inscrivez-vous aux prochaines sessions de formation certifiantes en RH, leadership et management. Formats en ligne, hybride et présentiel.',
  keywords: ['sessions de formation', 'prochaines sessions', 'inscription formation', 'calendrier académique', 'CJ DTC'],
  path: '/sessions',
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function LocalizedSessionsPage() {
  return (
    <StudentAuthProvider>
      <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Chargement des sessions...</div>}>
        <MainSessionsPage />
      </Suspense>
    </StudentAuthProvider>
  )
}
