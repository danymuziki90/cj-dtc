'use client'

import { BadgeCheck, Clock3, Layers3, XCircle } from 'lucide-react'
import { AdminMetricCard } from '@/components/admin-portal/ui'

export type EnrollmentStatsSummary = {
  total: number
  byStatus: Record<string, number>
  byAccountStatus: Record<string, number>
  byFormation: Array<{
    id: number
    title: string
    count: number
  }>
}

export default function EnrollmentStats({ summary }: { summary: EnrollmentStatsSummary }) {
  const acceptedCount = (summary.byStatus.accepted || 0) + (summary.byStatus.confirmed || 0)
  const rejectedCount = (summary.byStatus.rejected || 0) + (summary.byStatus.cancelled || 0)

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminMetricCard
        icon={Layers3}
        label="Total inscriptions"
        value={String(summary.total)}
        helper="Tous dossiers confondus dans la vue active."
        tone="primary"
      />
      <AdminMetricCard
        icon={Clock3}
        label="En attente"
        value={String(summary.byStatus.pending || 0)}
        helper="Dossiers à traiter en priorité."
        tone="warning"
      />
      <AdminMetricCard
        icon={BadgeCheck}
        label="Acceptées"
        value={String(acceptedCount)}
        helper="Inscriptions acceptées ou confirmées."
        tone="success"
      />
      <AdminMetricCard
        icon={XCircle}
        label="Refusées"
        value={String(rejectedCount)}
        helper="Inscriptions rejetées ou annulées."
        tone="danger"
      />
    </section>
  )
}
