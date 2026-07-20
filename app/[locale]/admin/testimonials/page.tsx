'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Loader2,
  MessageSquare,
  RefreshCw,
  Reply,
  Search,
  SortAsc,
  SortDesc,
  Star,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  title: string | null
  quote: string
  location: string | null
  rating: number | null
  status: 'pending' | 'approved' | 'rejected'
  approved: boolean
  adminReply: string | null
  showName: boolean
  showPhoto: boolean
  photoUrl: string | null
  createdAt: string
  publishedAt: string | null
  formation: { id: number; title: string } | null
  session: { id: number; startDate: string; location: string } | null
  student: { id: string; firstName: string; lastName: string; email: string } | null
}

interface PaginatedResponse {
  items: Testimonial[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Approuvé & Publié
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
        <XCircle className="h-3 w-3" /> Refusé
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
      <Loader2 className="h-3 w-3 animate-spin" /> En attente
    </span>
  )
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-slate-400">—</span>
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
          }`}
        />
      ))}
    </span>
  )
}

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl)
    return (
      <img
        src={photoUrl}
        alt={name}
        className="h-9 w-9 rounded-full border border-slate-200 object-cover"
      />
    )
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cj-blue)] text-xs font-bold text-white shadow-sm">
      {initials}
    </div>
  )
}

export default function AdminTestimonialsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setAL] = useState<number | null>(null)

  // Filters
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDS] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Modal state
  const [selected, setSelected] = useState<Testimonial | null>(null)
  const [modalMode, setModalMode] = useState<
    'view' | 'reply' | 'edit' | 'delete' | null
  >(null)
  const [replyText, setReplyText] = useState('')
  const [editQuote, setEditQuote] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(
    null
  )

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDS(search)
      setPage(1)
    }, 350)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        status,
        search: debouncedSearch,
        sortBy,
        sortDir,
        page: String(page),
        pageSize: '20',
      })
      const res = await fetch(`/api/admin/testimonials?${qs}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [status, debouncedSearch, sortBy, sortDir, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function openModal(item: Testimonial, mode: typeof modalMode) {
    setSelected(item)
    setModalMode(mode)
    setReplyText(item.adminReply || '')
    setEditQuote(item.quote)
    setEditTitle(item.title || '')
  }

  function closeModal() {
    setSelected(null)
    setModalMode(null)
  }

  async function doAction(id: number, action: string, extra?: object) {
    setAL(id)
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast(payload.error || 'Erreur serveur', 'err')
        return
      }
      showToast(
        action === 'approve'
          ? 'Témoignage approuvé et publié sur le site.'
          : action === 'reject'
          ? 'Témoignage refusé.'
          : action === 'reply'
          ? 'Réponse envoyée à l\'étudiant.'
          : action === 'edit'
          ? 'Témoignage mis à jour.'
          : 'Opération réussie.'
      )
      closeModal()
      fetchData()
    } finally {
      setAL(null)
    }
  }

  async function doDelete(id: number) {
    setAL(id)
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        showToast('Suppression impossible.', 'err')
        return
      }
      showToast('Témoignage supprimé définitivement.')
      closeModal()
      fetchData()
    } finally {
      setAL(null)
    }
  }

  const TABS = [
    { key: 'all', label: 'Tous' },
    { key: 'pending', label: 'En attente' },
    { key: 'approved', label: 'Approuvés' },
    { key: 'rejected', label: 'Refusés' },
  ]

  return (
    <AdminShell title="Témoignages">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              Gestion des témoignages étudiants
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Modérez, validez, répondez et publiez les témoignages sur la page d'accueil.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Actualiser
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatus(tab.key)
                setPage(1)
              }}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                status === tab.key
                  ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[var(--cj-blue)] hover:text-[var(--cj-blue)]'
              }`}
            >
              {tab.label}
              {tab.key === 'all' && data && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${
                    status === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {data.total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher par nom d'étudiant, formation, texte..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-[var(--cj-blue)]/10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[var(--cj-blue)]"
          >
            <option value="createdAt">Trier par date</option>
            <option value="rating">Trier par note</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
            title={
              sortDir === 'desc'
                ? 'Plus récents en premier'
                : 'Plus anciens en premier'
            }
          >
            {sortDir === 'desc' ? (
              <SortDesc className="h-4 w-4" />
            ) : (
              <SortAsc className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--cj-blue)]" />
          </div>
        ) : !data?.items.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Aucun témoignage trouvé
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Modifiez vos critères de recherche ou attendez de nouvelles soumissions.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Étudiant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Formation / Session
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Témoignage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Note
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={
                            item.showName
                              ? item.name
                              : item.student
                              ? `${item.student.firstName} ${item.student.lastName}`
                              : item.name
                          }
                          photoUrl={
                            item.showPhoto
                              ? item.photoUrl
                              : null
                          }
                        />
                        <div>
                          <p className="font-semibold leading-tight text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.student?.email ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium leading-tight text-slate-800">
                        {item.formation?.title ?? '—'}
                      </p>
                      {item.session?.startDate && (
                        <p className="text-[11px] text-slate-400">
                          {new Date(item.session.startDate).toLocaleDateString(
                            'fr-FR',
                            { month: 'short', year: 'numeric' }
                          )}
                          {item.session.location
                            ? ` · ${item.session.location}`
                            : ''}
                        </p>
                      )}
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      {item.title && (
                        <p className="mb-0.5 text-xs font-semibold text-slate-900">
                          {item.title}
                        </p>
                      )}
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                        « {item.quote} »
                      </p>
                      {item.adminReply && (
                        <p className="mt-1 text-[10px] font-semibold text-[var(--cj-blue)]">
                          ↩ Réponse envoyée
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={item.rating} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="whitespace-nowrap text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(item, 'view')}
                          title="Consulter le détail"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[var(--cj-blue)]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => doAction(item.id, 'approve')}
                            title="Approuver et publier"
                            disabled={actionLoading === item.id}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => doAction(item.id, 'reject')}
                            title="Refuser"
                            disabled={actionLoading === item.id}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(item, 'reply')}
                          title="Répondre à l'étudiant"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-[var(--cj-blue)]"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(item, 'edit')}
                          title="Corriger l'orthographe"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(item, 'delete')}
                          title="Supprimer définitivement"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pageCount > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} sur{' '}
              {data.total} témoignages
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(data.pageCount, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2
                if (p < 1 || p > data.pageCount) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition ${
                      p === page
                        ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(data.pageCount, p + 1))}
                disabled={page === data.pageCount}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selected && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-black text-slate-900">
                {modalMode === 'view' && 'Détail du témoignage'}
                {modalMode === 'reply' && 'Répondre à l\'étudiant'}
                {modalMode === 'edit' && 'Corriger le témoignage (fautes mineures)'}
                {modalMode === 'delete' && 'Supprimer définitivement'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
              {/* VIEW */}
              {modalMode === 'view' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={selected.name}
                      photoUrl={selected.photoUrl}
                    />
                    <div>
                      <p className="font-bold text-slate-900">{selected.name}</p>
                      <p className="text-xs text-slate-400">
                        {selected.student?.email ?? '—'}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  {selected.formation && (
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Formation :</span>{' '}
                      {selected.formation.title}
                    </p>
                  )}
                  {selected.session?.startDate && (
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Session :</span>{' '}
                      {new Date(selected.session.startDate).toLocaleDateString(
                        'fr-FR'
                      )}{' '}
                      {selected.session.location
                        ? `· ${selected.session.location}`
                        : ''}
                    </p>
                  )}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    {selected.title && (
                      <p className="mb-1 text-sm font-bold text-slate-800">
                        {selected.title}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-slate-700">
                      « {selected.quote} »
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <StarRating rating={selected.rating} />
                    <span>
                      Soumis le{' '}
                      {new Date(selected.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    {selected.publishedAt && (
                      <span>
                        Publié le{' '}
                        {new Date(selected.publishedAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  {selected.adminReply && (
                    <div className="rounded-xl border border-[var(--cj-blue)]/20 bg-blue-50 p-3">
                      <p className="mb-1 text-xs font-bold text-[var(--cj-blue)]">
                        Réponse envoyée par l'administration
                      </p>
                      <p className="text-sm text-slate-700">
                        {selected.adminReply}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selected.status !== 'approved' && (
                      <button
                        onClick={() => doAction(selected.id, 'approve')}
                        disabled={!!actionLoading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approuver et publier
                      </button>
                    )}
                    {selected.status !== 'rejected' && (
                      <button
                        onClick={() => doAction(selected.id, 'reject')}
                        disabled={!!actionLoading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Refuser
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* REPLY */}
              {modalMode === 'reply' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      Témoignage de {selected.name}
                    </p>
                    <p className="line-clamp-3 text-sm text-slate-700">
                      « {selected.quote} »
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                      Votre réponse à l'étudiant
                    </label>
                    <textarea
                      rows={5}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Rédigez votre réponse officielle..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-[var(--cj-blue)]/10"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Cette réponse apparaîtra dans l'Espace Étudiant et sera transmise par e-mail.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={closeModal}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() =>
                        doAction(selected.id, 'reply', { adminReply: replyText })
                      }
                      disabled={!replyText.trim() || !!actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-50"
                    >
                      {actionLoading === selected.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Reply className="h-4 w-4" />
                      )}
                      Envoyer la réponse
                    </button>
                  </div>
                </div>
              )}

              {/* EDIT */}
              {modalMode === 'edit' && (
                <div className="space-y-3">
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-slate-600">
                    <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-amber-600" />
                    Correcteur éditorial : seules les corrections de forme (orthographe, grammaire) sont recommandées.
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                      Titre du témoignage
                    </label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-[var(--cj-blue)]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                      Contenu du témoignage
                    </label>
                    <textarea
                      rows={6}
                      value={editQuote}
                      onChange={(e) => setEditQuote(e.target.value)}
                      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-[var(--cj-blue)]/10"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={closeModal}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() =>
                        doAction(selected.id, 'edit', {
                          quote: editQuote,
                          title: editTitle,
                        })
                      }
                      disabled={!editQuote.trim() || !!actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
                    >
                      {actionLoading === selected.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit3 className="h-4 w-4" />
                      )}
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              )}

              {/* DELETE */}
              {modalMode === 'delete' && (
                <div className="space-y-4 py-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Supprimer ce témoignage ?
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                      Cette action retirera définitivement ce témoignage du site et de la base de données.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={closeModal}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => doDelete(selected.id)}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === selected.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Supprimer définitivement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all ${
            toast.type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'ok' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}
    </AdminShell>
  )
}
