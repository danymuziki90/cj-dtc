'use client'

interface Enrollment {
  id: number
  status: string
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  formation: {
    id: number
    title: string
  }
}

interface EnrollmentStatsProps {
  enrollments: Enrollment[]
}

export default function EnrollmentStats({ enrollments }: EnrollmentStatsProps) {
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    accepted: enrollments.filter(e => e.status === 'accepted').length,
    confirmed: enrollments.filter(e => e.status === 'confirmed').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
    unpaid: enrollments.filter(e => e.paymentStatus === 'unpaid').length,
    partial: enrollments.filter(e => e.paymentStatus === 'partial').length,
    paid: enrollments.filter(e => e.paymentStatus === 'paid').length,
    totalRevenue: enrollments.reduce((sum, e) => sum + e.totalAmount, 0),
    paidRevenue: enrollments.reduce((sum, e) => sum + e.paidAmount, 0)
  }

  const formationStats = enrollments.reduce((acc: Record<number, { count: number; title: string }>, enrollment) => {
    const id = enrollment.formation.id
    if (!acc[id]) {
      acc[id] = { count: 0, title: enrollment.formation.title }
    }
    acc[id].count++
    return acc
  }, {})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="mb-6">
      {/* Statistiques générales */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-cjblue">{stats.total}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">En attente</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Acceptées</div>
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Confirmées</div>
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Rejetées</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Statistiques de paiement */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Non payé</div>
          <div className="text-xl font-bold text-red-600">{stats.unpaid}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Partiel</div>
          <div className="text-xl font-bold text-yellow-600">{stats.partial}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Payé</div>
          <div className="text-xl font-bold text-green-600">{stats.paid}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Revenus payés</div>
          <div className="text-xl font-bold text-cjblue">{formatCurrency(stats.paidRevenue)}</div>
        </div>
      </div>

      {/* Statistiques par formation */}
      {Object.keys(formationStats).length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Par Formation</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(formationStats).map(([id, stat]) => (
              <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium truncate flex-1">{stat.title}</span>
                <span className="text-sm font-bold text-cjblue ml-2">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
