import '../globals.css'
import { ReactNode } from 'react'
import AdminWorkspace from '@/components/admin-portal/AdminWorkspace'
import AdminProviders from '@/components/admin-portal/AdminProviders'

export const metadata = { title: 'Admin - CJ DEVELOPMENT TRAINING CENTER' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      
        <AdminWorkspace>{children}</AdminWorkspace>
    </AdminProviders>
  )
}
