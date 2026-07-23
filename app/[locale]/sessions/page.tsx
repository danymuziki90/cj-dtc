import { Suspense } from 'react'
import { MainSessionsPage } from '@/app/sessions/page'
import { StudentAuthProvider } from '@/lib/auth/StudentAuthContext'

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
