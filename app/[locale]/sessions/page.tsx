import { MainSessionsPage } from '@/app/sessions/page'
import { StudentAuthProvider } from '@/lib/auth/StudentAuthContext'

export default function LocalizedSessionsPage() {
  return (
    <StudentAuthProvider>
      <MainSessionsPage />
    </StudentAuthProvider>
  )
}
