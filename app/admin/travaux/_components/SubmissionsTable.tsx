'use client'

import { useState } from 'react'
import { Download, Edit2, Search, SlidersHorizontal, Clock, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react'
import { adminInputClassName, adminSelectClassName, AdminBadge } from '@/components/admin-portal/ui'
import PaginationControls from '@/components/admin-portal/PaginationControls'
import type { SessionOption, Submission, SubmissionStatusFilter } from './types'

function statusBadge(status: string, deadline?: string) {
  if (status === 'graded') return <AdminBadge tone="success">Corrigé</AdminBadge>
  if (status === 'returned') return <AdminBadge tone="warning">À reprendre</AdminBadge>
  if (deadline && new Date(deadline) < new Date()) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200"><AlertTriangle className="h-3 w-3" />En retard</span>
  }
  return <AdminBadge tone="primary">Rendu</AdminBadge>
}

interface SubmissionsTableProps {
  submissions: Submission[]
  total: number
  totalPages: number
  loading: boolean
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  search: string
  onSearch: (v: string) => void
  sessionFilter: string
  onSessionFilter: (v: string) => void
  assignmentFilter: string
  onAssignmentFilter: (v: string) => void
  statusFilter: SubmissionStatusFilter
  onStatusFilter: (v: SubmissionStatusFilter) => void
  sessions: SessionOption[]
  assignments: { id: number; title: string }[]
  onGrade: (s: Submission) => void
}

export function SubmissionsTable({
  submissions,
  total,
  totalPages,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  search,
  onSearch,
  sessionFilter,
  onSessionFilter,
  assignmentFilter,
  onAssignmentFilter,
  statusFilter,
  onStatusFilter,
  sessions,
  assignments,
  onGrade,
}: SubmissionsTableProps) {
  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher étudiant, matricule…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className={`${adminInputClassName} pl-9`}
          />
        </div>
        <select
          value={sessionFilter}
          onChange={(e) => onSessionFilter(e.target.value)}
          className={`${adminSelectClassName} min-w-[160px]`}
        >
          <option value="all">Toutes les sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.formation?.title ?? 'Formation'} — {new Date(s.startDate).toLocaleDateString('fr-FR')}
            </option>
          ))}
        </select>
        <select
          value={assignmentFilter}
          onChange={(e) => onAssignmentFilter(e.target.value)}
          className={`${adminSelectClassName} min-w-[160px]`}
        >
          <option value="all">Tous les travaux</option>
          {assignments.map((a) => (
            <option key={a.id} value={String(a.id)}>{a.title}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value as SubmissionStatusFilter)}
          className={`${adminSelectClassName} min-w-[140px]`}
        >
          <option value="all">Tous les statuts</option>
          <option value="submitted">Rendus</option>
          <option value="graded">Corrigés</option>
          <option value="returned">À reprendre</option>
          <option value="overdue">En retard</option>
        </select>
        <span className="ml-auto text-xs text-slate-400 font-medium">{total} résultat{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-3">
            <span className="h-5 w-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
            Chargement des remises…
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <CheckCircle2 className="h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium">Aucune remise trouvée</p>
            <p className="text-xs">Modifiez les filtres pour afficher d'autres résultats</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Étudiant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Travail</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rendu le</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fichiers</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-slate-100 transition hover:bg-blue-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    {/* Student */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {sub.student.firstName} {sub.student.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400">#{sub.student.studentNumber}</p>
                      </div>
                    </td>

                    {/* Assignment */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 text-xs max-w-[160px] truncate">
                        {sub.assignment?.title ?? `#${sub.assignmentId}`}
                      </p>
                    </td>

                    {/* Submitted at */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(sub.submittedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {statusBadge(sub.status, sub.assignment?.deadline)}
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-3">
                      {sub.grade !== null ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 text-sm">
                          {sub.grade}<span className="text-slate-400 font-normal text-xs">/20</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Files */}
                    <td className="px-4 py-3">
                      {sub.files?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sub.files.map((f) => (
                            <a
                              key={f.id}
                              href={`/api/r2/file/${encodeURIComponent(f.url)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-blue-100 hover:text-blue-800 transition"
                            >
                              <Download className="h-3 w-3" />
                              {(f.originalName || f.name).slice(0, 16)}…
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onGrade(sub)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        {sub.status === 'submitted' ? 'Corriger' : 'Modifier'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          pagination={{
            page,
            pageSize,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          }}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
