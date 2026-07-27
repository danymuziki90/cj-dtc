'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import {
  adminInputClassName,
  adminSelectClassName,
} from '@/components/admin-portal/ui'
import type { SessionOption, StatusFilter } from './types'

interface AssignmentFiltersProps {
  search: string
  onSearch: (v: string) => void
  sessionFilter: string
  onSessionFilter: (v: string) => void
  statusFilter: StatusFilter
  onStatusFilter: (v: StatusFilter) => void
  sessions: SessionOption[]
}

export function AssignmentFilters({
  search,
  onSearch,
  sessionFilter,
  onSessionFilter,
  statusFilter,
  onStatusFilter,
  sessions,
}: AssignmentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />

      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un travail…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className={`${adminInputClassName} pl-9`}
        />
      </div>

      {/* Session filter */}
      <select
        value={sessionFilter}
        onChange={(e) => onSessionFilter(e.target.value)}
        className={`${adminSelectClassName} min-w-[180px]`}
      >
        <option value="all">Toutes les sessions</option>
        {sessions.map((s) => (
          <option key={s.id} value={String(s.id)}>
            {s.formation?.title ?? 'Formation'} — {new Date(s.startDate).toLocaleDateString('fr-FR')}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilter(e.target.value as StatusFilter)}
        className={`${adminSelectClassName} min-w-[160px]`}
      >
        <option value="all">Tous les statuts</option>
        <option value="publie">Publiés</option>
        <option value="brouillon">Brouillons</option>
        <option value="archive">Archivés</option>
      </select>
    </div>
  )
}
