'use client'

import { useState } from 'react'

interface EnrollmentFiltersProps {
  filters: {
    status: string
    formationId: string
    paymentStatus: string
    startDateFrom: string
    startDateTo: string
    search: string
  }
  formations: Array<{ id: number; title: string }>
  onFiltersChange: (filters: any) => void
  onReset: () => void
}

export default function EnrollmentFilters({
  filters,
  formations,
  onFiltersChange,
  onReset
}: EnrollmentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filtres</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-cjblue hover:underline"
          >
            {showAdvanced ? 'Masquer' : 'Filtres avancés'}
          </button>
          <button
            onClick={onReset}
            className="text-sm text-gray-600 hover:underline"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Recherche rapide */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, email ou formation..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* Filtres de base */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Accepté</option>
            <option value="confirmed">Confirmé</option>
            <option value="rejected">Rejeté</option>
            <option value="cancelled">Annulé</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Formation</label>
          <select
            value={filters.formationId}
            onChange={(e) => updateFilter('formationId', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Toutes les formations</option>
            {formations.map((formation) => (
              <option key={formation.id} value={formation.id.toString()}>
                {formation.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut de paiement</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => updateFilter('paymentStatus', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Tous</option>
            <option value="unpaid">Non payé</option>
            <option value="partial">Partiel</option>
            <option value="paid">Payé</option>
          </select>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium mb-1">Date de début (du)</label>
            <input
              type="date"
              value={filters.startDateFrom}
              onChange={(e) => updateFilter('startDateFrom', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date de début (au)</label>
            <input
              type="date"
              value={filters.startDateTo}
              onChange={(e) => updateFilter('startDateTo', e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  )
}
