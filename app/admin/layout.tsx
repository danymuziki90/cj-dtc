import '../globals.css'
import { ReactNode } from 'react'
import AdminWorkspace from '@/components/admin-portal/AdminWorkspace'
import AdminProviders from '@/components/admin-portal/AdminProviders'

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Administration Back-Office | CJ DTC',
  description: 'Portail d\'administration sécurisé pour la gestion des formations, des apprenants, des sessions et des certifications CJ DTC.',
  path: '/admin',
  noIndex: true,
})
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      
        <AdminWorkspace>{children}</AdminWorkspace>
    </AdminProviders>
  )
}
