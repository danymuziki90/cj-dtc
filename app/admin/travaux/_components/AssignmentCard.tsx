'use client'

import Link from 'next/link'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Upload,
  Users,
  XCircle,
} from 'lucide-react'
import { AdminBadge } from '@/components/admin-portal/ui'
import type { Assignment } from './types'

function statusBadge(a: Assignment) {
  if (a.status === 'archive') return <AdminBadge tone="neutral">Archivé</AdminBadge>
  if (!a.published || a.status === 'brouillon') return <AdminBadge tone="warning">Brouillon</AdminBadge>
  return <AdminBadge tone="success">Publié</AdminBadge>
}

function typePill(type: string) {
  const map: Record<string, string> = {
    tp: 'TP',
    exam: 'Examen',
    project: 'Projet',
    homework: 'Devoir',
  }
  return map[type] ?? type.toUpperCase()
}

function difficultyColor(d: string) {
  if (d === 'avance') return 'text-rose-600 bg-rose-50 border-rose-200'
  if (d === 'intermediaire') return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-emerald-600 bg-emerald-50 border-emerald-200'
}

interface AssignmentCardProps {
  assignment: Assignment
  onViewSubmissions: (a: Assignment) => void
  onDelete: (a: Assignment) => void
  onTogglePublish: (a: Assignment) => void
  isTogglingPublish: boolean
}

export function AssignmentCard({
  assignment: a,
  onViewSubmissions,
  onDelete,
  onTogglePublish,
  isTogglingPublish,
}: AssignmentCardProps) {
  const submissionsCount = a._count?.submissions ?? a.submissions?.length ?? 0
  const pendingCount = (a.submissions ?? []).filter((s) => s.status === 'submitted').length
  const deadline = new Date(a.deadline)
  const isOverdue = deadline < new Date()
  const sessionLabel = a.session
    ? `${a.formation?.title ?? ''} — ${new Date(a.session.startDate).toLocaleDateString('fr-FR')}`
    : a.formation?.title ?? '—'

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[var(--cj-blue)] px-2 py-0.5 rounded-full">
              {typePill(a.type)}
            </span>
            <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${difficultyColor(a.difficulty)}`}>
              {a.difficulty}
            </span>
            {statusBadge(a)}
          </div>
          <h3 className="text-sm font-bold text-slate-900 truncate">{a.title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sessionLabel}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 space-y-3">
        {/* Deadline */}
        <div className={`flex items-center gap-2 text-xs font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
          {isOverdue ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          <span>
            Date limite : {deadline.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            {isOverdue && ' (dépassée)'}
          </span>
        </div>

        {/* Submissions stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {submissionsCount} remise{submissionsCount !== 1 ? 's' : ''}
          </span>
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              {pendingCount} à corriger
            </span>
          )}
          {a.files?.length > 0 && (
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {a.files.length} fichier{a.files.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
        {/* View submissions */}
        <button
          type="button"
          onClick={() => onViewSubmissions(a)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
        >
          <Eye className="h-3.5 w-3.5" />
          Remises ({submissionsCount})
        </button>

        {/* Edit */}
        <Link
          href={`/admin/travaux/${a.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          <Edit className="h-3.5 w-3.5" />
          Modifier
        </Link>

        {/* Publish toggle */}
        <button
          type="button"
          onClick={() => onTogglePublish(a)}
          disabled={isTogglingPublish}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            a.published && a.status !== 'brouillon'
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          {isTogglingPublish ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : a.published && a.status !== 'brouillon' ? (
            <>
              <XCircle className="h-3.5 w-3.5" /> Dépublier
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Publier
            </>
          )}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(a)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
