'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FormattedDate } from '@/components/FormattedDate'

interface Invoice {
  id: number
  invoiceNumber: string
  amount: number
  taxAmount: number
  totalAmount: number
  status: string
  dueDate: string | null
  paidDate: string | null
  sentAt: string | null
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
  formation: {
    id: number
    title: string
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    enrollmentId: '',
    amount: '',
    taxAmount: '0',
    dueDate: '',
    notes: ''
  })
  const [filter, setFilter] = useState({
    status: '',
    enrollmentId: ''
  })

  useEffect(() => {
    fetchInvoices()
    fetchEnrollments()
  }, [filter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.enrollmentId) params.append('enrollmentId', filter.enrollmentId)

      const response = await fetch(`/api/invoices?${params}`)
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error)
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
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          taxAmount: parseFloat(formData.taxAmount) || 0,
          dueDate: formData.dueDate || null,
          notes: formData.notes || null
        })
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          enrollmentId: '',
          amount: '',
          taxAmount: '0',
          dueDate: '',
          notes: ''
        })
        fetchInvoices()
        alert('Facture créée avec succès!')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error)
      alert('Erreur lors de la création de la facture')
    }
  }

  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === 'paid') {
        updateData.paidDate = new Date().toISOString()
      }
      if (newStatus === 'sent') {
        updateData.sentAt = new Date().toISOString()
      }

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        fetchInvoices()
        alert('Statut mis à jour!')
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const generatePDF = (invoiceId: number) => {
    window.open(`/api/invoices/${invoiceId}/generate`, '_blank')
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
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      overdue: 'bg-orange-100 text-orange-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      cancelled: 'Annulée',
      overdue: 'En retard'
    }
    return labels[status] || status
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

  const totalAmount = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0)

  const pendingAmount = invoices
    .filter(i => ['draft', 'sent'].includes(i.status))
    .reduce((sum, i) => sum + i.totalAmount, 0)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cjblue">Gestion des Factures</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Annuler' : '+ Nouvelle Facture'}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Payé</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">En Attente</div>
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Nombre de Factures</div>
          <div className="text-2xl font-bold text-cjblue">{invoices.length}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Factures Payées</div>
          <div className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.status === 'paid').length}
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Nouvelle Facture</h2>
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
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Montant HT (USD) *</label>
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
                <label className="block text-sm font-medium mb-1">TVA (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxAmount}
                  onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date d'échéance</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
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
                Créer la Facture
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
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
              <option value="overdue">En retard</option>
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

      {/* Liste des factures */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Aucune facture trouvée
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <FormattedDate date={invoice.createdAt} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.enrollment.firstName} {invoice.enrollment.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {invoice.enrollment.formation.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {invoice.dueDate ? <FormattedDate date={invoice.dueDate} /> : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => generatePDF(invoice.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Générer PDF"
                      >
                        📄
                      </button>
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="sent">Envoyée</option>
                        <option value="paid">Payée</option>
                        <option value="cancelled">Annulée</option>
                        <option value="overdue">En retard</option>
                      </select>
                    </div>
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
