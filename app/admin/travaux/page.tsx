'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '@/components/admin-portal/AdminShell'

type AssignmentItem = {
  id: number
  title: string
  type: string
  deadline: string
  status: string
  published: boolean
  Formation?: { title: string }
  TrainingSession?: { title: string }
  createdAt: string
}

type AssignmentResponse = {
  assignments: AssignmentItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    pageCount: number
  }
}

export default function AdminTravauxPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function loadAssignments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/travaux?search=${encodeURIComponent(search)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Erreur lors du chargement des travaux')
      const data = await res.json() as AssignmentResponse
      setAssignments(data.assignments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAssignments()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function deleteAssignment(id: number) {
    if (!window.confirm('Voulez-vous vraiment supprimer ce travail ?')) return
    try {
      const res = await fetch(`/api/admin/travaux/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Échec de la suppression')
      setAssignments(assignments.filter(a => a.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
    }
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Travaux</h1>
          <p className="text-slate-500 text-sm mt-1">Créez et gérez les devoirs pour vos étudiants</p>
        </div>
        <Link 
          href="/admin/travaux/nouveau" 
          className="bg-[#2A52BE] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-[#20409A] transition-colors"
        >
          + Nouveau Travail
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <input
            type="text"
            placeholder="Rechercher un travail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2A52BE]"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Formation / Session</th>
                <th className="px-6 py-4">Date limite</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Chargement des travaux...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Aucun travail trouvé.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {assignment.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                        {assignment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{assignment.Formation?.title || '-'}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{assignment.TrainingSession?.title || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(assignment.deadline).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link 
                        href={`/admin/travaux/${assignment.id}`}
                        className="text-[#2A52BE] hover:text-[#20409A] font-medium"
                      >
                        Gérer
                      </Link>
                      <button 
                        onClick={() => deleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
