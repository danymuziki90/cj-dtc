import '../globals.css'
import AdminHeader from '../../components/AdminHeader'
import { ReactNode } from 'react'

export const metadata = { title: 'Admin — CJ DEVELOPMENT TRAINING CENTER' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
