'use client'

import { BookOpenCheck, CheckCircle2, Clock, FileText, Layers3 } from 'lucide-react'
import type { Assignment } from './types'

interface AssignmentKpisProps {
  assignments: Assignment[]
  pendingGradingCount: number
  activeFilter: string
  onFilter: (f: string) => void
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  onClick,
  active,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col gap-3 rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 ${
        active
          ? `${accent} border-transparent shadow-lg scale-[1.02]`
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${active ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </p>
        <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${active ? 'text-white/80' : 'text-slate-500'}`}>
          {label}
        </p>
        {sub && (
          <p className={`mt-1 text-[11px] ${active ? 'text-white/70' : 'text-slate-400'}`}>{sub}</p>
        )}
      </div>
    </button>
  )
}

export function AssignmentKpis({ assignments, pendingGradingCount, activeFilter, onFilter }: AssignmentKpisProps) {
  const total = assignments.length
  const published = assignments.filter((a) => a.published && a.status !== 'archive').length
  const draft = assignments.filter((a) => !a.published || a.status === 'brouillon').length

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <KpiCard
        icon={Layers3}
        label="Total travaux"
        value={total}
        accent="bg-gradient-to-br from-slate-700 to-slate-900"
        onClick={() => onFilter('all')}
        active={activeFilter === 'all'}
      />
      <KpiCard
        icon={BookOpenCheck}
        label="Publiés"
        value={published}
        sub="Visibles par les étudiants"
        accent="bg-gradient-to-br from-blue-600 to-blue-800"
        onClick={() => onFilter('publie')}
        active={activeFilter === 'publie'}
      />
      <KpiCard
        icon={FileText}
        label="Brouillons"
        value={draft}
        sub="Non visibles"
        accent="bg-gradient-to-br from-amber-500 to-amber-700"
        onClick={() => onFilter('brouillon')}
        active={activeFilter === 'brouillon'}
      />
      <KpiCard
        icon={Clock}
        label="En attente de correction"
        value={pendingGradingCount}
        sub="Remises non notées"
        accent="bg-gradient-to-br from-rose-500 to-rose-700"
        onClick={() => onFilter('pending_grading')}
        active={activeFilter === 'pending_grading'}
      />
    </div>
  )
}
