import '../globals.css'
import AdminHeader from '../../components/AdminHeader'
import { ReactNode } from 'react'

export const metadata = { title: 'Admin - CJ DEVELOPMENT TRAINING CENTER' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminHeader />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
