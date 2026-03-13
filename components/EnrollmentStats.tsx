'use client'

export type EnrollmentStatsSummary = {
  total: number
  byStatus: Record<string, number>
  byPaymentStatus: Record<string, number>
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

export default function EnrollmentStats({ summary }: { summary: EnrollmentStatsSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="mb-6">
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-cjblue">{summary.total}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold text-red-600">{summary.byStatus.pending || 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Acceptees</div>
          <div className="text-2xl font-bold text-blue-600">{summary.byStatus.accepted || 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Confirmees</div>
          <div className="text-2xl font-bold text-blue-600">{summary.byStatus.confirmed || 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Rejetees</div>
          <div className="text-2xl font-bold text-red-600">{summary.byStatus.rejected || 0}</div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Non paye</div>
          <div className="text-xl font-bold text-red-600">{summary.byPaymentStatus.unpaid || 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Partiel</div>
          <div className="text-xl font-bold text-red-600">{summary.byPaymentStatus.partial || 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Paye</div>
          <div className="text-xl font-bold text-blue-600">{summary.byPaymentStatus.paid || 0}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-1 text-sm text-gray-600">Revenus payes</div>
          <div className="text-xl font-bold text-cjblue">{formatCurrency(summary.revenue.paidAmount)}</div>
        </div>
      </div>

      {summary.byFormation.length > 0 ? (
        <div className="rounded-lg border bg-white p-4">
          <h4 className="mb-3 font-semibold">Par formation</h4>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {summary.byFormation.map((stat) => (
              <div key={stat.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
                <span className="flex-1 truncate text-sm font-medium">{stat.title}</span>
                <span className="ml-2 text-sm font-bold text-cjblue">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
