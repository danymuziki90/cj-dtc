import '../globals.css'
import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import AdminWorkspace from '@/components/admin-portal/AdminWorkspace'
import { ToastProvider } from '@/components/ui/toast'

export const metadata = { title: 'Admin - CJ DEVELOPMENT TRAINING CENTER' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AdminWorkspace>{children}</AdminWorkspace>
      </ToastProvider>
    </SessionProvider>
  )
}
