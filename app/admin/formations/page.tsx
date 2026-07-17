'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  PlusIcon, SearchIcon, Edit, Trash, Copy, CheckSquare,
  SquareIcon, BookOpen, Archive, Loader2, CheckCircle2,
  AlertTriangle, XCircle
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface Formation {
  id: number
  title: string
  slug: string
  description: string
  objectifs?: string
  duree?: string
  modules?: string
  methodes?: string
  certification?: string
  categorie?: string
  statut: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  enrollmentCount?: number
  rating?: number
  reviewCount?: number
  price?: number
  originalPrice?: number
  nextSession?: { startDate: string; location?: string; format?: string } | null
  instructor?: { firstName: string; lastName: string; title?: string } | null
  tags?: string[]
  level?: string
  format?: string
}

const FORMATION_STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700 border-gray-200',
  publie:    'bg-green-100 text-green-700 border-green-200',
  archive:   'bg-orange-100 text-orange-700 border-orange-200',
}

const FORMATION_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  publie:    'Publié',
  archive:   'Archivé',
}

const ITEMS_PER_PAGE = 9

export default function CombinedAdminFormationsPage() {
  const router = useRouter()

  // ── Data ────────────────────────────────────────────────────────────
  const [formations, setFormations]   = useState<Formation[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // ── Formations Filtering/Sorting ───────────────────────────────────────────
  const [formationSearch, setFormationSearch] = useState('')
  const [formationCatFilter, setFormationCatFilter] = useState('all')
  const [formationStatusFilter, setFormationStatusFilter] = useState('all')
  const [formationSortBy, setFormationSortBy] = useState('created')
  const [formationPage, setFormationPage] = useState(1)
  const [selectedFormations, setSelectedFormations] = useState<number[]>([])

  // ── Modals & Action States ─────────────────────────────────────────────────
  const [confirmDeleteFormation, setConfirmDeleteFormation] = useState<Formation | null>(null)
  const [confirmBulkDeleteFormations, setConfirmBulkDeleteFormations] = useState(false)

  // ── Load Data ──────────────────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const formRes = await fetch('/api/formations?status=all')
      if (!formRes.ok) throw new Error('Impossible de charger les formations')
      const formData = await formRes.json()
      setFormations(formData.formations ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived Formations ─────────────────────────────────────────────────────
  const filteredFormations = useMemo(() => {
    return formations
      .filter(f => {
        const q = formationSearch.toLowerCase()
        const matchSearch =
          !q ||
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.tags ?? []).some(t => t.toLowerCase().includes(q))
        const matchCat    = formationCatFilter === 'all' || f.categorie === formationCatFilter
        const matchStatus = formationStatusFilter === 'all' || f.statut === formationStatusFilter
        return matchSearch && matchCat && matchStatus
      })
      .sort((a, b) => {
        switch (formationSortBy) {
          case 'title-asc':  return a.title.localeCompare(b.title)
          case 'title-desc': return b.title.localeCompare(a.title)
          case 'students':   return (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0)
          case 'rating':     return (b.rating ?? 0) - (a.rating ?? 0)
          case 'price-asc':  return (a.price ?? 0) - (b.price ?? 0)
          case 'price-desc': return (b.price ?? 0) - (a.price ?? 0)
          default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
  }, [formations, formationSearch, formationCatFilter, formationStatusFilter, formationSortBy])

  const totalFormationPages = Math.max(1, Math.ceil(filteredFormations.length / ITEMS_PER_PAGE))
  const paginatedFormations = filteredFormations.slice((formationPage - 1) * ITEMS_PER_PAGE, formationPage * ITEMS_PER_PAGE)

  // ── Formations Category Options ────────────────────────────────────────────
  const categoryOptions = useMemo(() => {
    return [
      { id: 'all', label: 'Toutes les catégories', count: formations.length },
      ...Array.from(new Set(formations.map(f => f.categorie).filter(Boolean))).map(cat => ({
        id: cat as string,
        label: (cat as string).charAt(0).toUpperCase() + (cat as string).slice(1).replace(/-/g, ' '),
        count: formations.filter(f => f.categorie === cat).length,
      })),
    ]
  }, [formations])

  const statusOptions = useMemo(() => {
    return [
      { id: 'all',       label: 'Tous les statuts', count: formations.length },
      { id: 'publie',    label: 'Publié',            count: formations.filter(f => f.statut === 'publie').length },
      { id: 'brouillon', label: 'Brouillon',         count: formations.filter(f => f.statut === 'brouillon').length },
      { id: 'archive',   label: 'Archivé',           count: formations.filter(f => f.statut === 'archive').length },
    ]
  }, [formations])

  // ── CRUD - Formations ──────────────────────────────────────────────────────
  async function doDeleteFormation(id: number) {
    try {
      const res = await fetch(`/api/formations/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur lors de la suppression')
      }
      setSelectedFormations(s => s.filter(x => x !== id))
      await loadAllData()
      showToast('Formation supprimée avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setConfirmDeleteFormation(null)
    }
  }

  async function doBulkDeleteFormations() {
    try {
      await Promise.all(selectedFormations.map(id => fetch(`/api/formations/${id}`, { method: 'DELETE' })))
      setSelectedFormations([])
      await loadAllData()
      showToast(`${selectedFormations.length} formation(s) supprimée(s)`)
    } catch {
      showToast('Erreur lors de la suppression groupée', 'error')
    } finally {
      setConfirmBulkDeleteFormations(false)
    }
  }

  async function doDuplicateFormation(f: Formation) {
    try {
      const res = await fetch('/api/formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${f.title} (Copie)`,
          description: f.description,
          objectifs: f.objectifs,
          duree: f.duree,
          modules: f.modules,
          methodes: f.methodes,
          certification: f.certification,
          categorie: f.categorie,
          statut: 'brouillon',
          imageUrl: f.imageUrl,
        }),
      })
      if (!res.ok) throw new Error('Erreur lors de la duplication')
      await loadAllData()
      showToast('Formation dupliquée en tant que Brouillon')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  async function doToggleFormationPublish(f: Formation) {
    const newStatut = f.statut === 'publie' ? 'brouillon' : 'publie'
    try {
      const res = await fetch(`/api/formations/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut }),
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      await loadAllData()
      showToast(newStatut === 'publie' ? 'Formation publiée !' : 'Formation dépubliée')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  // ── Formations Multi-select ────────────────────────────────────────────────
  const toggleOneFormation = (id: number) => {
    setSelectedFormations(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  return (
    <AdminShell title="Formations">
      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl animate-fade-in-up ${
          toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* ── ACTIONS BAR ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500">
            Créez, modifiez et gérez les fiches formations ainsi que les thématiques académiques de la plateforme.
          </p>
        </div>
        <div>
          <Link
            href="/admin/formations/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition"
          >
            <PlusIcon className="h-4 w-4" />
            Créer une formation
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Toolbar Formations */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm md:flex-row md:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une formation par titre, thématique…"
              value={formationSearch}
              onChange={e => { setFormationSearch(e.target.value); setFormationPage(1) }}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-slate-800"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={formationCatFilter}
              onChange={e => { setFormationCatFilter(e.target.value); setFormationPage(1) }}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              {categoryOptions.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            <select
              value={formationStatusFilter}
              onChange={e => { setFormationStatusFilter(e.target.value); setFormationPage(1) }}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              {statusOptions.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            <select
              value={formationSortBy}
              onChange={e => setFormationSortBy(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              <option value="created">Plus récentes d'abord</option>
              <option value="title-asc">Titre A → Z</option>
              <option value="title-desc">Titre Z → A</option>
              <option value="students">Plus populaires</option>
              <option value="rating">Mieux notées</option>
            </select>

            {selectedFormations.length > 0 && (
              <button
                onClick={() => setConfirmBulkDeleteFormations(true)}
                className="px-3 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-black rounded-xl transition"
              >
                Supprimer ({selectedFormations.length})
              </button>
            )}
          </div>
        </div>

        {/* Formations Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="font-semibold text-xs uppercase tracking-wider">Chargement des formations…</span>
          </div>
        ) : paginatedFormations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border p-6">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm font-bold text-slate-900">Aucune formation trouvée</p>
            <p className="text-xs text-slate-500 mt-1">Modifiez vos filtres ou créez un nouveau template.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedFormations.map(f => {
              const isSelected = selectedFormations.includes(f.id)
              const statusColor = FORMATION_STATUS_COLORS[f.statut] ?? 'bg-slate-100 text-slate-700'
              const statusLabel = FORMATION_STATUS_LABELS[f.statut] ?? f.statut
              return (
                <div key={f.id} className={`bg-white rounded-2xl border-2 shadow-sm transition overflow-hidden flex flex-col group ${
                  isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200/70 hover:border-slate-300'
                }`}>
                  {/* Top banner / Image */}
                  <div className="relative h-32 bg-slate-100 flex items-center justify-center border-b">
                    {f.imageUrl ? (
                      <img src={f.imageUrl} alt={f.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-10 h-10 text-slate-350" />
                    )}

                    <button
                      onClick={() => toggleOneFormation(f.id)}
                      className="absolute top-3 left-3 w-6 h-6 rounded border bg-white/90 shadow flex items-center justify-center"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <SquareIcon className="w-4 h-4 text-slate-400" />}
                    </button>

                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1 space-y-3">
                    <div>
                      {f.categorie && (
                        <span className="text-[9px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                          {f.categorie.replace(/-/g, ' ')}
                        </span>
                      )}
                      <h3 className="font-extrabold text-slate-900 text-sm mt-2 leading-snug line-clamp-1">{f.title}</h3>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">{f.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                      {f.duree && <span className="bg-slate-50 px-1.5 py-0.5 rounded border">{f.duree}</span>}
                      {f.price !== undefined && <span className="bg-slate-50 px-1.5 py-0.5 rounded border text-blue-700 font-bold">${f.price}</span>}
                      {f.enrollmentCount !== undefined && <span className="bg-slate-50 px-1.5 py-0.5 rounded border">{f.enrollmentCount} inscrits</span>}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex gap-1.5 pt-3 mt-auto">
                      <button
                        onClick={() => doToggleFormationPublish(f)}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg text-slate-600 transition"
                      >
                        {f.statut === 'publie' ? 'Dépublier' : 'Publier'}
                      </button>
                      <Link
                        href={`/admin/sessions?action=create-session&formationId=${f.id}`}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-black rounded-lg text-center transition flex items-center justify-center"
                      >
                        Planifier Session
                      </Link>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => router.push(`/admin/formations/${f.id}/edit`)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => doDuplicateFormation(f)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteFormation(f)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Formations Pagination */}
        {totalFormationPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setFormationPage(p => Math.max(1, p - 1))}
              disabled={formationPage === 1}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg disabled:opacity-40"
            >
              Préc.
            </button>
            <span className="text-xs text-slate-500 font-bold">Page {formationPage} / {totalFormationPages}</span>
            <button
              onClick={() => setFormationPage(p => Math.min(totalFormationPages, p + 1))}
              disabled={formationPage === totalFormationPages}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg disabled:opacity-40"
            >
              Suiv.
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL: DELETE FORMATION CONFIRM ─────────────────────────────────── */}
      {confirmDeleteFormation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-650" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Supprimer la formation ?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Formation : <strong>{confirmDeleteFormation.title}</strong>
                </p>
                <p className="text-xs text-red-600 font-semibold mt-2">
                  Ceci détruira le template et bloquera les futures sessions basées sur celui-ci.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteFormation(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                onClick={() => doDeleteFormation(confirmDeleteFormation.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white font-black text-xs rounded-xl shadow-sm transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: BULK DELETE FORMATIONS CONFIRM ───────────────────────────── */}
      {confirmBulkDeleteFormations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-650" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Suppression groupée</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Voulez-vous supprimer les <strong>{selectedFormations.length} formations</strong> sélectionnées ?
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmBulkDeleteFormations(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                onClick={doBulkDeleteFormations}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white font-black text-xs rounded-xl shadow-sm transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
