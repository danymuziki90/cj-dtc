import '../globals.css'
import { ReactNode } from 'react'
import AdminWorkspace from '@/components/admin-portal/AdminWorkspace'

export const metadata = { title: 'Admin - CJ DEVELOPMENT TRAINING CENTER' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminWorkspace>{children}</AdminWorkspace>
}
