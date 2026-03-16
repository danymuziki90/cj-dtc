'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import {
  AdminBadge,
  AdminPanel,
  AdminPanelHeader,
  adminInputClassName,
  adminSecondaryButtonClassName,
  adminSelectClassName,
} from '@/components/admin-portal/ui'

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
  onFiltersChange: (filters: {
    status: string
    formationId: string
    paymentStatus: string
    startDateFrom: string
    startDateTo: string
    search: string
  }) => void
  onReset: () => void
}

export default function EnrollmentFilters({
  filters,
  formations,
  onFiltersChange,
  onReset,
}: EnrollmentFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value.trim().length > 0).length
  }, [filters])

  function updateFilter(key: keyof EnrollmentFiltersProps['filters'], value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        eyebrow="Filtres"
        title="Affiner la vue des inscriptions"
        description="Combinez recherche, statut, formation et temporalite pour faire ressortir les dossiers a traiter en priorite."
        actions={
          <>
            <button type="button" onClick={() => setShowAdvanced((value) => !value)} className={adminSecondaryButtonClassName}>
              <SlidersHorizontal className="h-4 w-4" />
              {showAdvanced ? 'Masquer les dates' : 'Afficher les dates'}
            </button>
            <button type="button" onClick={onReset} className={adminSecondaryButtonClassName}>
              Reinitialiser
            </button>
          </>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <AdminBadge tone="primary">Filtres actifs: {activeFilterCount}</AdminBadge>
        {filters.search ? <AdminBadge tone="neutral">Recherche: {filters.search}</AdminBadge> : null}
        {filters.paymentStatus ? <AdminBadge tone="warning">Paiement: {filters.paymentStatus}</AdminBadge> : null}
        {filters.status ? <AdminBadge tone="success">Dossier: {filters.status}</AdminBadge> : null}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Recherche</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nom, email, formation ou lieu"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              className={`pl-11 ${adminInputClassName}`}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Statut dossier</label>
          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
            className={adminSelectClassName}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Accepte</option>
            <option value="confirmed">Confirme</option>
            <option value="rejected">Rejete</option>
            <option value="cancelled">Annule</option>
            <option value="completed">Termine</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Formation</label>
          <select
            value={filters.formationId}
            onChange={(event) => updateFilter('formationId', event.target.value)}
            className={adminSelectClassName}
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
          <label className="mb-2 block text-sm font-medium text-slate-700">Paiement</label>
          <select
            value={filters.paymentStatus}
            onChange={(event) => updateFilter('paymentStatus', event.target.value)}
            className={adminSelectClassName}
          >
            <option value="">Tous les statuts</option>
            <option value="unpaid">Non solde</option>
            <option value="partial">Partiel</option>
            <option value="paid">Solde</option>
          </select>
        </div>
      </div>

      {showAdvanced ? (
        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Date de debut - du</label>
            <input
              type="date"
              value={filters.startDateFrom}
              onChange={(event) => updateFilter('startDateFrom', event.target.value)}
              className={adminInputClassName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Date de debut - au</label>
            <input
              type="date"
              value={filters.startDateTo}
              onChange={(event) => updateFilter('startDateTo', event.target.value)}
              className={adminInputClassName}
            />
          </div>
        </div>
      ) : null}
    </AdminPanel>
  )
}
