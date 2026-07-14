'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  PlusIcon, SearchIcon, Filter, Edit, Trash, Eye, Download,
  BookOpen, Clock, Users, TargetIcon, StarIcon, ChevronRight,
  UserIcon, XIcon, AlertCircle, Copy, RotateCw, CheckSquare,
  SquareIcon, ChevronLeft, ChevronDown
} from 'lucide-react'
import SessionsManagerModal from '@/components/admin/SessionsManagerModal'

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

const ITEMS_PER_PAGE = 9

const STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700 border-gray-200',
  publie:    'bg-green-100 text-green-700 border-green-200',
  archive:   'bg-orange-100 text-orange-700 border-orange-200',
}
const STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  publie:    'Publié',
  archive:   'Archivé',
}

export default function AdminFormationsPage() {
  const router = useRouter()

  // ── Data ────────────────────────────────────────────────────────────────────
  const [formations, setFormations]     = useState<Formation[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [sessionMgmtFormation, setSessionMgmtFormation] = useState<Formation | null>(null)
  const [showSelectFormationForSession, setShowSelectFormationForSession] = useState(false)

  // ── Filters / sort ──────────────────────────────────────────────────────────
  const [search, setSearch]             = useState('')
  const [catFilter, setCatFilter]       = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy]             = useState('created')
  const [showFilters, setShowFilters]   = useState(false)

  // ── Selection / pagination ──────────────────────────────────────────────────
  const [selected, setSelected]         = useState<number[]>([])
  const [page, setPage]                 = useState(1)

  // ── Action modals ────────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState<Formation | null>(null)
  const [confirmBulk, setConfirmBulk]     = useState(false)

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadFormations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/formations?status=all')
      if (!res.ok) throw new Error('Impossible de charger les formations')
      const data = await res.json()
      setFormations(data.formations ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadFormations() }, [loadFormations])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const action = params.get('action')
      const paramFormationId = params.get('formationId') || params.get('manageSessionsFor')

      if (action === 'create-session' || params.get('createSession') === 'true') {
        setShowSelectFormationForSession(true)
        // Nettoyer l'URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      } else if (paramFormationId && formations.length > 0) {
        const found = formations.find(f => f.id === Number(paramFormationId))
        if (found) {
          setSessionMgmtFormation(found)
        }
        // Nettoyer l'URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [formations])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived: filtered + sorted ───────────────────────────────────────────────
  const filtered = formations
    .filter(f => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        (f.tags ?? []).some(t => t.toLowerCase().includes(q))
      const matchCat    = catFilter    === 'all' || f.categorie === catFilter
      const matchStatus = statusFilter === 'all' || f.statut    === statusFilter
      return matchSearch && matchCat && matchStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':  return a.title.localeCompare(b.title)
        case 'title-desc': return b.title.localeCompare(a.title)
        case 'students':   return (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0)
        case 'rating':     return (b.rating ?? 0) - (a.rating ?? 0)
        case 'price-asc':  return (a.price ?? 0) - (b.price ?? 0)
        case 'price-desc': return (b.price ?? 0) - (a.price ?? 0)
        default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage    = Math.min(page, totalPages)
  const paginated   = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  // Dynamic categories from data
  const categoryOptions = [
    { id: 'all', label: 'Toutes les catégories', count: formations.length },
    ...Array.from(new Set(formations.map(f => f.categorie).filter(Boolean))).map(cat => ({
      id: cat as string,
      label: (cat as string).charAt(0).toUpperCase() + (cat as string).slice(1).replace(/-/g, ' '),
      count: formations.filter(f => f.categorie === cat).length,
    })),
  ]
  const statusOptions = [
    { id: 'all',       label: 'Tous les statuts', count: formations.length },
    { id: 'publie',    label: 'Publié',            count: formations.filter(f => f.statut === 'publie').length },
    { id: 'brouillon', label: 'Brouillon',         count: formations.filter(f => f.statut === 'brouillon').length },
    { id: 'archive',   label: 'Archivé',           count: formations.filter(f => f.statut === 'archive').length },
  ]

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  async function doDelete(id: number) {
    try {
      const res = await fetch(`/api/formations/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur lors de la suppression')
      }
      setSelected(s => s.filter(x => x !== id))
      await loadFormations()
      showToast('Formation supprimée avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setConfirmDelete(null)
    }
  }

  async function doBulkDelete() {
    try {
      await Promise.all(selected.map(id => fetch(`/api/formations/${id}`, { method: 'DELETE' })))
      setSelected([])
      await loadFormations()
      showToast(`${selected.length} formation(s) supprimée(s)`)
    } catch {
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setConfirmBulk(false)
    }
  }

  async function doDuplicate(f: Formation) {
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
      await loadFormations()
      showToast('Formation dupliquée (brouillon créé)')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  async function doTogglePublish(f: Formation) {
    const newStatut = f.statut === 'publie' ? 'brouillon' : 'publie'
    try {
      const res = await fetch(`/api/formations/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut }),
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      await loadFormations()
      showToast(newStatut === 'publie' ? 'Formation publiée' : 'Formation dépubliée')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  function doExportCSV() {
    const headers = ['ID', 'Titre', 'Catégorie', 'Statut', 'Niveau', 'Prix', 'Étudiants', 'Note', 'Créé le']
    const rows = filtered.map(f => [
      f.id, `"${f.title}"`, f.categorie ?? '', f.statut, f.level ?? '',
      f.price ?? '', f.enrollmentCount ?? '', f.rating ?? '',
      new Date(f.createdAt).toLocaleDateString('fr-FR'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `formations-${Date.now()}.csv` })
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Selection helpers ────────────────────────────────────────────────────────
  const toggleOne = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const togglePage = () =>
    setSelected(s => s.length === paginated.length ? [] : paginated.map(f => f.id))
  const allPageSelected = paginated.length > 0 && paginated.every(f => selected.includes(f.id))

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {toast.msg}
          <button onClick={() => setToast(null)}><XIcon className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Supprimer la formation</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>"{confirmDelete.title}"</strong> ?
              Cette action est irréversible si aucune session n'est liée.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => doDelete(confirmDelete.id)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Bulk Delete Modal ── */}
      {confirmBulk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Suppression multiple</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Supprimer <strong>{selected.length} formation(s)</strong> sélectionnée(s) ?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmBulk(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={doBulkDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Back + Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/admin/dashboard"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors text-sm">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Tableau de bord</span>
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-bold text-gray-900">Formations</h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                {formations.length}
              </span>
            </div>

            {/* SearchIcon */}
            <div className="flex-1 max-w-md relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une formation…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                  showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtres</span>
                {(catFilter !== 'all' || statusFilter !== 'all') && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>

              <button onClick={loadFormations}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                title="Actualiser">
                <RotateCw className="w-4 h-4" />
              </button>

              <button onClick={doExportCSV}
                className="hidden sm:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>

              {selected.length > 0 && (
                <button onClick={() => setConfirmBulk(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                  <Trash className="w-4 h-4" />
                  <span>{selected.length}</span>
                </button>
              )}

              <Link href="/admin/formations/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvelle formation</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Filters Bar ── */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
                <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
                  {categoryOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.label} ({c.count})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
                  {statusOptions.map(s => (
                    <option key={s.id} value={s.id}>{s.label} ({s.count})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Trier par</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
                  <option value="created">PlusIcon récent</option>
                  <option value="title-asc">Titre A → Z</option>
                  <option value="title-desc">Titre Z → A</option>
                  <option value="students">PlusIcon populaire</option>
                  <option value="rating">Mieux noté</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>
              <button onClick={() => { setCatFilter('all'); setStatusFilter('all'); setSortBy('created'); setPage(1) }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-4">
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Summary bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filtered.length}</span> formation
            {filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
            {search && <span className="ml-1 text-gray-400">pour « {search} »</span>}
          </p>
          {selected.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-blue-600 font-medium">{selected.length} sélectionnée(s)</span>
              <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-600">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Select all page */}
        {paginated.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button onClick={togglePage}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              {allPageSelected
                ? <CheckSquare className="w-4 h-4 text-blue-600" />
                : <SquareIcon className="w-4 h-4" />}
              Sélectionner cette page
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
                <div className="h-36 bg-gray-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gray-200 rounded-lg flex-1" />
                    <div className="h-8 bg-gray-200 rounded-lg w-10" />
                    <div className="h-8 bg-gray-200 rounded-lg w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-500 mb-6 max-w-sm">{error}</p>
            <button onClick={loadFormations}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              <RotateCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-500 mb-6">
              {formations.length === 0
                ? "Commencez par créer votre première formation."
                : "Aucun résultat pour ces critères. Modifiez votre recherche ou vos filtres."}
            </p>
            <div className="flex gap-3">
              {(search || catFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setCatFilter('all'); setStatusFilter('all') }}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Réinitialiser les filtres
                </button>
              )}
              <Link href="/admin/formations/new"
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                <PlusIcon className="w-4 h-4" />
                Créer une formation
              </Link>
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        {!isLoading && !error && paginated.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(f => (
              <FormationAdminCard
                key={f.id}
                formation={f}
                isSelected={selected.includes(f.id)}
                onSelect={() => toggleOne(f.id)}
                onEdit={() => router.push(`/admin/formations/${f.id}/edit`)}
                onDelete={() => setConfirmDelete(f)}
                onDuplicate={() => doDuplicate(f)}
                onTogglePublish={() => doTogglePublish(f)}
                onManageSessions={() => setSessionMgmtFormation(f)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {safePage} sur {totalPages} —{' '}
              {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce<(number | '…')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === '…'
                    ? <span key={`e${i}`} className="px-2 text-gray-400">…</span>
                    : (
                      <button key={n} onClick={() => setPage(n as number)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                          safePage === n
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        {n}
                      </button>
                    )
                )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {sessionMgmtFormation && (
        <SessionsManagerModal
          formationId={sessionMgmtFormation.id}
          formationTitle={sessionMgmtFormation.title}
          onClose={() => setSessionMgmtFormation(null)}
          onSuccess={() => {
            loadFormations()
            showToast('Session enregistrée avec succès !', 'success')
          }}
        />
      )}

      {showSelectFormationForSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Sélectionner une formation</span>
              </h3>
              <button
                onClick={() => setShowSelectFormationForSession(false)}
                className="rounded-full p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">
              Veuillez sélectionner la formation pour laquelle vous souhaitez créer ou gérer une session.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {formations.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">Aucune formation disponible.</p>
              ) : (
                formations.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSessionMgmtFormation(f)
                      setShowSelectFormationForSession(false)
                    }}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition truncate">{f.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{f.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition shrink-0 ml-2" />
                  </button>
                ))
              )}
            </div>

            <div className="mt-6 border-t pt-4 flex justify-end">
              <button
                onClick={() => setShowSelectFormationForSession(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── FormationAdminCard ───────────────────────────────────────────────────────
interface CardProps {
  formation: Formation
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onTogglePublish: () => void
  onManageSessions: () => void
}

function FormationAdminCard({ formation: f, isSelected, onSelect, onEdit, onDelete, onDuplicate, onTogglePublish, onManageSessions }: CardProps) {
  const params = useParams()
  const locale = params?.locale as string || 'fr'
  const [showMenu, setShowMenu] = useState(false)
  const statusColor = STATUS_COLORS[f.statut] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const statusLabel = STATUS_LABELS[f.statut] ?? f.statut

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col border-2 ${
      isSelected ? 'border-blue-500' : 'border-transparent'
    }`}>
      {/* Image / placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        {f.imageUrl ? (
          <img src={f.imageUrl} alt={f.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-12 h-12 text-blue-300" />
        )}

        {/* Checkbox */}
        <button onClick={onSelect}
          className="absolute top-3 left-3 w-7 h-7 rounded-lg border-2 border-white bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors">
          {isSelected
            ? <CheckSquare className="w-5 h-5 text-blue-600" />
            : <SquareIcon className="w-5 h-5 text-gray-400" />}
        </button>

        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category + rating */}
        <div className="flex items-center justify-between mb-2">
          {f.categorie ? (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium capitalize">
              {f.categorie.replace(/-/g, ' ')}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Sans catégorie</span>
          )}
          {f.rating ? (
            <div className="flex items-center gap-1">
              <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="text-xs font-medium text-gray-700">{f.rating.toFixed(1)}</span>
              {f.reviewCount ? <span className="text-xs text-gray-400">({f.reviewCount})</span> : null}
            </div>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 leading-snug">{f.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{f.description}</p>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
          {f.duree && (
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <Clock className="w-3 h-3" />{f.duree}
            </span>
          )}
          {f.enrollmentCount !== undefined && (
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <Users className="w-3 h-3" />{f.enrollmentCount} inscrit(s)
            </span>
          )}
          {f.price !== undefined && (
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded font-medium text-blue-700">
              ${f.price}
            </span>
          )}
          {f.nextSession?.startDate && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
              ▶ {new Date(f.nextSession.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Instructor */}
        {f.instructor && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-blue-600" />
            </div>
            <span className="truncate">{f.instructor.firstName} {f.instructor.lastName}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
          {/* Publish toggle */}
          <button onClick={onTogglePublish}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              f.statut === 'publie'
                ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}>
            {f.statut === 'publie' ? 'Dépublier' : 'Publier'}
          </button>

          <button onClick={onManageSessions}
            className="flex-1 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors">
            Sessions
          </button>

          <button onClick={onEdit}
            className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Modifier">
            <Edit className="w-4 h-4" />
          </button>

          <Link href={`/${locale}/formations/${f.slug}`} target="_blank"
            className="flex items-center justify-center w-9 h-9 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
            title="Voir sur le site">
            <Eye className="w-4 h-4" />
          </Link>

          {/* More menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)}
              className="flex items-center justify-center w-9 h-9 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 bottom-11 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-40">
                  <button onClick={() => { onDuplicate(); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Copy className="w-4 h-4 text-gray-400" />
                    Dupliquer
                  </button>
                  <button onClick={() => { onDelete(); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
