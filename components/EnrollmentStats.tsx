'use client'

import { BadgeCheck, CircleDollarSign, Clock3, CreditCard, Layers3, UserRoundCheck } from 'lucide-react'
import { AdminMetricCard, AdminPanel, AdminPanelHeader, AdminBadge } from '@/components/admin-portal/ui'

export type EnrollmentStatsSummary = {
  total: number
  byStatus: Record<string, number>
  byPaymentStatus: Record<string, number>
  byAccountStatus: Record<string, number>
  revenue: {
    totalAmount: number
    paidAmount: number
  }
  byFormation: Array<{
    id: number
    title: string
    count: number
  }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function EnrollmentStats({ summary }: { summary: EnrollmentStatsSummary }) {
  const acceptedCount = (summary.byStatus.accepted || 0) + (summary.byStatus.confirmed || 0)
  const paidRatio = summary.total > 0 ? Math.round(((summary.byPaymentStatus.paid || 0) / summary.total) * 100) : 0
  const activeAccounts = summary.byAccountStatus.active || 0
  const pendingAccounts = summary.byAccountStatus.pending_creation || 0

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AdminMetricCard
          icon={Layers3}
          label="Inscriptions"
          value={String(summary.total)}
          helper="Volume total dans la vue active."
          tone="primary"
        />
        <AdminMetricCard
          icon={Clock3}
          label="En attente"
          value={String(summary.byStatus.pending || 0)}
          helper="Dossiers a relancer ou verifier."
          tone="warning"
        />
        <AdminMetricCard
          icon={BadgeCheck}
          label="Eligibles"
          value={String(acceptedCount)}
          helper="Inscriptions acceptees ou confirmees."
          tone="success"
        />
        <AdminMetricCard
          icon={CreditCard}
          label="Paiements soldes"
          value={`${paidRatio}%`}
          helper={`${summary.byPaymentStatus.paid || 0} dossier(s) completement regles.`}
          tone="neutral"
        />
        <AdminMetricCard
          icon={UserRoundCheck}
          label="Comptes actifs"
          value={String(activeAccounts)}
          helper={`${pendingAccounts} dossier(s) attendent encore la creation du compte.`}
          tone="primary"
        />
        <AdminMetricCard
          icon={CircleDollarSign}
          label="Encaissements"
          value={formatCurrency(summary.revenue.paidAmount)}
          helper="Revenus effectivement encaisses."
          tone="success"
        />
      </section>

      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Distribution"
          title="Lecture rapide du portefeuille d'inscriptions"
          description="Croisez les statuts de dossier, de paiement, de compte et le poids de chaque formation sans quitter la page."
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Statut dossier</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <AdminBadge tone="warning">En attente: {summary.byStatus.pending || 0}</AdminBadge>
                <AdminBadge tone="success">Acceptees: {summary.byStatus.accepted || 0}</AdminBadge>
                <AdminBadge tone="primary">Confirmees: {summary.byStatus.confirmed || 0}</AdminBadge>
                <AdminBadge tone="danger">Rejetees: {summary.byStatus.rejected || 0}</AdminBadge>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Statut paiement</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <AdminBadge tone="danger">Non soldes: {summary.byPaymentStatus.unpaid || 0}</AdminBadge>
                <AdminBadge tone="warning">Partiels: {summary.byPaymentStatus.partial || 0}</AdminBadge>
                <AdminBadge tone="success">Soldes: {summary.byPaymentStatus.paid || 0}</AdminBadge>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Statut compte</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <AdminBadge tone="warning">Paiement requis: {summary.byAccountStatus.awaiting_payment || 0}</AdminBadge>
                <AdminBadge tone="primary">A creer: {summary.byAccountStatus.pending_creation || 0}</AdminBadge>
                <AdminBadge tone="success">Actifs: {summary.byAccountStatus.active || 0}</AdminBadge>
                <AdminBadge tone="danger">Suspendus: {summary.byAccountStatus.suspended || 0}</AdminBadge>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 md:col-span-2 xl:col-span-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Valeur portefeuille</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                {formatCurrency(summary.revenue.totalAmount)}
              </p>
              <p className="mt-2 text-sm text-slate-500">Montant theorique total des inscriptions visibles.</p>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Par formation</p>
            {summary.byFormation.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-slate-500">Aucune repartition par formation disponible pour cette selection.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {summary.byFormation.slice(0, 6).map((stat) => {
                  const share = summary.total > 0 ? Math.round((stat.count / summary.total) * 100) : 0
                  return (
                    <div key={stat.id} className="rounded-[22px] border border-slate-100 bg-slate-50/80 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{stat.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{share}% des inscriptions filtrees</p>
                        </div>
                        <AdminBadge tone="primary">{stat.count}</AdminBadge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}
