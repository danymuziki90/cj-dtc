'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Payment {
  id: number
  amount: number
  method: string
  status: string
  transactionId: string | null
  reference: string | null
  notes: string | null
  paidAt: string | null
  createdAt: string
  enrollment: {
    id: number
    firstName: string
    lastName: string
    email: string
    formation: {
      id: number
      title: string
    }
  }
}

interface Enrollment {
  id: number
  firstName: string
  lastName: string
  email: string
  totalAmount: number
  paidAmount: number
  formation: {
    id: number
    title: string
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    enrollmentId: '',
    amount: '',
    method: 'cash',
    transactionId: '',
    reference: '',
    notes: ''
  })
  const [filter, setFilter] = useState({
    status: '',
    enrollmentId: ''
  })

  useEffect(() => {
    fetchPayments()
    fetchEnrollments()
  }, [filter])

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.enrollmentId) params.append('enrollmentId', filter.enrollmentId)

      const response = await fetch(`/api/payments?${params}`)
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      setEnrollments(data)
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          transactionId: formData.transactionId || null,
          reference: formData.reference || null,
          notes: formData.notes || null
        })
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          enrollmentId: '',
          amount: '',
          method: 'cash',
          transactionId: '',
          reference: '',
          notes: ''
        })
        fetchPayments()
        fetchEnrollments()
        alert('Paiement enregistré avec succès!')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error)
      alert('Erreur lors de l\'enregistrement du paiement')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Espèces',
      card: 'Carte bancaire',
      mobile_money: 'Mobile Money',
      bank_transfer: 'Virement bancaire',
      check: 'Chèque'
    }
    return labels[method] || method
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cjblue">Gestion des Paiements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Annuler' : '+ Nouveau Paiement'}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Paiements</div>
          <div className="text-2xl font-bold text-cjblue">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Nombre de Paiements</div>
          <div className="text-2xl font-bold text-cjblue">{payments.length}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Paiements Complets</div>
          <div className="text-2xl font-bold text-green-600">
            {payments.filter(p => p.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">En Attente</div>
          <div className="text-2xl font-bold text-yellow-600">
            {payments.filter(p => p.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Nouveau Paiement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Inscription *</label>
                <select
                  required
                  value={formData.enrollmentId}
                  onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner une inscription</option>
                  {enrollments.map((enrollment) => (
                    <option key={enrollment.id} value={enrollment.id}>
                      {enrollment.firstName} {enrollment.lastName} - {enrollment.formation.title}
                      {' '}({formatCurrency(enrollment.paidAmount)} / {formatCurrency(enrollment.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Montant (USD) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Méthode de paiement *</label>
                <select
                  required
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="check">Chèque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Transaction</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enregistrer le Paiement
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="completed">Complété</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Inscription</label>
            <select
              value={filter.enrollmentId}
              onChange={(e) => setFilter({ ...filter, enrollmentId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Toutes</option>
              {enrollments.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.id.toString()}>
                  {enrollment.firstName} {enrollment.lastName} - {enrollment.formation.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Aucun paiement trouvé
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.enrollment.firstName} {payment.enrollment.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {payment.enrollment.formation.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getMethodLabel(payment.method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.transactionId || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
