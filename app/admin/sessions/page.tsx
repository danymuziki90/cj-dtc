'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Copy,
  Users, Calendar, MapPin, Clock, ChevronDown,
  CheckCircle, XCircle, Lock, Unlock, Archive,
  BarChart2, BookOpen, TrendingUp, Loader2,
  CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight,
  GraduationCap, Globe, Monitor
} from 'lucide-react'

interface Session {
  id: number
  formationId: number
  formation: { id: number; title: string; slug: string; categorie?: string }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  maxParticipants: number
  currentParticipants: number
  status: string
  description?: string
  objectives?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  enrollments: { id: number }[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  ouverte:  { label: 'Ouverte',    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',   icon: CheckCircle },
  fermee:   { label: 'Fermée',     color: 'bg-amber-100 text-amber-800 border-amber-200',          icon: Lock },
  complete: { label: 'Complète',   color: 'bg-blue-100 text-blue-800 border-blue-200',             icon: Users },
  terminee: { label: 'Terminée',   color: 'bg-slate-100 text-slate-700 border-slate-200',          icon: CheckCircle2 },
  annulee:  { label: 'Annulée',    color: 'bg-red-100 text-red-800 border-red-200',                icon: XCircle },
  archive:  { label: 'Archivée',   color: 'bg-gray-100 text-gray-600 border-gray-200',             icon: Archive },
  brouillon:{ label: 'Brouillon',  color: 'bg-purple-100 text-purple-800 border-purple-200',       icon: Edit },
}

const FORMAT_LABELS: Record<string, string> = {
  presentiel: 'Présentiel',
  distanciel: 'Distanciel',
  hybride:    'Hybride',
}

const FORMAT_ICONS: Record<string, React.FC<any>> = {
  presentiel: MapPin,
  distanciel: Monitor,
  hybride:    Globe,
}

const ITEMS_PER_PAGE = 12

export default function AdminSessionsPage() {
  const router = useRouter()

  // ── Data ──────────────────────────────────────────────────────────────────
  const [sessions, setSessions]       = useState<Session[]>([])
  const [formations, setFormations]   = useState<{ id: number; title: string }[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [formatFilter, setFormatFilter]   = useState('all')
  const [formationFilter, setFormationFilter] = useState('all')
  const [sortBy, setSortBy]               = useState('date-desc')
  const [showFilters, setShowFilters]     = useState(false)
  const [page, setPage]                   = useState(1)

  // ── Modals ────────────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete]       = useState<Session | null>(null)
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false)
  const [viewStudents, setViewStudents]         = useState<Session | null>(null)
  const [showEditModal, setShowEditModal]        = useState<Session | null>(null)

  // ── Create / Edit form ────────────────────────────────────────────────────
  const [showForm, setShowForm]         = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [formLoading, setFormLoading]   = useState(false)
  const [customQuestions, setCustomQuestions] = useState<any[]>([])
  const [importSessionId, setImportSessionId] = useState<string>('')
  const [formData, setFormData]         = useState({
    formationId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    format: 'presentiel',
    maxParticipants: 25,
    description: '',
    objectives: '',
    status: 'ouverte',
  })

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [sessRes, formRes] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/formations?status=all'),
      ])
      if (!sessRes.ok) throw new Error('Impossible de charger les sessions')
      const sessData = await sessRes.json()
      setSessions(Array.isArray(sessData) ? sessData : [])
      if (formRes.ok) {
        const formData = await formRes.json()
        setFormations(formData.formations ?? [])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('action') === 'create-session' || params.get('createSession') === 'true') {
        openCreate()
        // Nettoyer l'URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [sessions])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return sessions
      .filter(s => {
        const q = search.toLowerCase()
        const matchSearch =
          !q ||
          s.formation?.title?.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
        const matchStatus    = statusFilter    === 'all' || s.status === statusFilter
        const matchFormat    = formatFilter    === 'all' || s.format === formatFilter
        const matchFormation = formationFilter === 'all' || String(s.formationId) === formationFilter
        return matchSearch && matchStatus && matchFormat && matchFormation
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-asc':  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          case 'date-desc': return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          case 'fill':      return (b.currentParticipants / b.maxParticipants) - (a.currentParticipants / a.maxParticipants)
          case 'alpha':     return a.formation?.title?.localeCompare(b.formation?.title)
          default:          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
  }, [sessions, search, statusFilter, formatFilter, formationFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total     = sessions.length
    const ouvertes  = sessions.filter(s => s.status === 'ouverte').length
    const completes = sessions.filter(s => s.status === 'complete').length
    const terminees = sessions.filter(s => s.status === 'terminee').length
    const totalPlaces = sessions.reduce((sum, s) => sum + s.maxParticipants, 0)
    const totalInscrits = sessions.reduce((sum, s) => sum + (s.currentParticipants || 0), 0)
    const fillRate  = totalPlaces > 0 ? Math.round((totalInscrits / totalPlaces) * 100) : 0
    return { total, ouvertes, completes, terminees, fillRate, totalInscrits }
  }, [sessions])

  // ── CRUD ──────────────────────────────────────────────────────────────────
  async function doDelete(session: Session) {
    setConfirmDeleteLoading(true)
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur lors de la suppression')
      }
      await load()
      showToast('Session supprimée avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setConfirmDeleteLoading(false)
      setConfirmDelete(null)
    }
  }

  async function doToggleStatus(session: Session, newStatus: string) {
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour du statut')
      await load()
      showToast(`Session passée en : ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`)
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  async function doDuplicate(session: Session) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formationId: session.formationId,
          startDate: session.startDate,
          endDate: session.endDate,
          startTime: session.startTime,
          endTime: session.endTime,
          location: session.location,
          format: session.format,
          maxParticipants: session.maxParticipants,
          description: session.description,
          objectives: session.objectives,
          status: 'ouverte',
          duplicateFromSessionId: session.id,
        }),
      })
      if (!res.ok) throw new Error('Erreur lors de la duplication')
      await load()
      showToast('Session et questions dupliquées avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  function openCreate() {
    setEditingSession(null)
    setFormData({
      formationId: '',
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '17:00',
      location: '',
      format: 'presentiel',
      maxParticipants: 25,
      description: '',
      objectives: '',
      status: 'ouverte',
    })
    setCustomQuestions([])
    setImportSessionId('')
    setShowForm(true)
  }

  function openEdit(session: Session) {
    setEditingSession(session)
    setFormData({
      formationId: String(session.formationId),
      startDate: session.startDate.split('T')[0],
      endDate: session.endDate.split('T')[0],
      startTime: session.startTime ?? '09:00',
      endTime: session.endTime ?? '17:00',
      location: session.location ?? '',
      format: session.format,
      maxParticipants: session.maxParticipants,
      description: session.description ?? '',
      objectives: session.objectives ?? '',
      status: session.status,
    })
    setCustomQuestions([])
    setImportSessionId('')

    // Charger les questions personnalisées existantes
    fetch(`/api/sessions/${session.id}/form-questions`)
      .then(res => res.json())
      .then(data => {
        const parsed = Array.isArray(data) ? data.map(q => ({
          ...q,
          options: q.options ? JSON.parse(q.options) : [],
          fileTypes: q.fileTypes ? JSON.parse(q.fileTypes) : ['pdf', 'docx', 'jpg', 'png']
        })) : []
        setCustomQuestions(parsed)
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des questions:', err)
        setCustomQuestions([])
      })

    setShowForm(true)
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.formationId || !formData.startDate || !formData.endDate || !formData.location) {
      showToast('Veuillez remplir tous les champs obligatoires (*)', 'error')
      return
    }
    setFormLoading(true)
    try {
      const url = editingSession ? `/api/sessions/${editingSession.id}` : '/api/sessions'
      const method = editingSession ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          formationId: parseInt(formData.formationId),
          maxParticipants: Number(formData.maxParticipants),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur lors de la sauvegarde')
      }

      const savedSession = await res.json()
      const savedSessionId = savedSession.id

      // Sauvegarde des questions par lot (batch)
      const qRes = await fetch(`/api/sessions/${savedSessionId}/form-questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customQuestions.map((q) => ({
          id: q.id,
          label: q.label,
          type: q.type,
          helpText: q.helpText,
          required: q.required,
          options: q.options,
          fileTypes: q.fileTypes,
        })))
      })

      if (!qRes.ok) {
        throw new Error('La session a été enregistrée, mais erreur lors de la sauvegarde des questions.')
      }

      await load()
      setShowForm(false)
      showToast(editingSession ? 'Session et questions modifiées avec succès' : 'Session et questions créées avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Fill rate badge ───────────────────────────────────────────────────────
  function FillBadge({ session }: { session: Session }) {
    const pct = session.maxParticipants > 0
      ? Math.min(100, Math.round((session.currentParticipants / session.maxParticipants) * 100))
      : 0
    const color = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'
    return (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] font-black text-slate-700 tabular-nums">{pct}%</span>
      </div>
    )
  }

  return (
    <AdminShell title="Gestion des Sessions">
      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl animate-fade-in-up ${
          toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Administration · Pédagogie</p>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Gestion des Sessions</h1>
          <p className="text-xs text-slate-500 mt-1">Créez, administrez et pilotez toutes les sessions de formation.</p>
        </div>
        <button
          id="btn-create-session"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-700)] text-white text-sm font-black rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="h-5 w-5" />
          Créer une session
        </button>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
        {[
          { label: 'Total sessions', value: kpis.total, icon: Calendar, color: 'text-slate-800' },
          { label: 'Ouvertes', value: kpis.ouvertes, icon: CheckCircle, color: 'text-emerald-700' },
          { label: 'Complètes', value: kpis.completes, icon: Users, color: 'text-blue-700' },
          { label: 'Terminées', value: kpis.terminees, icon: CheckCircle2, color: 'text-slate-500' },
          { label: 'Inscrits total', value: kpis.totalInscrits, icon: GraduationCap, color: 'text-violet-700' },
          { label: 'Taux remplissage', value: `${kpis.fillRate}%`, icon: TrendingUp, color: kpis.fillRate >= 70 ? 'text-emerald-700' : 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par formation, lieu, description…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Format filter */}
            <select
              value={formatFilter}
              onChange={e => { setFormatFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              <option value="all">Tous les formats</option>
              {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Formation filter */}
            <select
              value={formationFilter}
              onChange={e => { setFormationFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              <option value="all">Toutes les formations</option>
              {formations.map(f => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
            >
              <option value="date-desc">Récentes d'abord</option>
              <option value="date-asc">Anciennes d'abord</option>
              <option value="fill">Taux de remplissage</option>
              <option value="alpha">Alphabétique</option>
            </select>

            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {filtered.length} session{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── ERROR ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-800 mb-6 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* ── TABLE ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-primary)]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Chargement des sessions…</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4 border border-slate-200/50">
              <Calendar className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-900">Aucune session trouvée</p>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {sessions.length === 0
                ? "Commencez par créer votre première session de formation."
                : "Essayez d'ajuster vos filtres de recherche."}
            </p>
            {sessions.length === 0 && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)] text-white text-xs font-black rounded-xl shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Créer ma première session
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4">Formation / Session</th>
                  <th className="px-5 py-4">Dates</th>
                  <th className="px-5 py-4">Format & Lieu</th>
                  <th className="px-5 py-4">Places</th>
                  <th className="px-5 py-4">Taux</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginated.map(session => {
                  const statusCfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG['ouverte']
                  const StatusIcon = statusCfg.icon
                  const FormatIcon = FORMAT_ICONS[session.format] ?? MapPin
                  const startFmt = new Date(session.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                  const endFmt   = new Date(session.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                  return (
                    <tr key={session.id} className="hover:bg-slate-50/40 transition group">
                      {/* Formation / Session */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 max-w-[260px]">
                          <p className="font-extrabold text-slate-900 truncate leading-tight">
                            {session.formation?.title ?? `Formation #${session.formationId}`}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            Session #{session.id}
                          </p>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                            {startFmt}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold pl-4">→ {endFmt}</p>
                          {session.startTime && (
                            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 pl-0">
                              <Clock className="h-3 w-3 text-slate-300" />
                              {session.startTime} – {session.endTime}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Format & Lieu */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <FormatIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-700">{FORMAT_LABELS[session.format] ?? session.format}</span>
                          </div>
                          {session.location && (
                            <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px]">
                              {session.location}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Places */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-black text-slate-800 tabular-nums">
                            {session.currentParticipants}
                          </span>
                          <span className="text-slate-400 font-semibold">/ {session.maxParticipants}</span>
                        </div>
                      </td>

                      {/* Taux */}
                      <td className="px-5 py-4">
                        <FillBadge session={session} />
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4">
                        <select
                          value={session.status}
                          onChange={e => doToggleStatus(session, e.target.value)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border focus:outline-none transition cursor-pointer ${statusCfg.color}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                          {/* Voir inscrits */}
                          <button
                            onClick={() => setViewStudents(session)}
                            className="p-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-800 rounded-lg transition"
                            title={`Voir les inscrits (${session.currentParticipants})`}
                          >
                            <Users className="h-3.5 w-3.5" />
                          </button>

                          {/* Voir détail */}
                          <Link
                            href={`/admin/sessions/${session.id}`}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                            title="Voir le détail"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          {/* Modifier */}
                          <button
                            onClick={() => openEdit(session)}
                            className="p-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 text-slate-600 hover:text-amber-700 rounded-lg transition"
                            title="Modifier la session"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Dupliquer */}
                          <button
                            onClick={() => doDuplicate(session)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                            title="Dupliquer la session"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => setConfirmDelete(session)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition"
                            title="Supprimer la session"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PAGINATION ──────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Préc.
          </button>
          <span className="text-xs font-bold text-slate-600">
            Page {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suiv. →
          </button>
        </div>
      )}

      {/* ── MODAL VOIR INSCRITS ─────────────────────────────────────────────── */}
      {viewStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Inscrits — {viewStudents.formation?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Session #{viewStudents.id} · {viewStudents.currentParticipants} / {viewStudents.maxParticipants} places
                </p>
              </div>
              <button
                onClick={() => setViewStudents(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {viewStudents.enrollments && viewStudents.enrollments.length > 0 ? (
                <EnrollmentsList sessionId={viewStudents.id} />
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <GraduationCap className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-bold text-slate-600">Aucun inscrit pour l'instant</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMER SUPPRESSION ─────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Supprimer la session ?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Session #{confirmDelete.id} — <strong>{confirmDelete.formation?.title}</strong>
                </p>
                <p className="text-xs text-red-600 font-semibold mt-2">
                  Cette action supprimera également toutes les inscriptions associées. Cette opération est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
                disabled={confirmDeleteLoading}
              >
                Annuler
              </button>
              <button
                onClick={() => doDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2"
                disabled={confirmDeleteLoading}
              >
                {confirmDeleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CRÉER / MODIFIER SESSION ─────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 relative max-h-[92vh] overflow-y-auto animate-fade-in-up my-4">
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
            >
              <XCircle className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {editingSession ? 'Modifier la session' : 'Nouvelle session'}
              </p>
              <h2 className="text-xl font-black text-slate-900">
                {editingSession
                  ? `Session #${editingSession.id} — ${editingSession.formation?.title}`
                  : '📅 Créer une nouvelle session de formation'}
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Formation */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Formation concernée *
                </label>
                <select
                  id="session-form-formation"
                  value={formData.formationId}
                  onChange={e => setFormData(p => ({ ...p, formationId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                  required
                >
                  <option value="">— Sélectionner la formation —</option>
                  {formations.map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date de début *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date de fin *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                  required
                />
              </div>

              {/* Heures */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Heure de début</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Heure de fin</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                />
              </div>

              {/* Lieu */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Lieu / Lien de connexion *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="ex. Kinshasa — Salle A, ou https://meet.google.com/xxx"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                  required
                />
              </div>

              {/* Format & Capacité */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Format</label>
                <select
                  value={formData.format}
                  onChange={e => setFormData(p => ({ ...p, format: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                >
                  <option value="presentiel">Présentiel</option>
                  <option value="distanciel">Distanciel</option>
                  <option value="hybride">Hybride</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Capacité max (places)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={formData.maxParticipants}
                  onChange={e => setFormData(p => ({ ...p, maxParticipants: parseInt(e.target.value) || 25 }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Statut</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none font-bold text-slate-800"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description (optionnel)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Décrivez le contenu ou les particularités de cette session…"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none"
                />
              </div>

              {/* Objectifs */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Objectifs pédagogiques (optionnel)</label>
                <textarea
                  rows={2}
                  value={formData.objectives}
                  onChange={e => setFormData(p => ({ ...p, objectives: e.target.value }))}
                  placeholder="À l'issue de cette session, les participants seront capables de…"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:outline-none"
                />
              </div>

              {/* Formulaire de questions personnalisées */}
              <div className="md:col-span-2 border-t border-slate-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Formulaire d'inscription personnalisé</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Configurez des questions spécifiques pour les étudiants s'inscrivant à cette session.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Importer depuis une autre session */}
                    {sessions.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={importSessionId}
                          onChange={(e) => setImportSessionId(e.target.value)}
                          className="px-2 py-1.5 text-[10px] border border-slate-200 bg-white rounded-lg focus:outline-none font-bold text-slate-600 max-w-[150px]"
                        >
                          <option value="">-- Importer depuis... --</option>
                          {sessions
                            .filter(s => s.id !== (editingSession?.id ?? -1))
                            .map(s => (
                              <option key={s.id} value={s.id}>
                                #{s.id} - {s.formation?.title || 'Session'}
                              </option>
                            ))
                          }
                        </select>
                        <button
                          type="button"
                          disabled={!importSessionId}
                          onClick={async () => {
                            if (!confirm("Voulez-vous importer les questions de cette session ? Cela remplacera les questions actuelles.")) return
                            try {
                              const r = await fetch(`/api/sessions/${importSessionId}/form-questions`)
                              if (r.ok) {
                                const qData = await r.json()
                                const parsed = Array.isArray(qData) ? qData.map(q => ({
                                  label: q.label,
                                  type: q.type,
                                  helpText: q.helpText,
                                  required: q.required,
                                  options: q.options ? JSON.parse(q.options) : [],
                                  fileTypes: q.fileTypes ? JSON.parse(q.fileTypes) : []
                                })) : []
                                setCustomQuestions(parsed)
                                showToast("Questions importées avec succès")
                              } else {
                                showToast("Erreur lors de l'import", "error")
                              }
                            } catch {
                              showToast("Erreur lors de l'import", "error")
                            }
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg hover:bg-slate-200 disabled:opacity-50"
                        >
                          Copier
                        </button>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setCustomQuestions(prev => [
                          ...prev,
                          {
                            label: '',
                            type: 'text_short',
                            helpText: '',
                            required: false,
                            options: [],
                            fileTypes: ['pdf', 'docx', 'jpg', 'png']
                          }
                        ])
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 text-xs font-bold rounded-lg transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter une question
                    </button>
                  </div>
                </div>

                {customQuestions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-xs text-slate-400">
                    Aucune question personnalisée définie pour cette session. Les étudiants répondront uniquement au formulaire d'inscription général.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customQuestions.map((q, index) => {
                      const updateQuestion = (updates: any) => {
                        setCustomQuestions(prev => prev.map((item, idx) => idx === index ? { ...item, ...updates } : item))
                      }

                      const moveQuestion = (dir: 'up' | 'down') => {
                        if (dir === 'up' && index === 0) return
                        if (dir === 'down' && index === customQuestions.length - 1) return
                        const targetIdx = dir === 'up' ? index - 1 : index + 1
                        setCustomQuestions(prev => {
                          const list = [...prev]
                          const temp = list[index]
                          list[index] = list[targetIdx]
                          list[targetIdx] = temp
                          return list
                        })
                      }

                      const removeQuestion = () => {
                        setCustomQuestions(prev => prev.filter((_, idx) => idx !== index))
                      }

                      return (
                        <div key={index} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/20 space-y-3 relative group">
                          {/* Contrôles de position et suppression */}
                          <div className="absolute right-3 top-3 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveQuestion('up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Monter"
                            >
                              <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveQuestion('down')}
                              disabled={index === customQuestions.length - 1}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Descendre"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={removeQuestion}
                              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Libellé et Type */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-20">
                            <div className="md:col-span-8">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Libellé de la question *</label>
                              <input
                                type="text"
                                required
                                value={q.label}
                                onChange={e => updateQuestion({ label: e.target.value })}
                                placeholder="ex. Nom de votre entreprise, Années d'expérience, etc."
                                className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none font-bold text-slate-800"
                              />
                            </div>
                            <div className="md:col-span-4">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type de champ</label>
                              <select
                                value={q.type}
                                onChange={e => updateQuestion({ type: e.target.value, options: [], fileTypes: ['pdf', 'docx', 'jpg', 'png'] })}
                                className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none font-bold text-slate-800"
                              >
                                <option value="text_short">Réponse courte</option>
                                <option value="text_long">Paragraphe (texte long)</option>
                                <option value="number">Nombre</option>
                                <option value="date">Date</option>
                                <option value="yes_no">Oui / Non</option>
                                <option value="select">Liste déroulante</option>
                                <option value="radio">Choix unique (radio)</option>
                                <option value="checkbox">Choix multiple (cases à cocher)</option>
                                <option value="file_upload">Téléversement de fichier</option>
                              </select>
                            </div>
                          </div>

                          {/* Aide à la saisie (Help text) et Obligatoire */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-9">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Aide à la saisie (optionnel)</label>
                              <input
                                type="text"
                                value={q.helpText || ''}
                                onChange={e => updateQuestion({ helpText: e.target.value })}
                                placeholder="ex. Renseignez votre poste actuel de préférence"
                                className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none text-slate-600 font-semibold"
                              />
                            </div>
                            <div className="md:col-span-3 flex items-center h-full pt-4">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={q.required}
                                  onChange={e => updateQuestion({ required: e.target.checked })}
                                  className="accent-[var(--admin-primary)]"
                                />
                                <span className="text-xs font-bold text-slate-700">Obligatoire</span>
                              </label>
                            </div>
                          </div>

                          {/* Options dynamiques (pour select, radio, checkbox) */}
                          {['select', 'radio', 'checkbox'].includes(q.type) && (
                            <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-2">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Options du choix (séparées par des virgules)</label>
                              <input
                                type="text"
                                required
                                value={q.options.join(', ')}
                                onChange={e => {
                                  const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                  updateQuestion({ options: opts })
                                }}
                                placeholder="ex. Débutant, Intermédiaire, Avancé"
                                className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50/30 rounded-lg focus:outline-none font-semibold text-slate-700"
                              />
                              <p className="text-[9px] text-slate-400 font-medium">Saisissez les différentes options possibles en les séparant par des virgules.</p>
                            </div>
                          )}

                          {/* Types de fichiers (pour file_upload) */}
                          {q.type === 'file_upload' && (
                            <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-2">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Extensions de fichier autorisées</label>
                              <div className="flex flex-wrap gap-4">
                                {['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'].map((ext) => {
                                  const list = (q.fileTypes || []) as string[]
                                  const checked = list.includes(ext)
                                  return (
                                    <label key={ext} className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                          const newList = checked ? list.filter((t: string) => t !== ext) : [...list, ext]
                                          updateQuestion({ fileTypes: newList })
                                        }}
                                        className="accent-[var(--admin-primary)]"
                                      />
                                      .{ext.toUpperCase()}
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-700)] text-white font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {formLoading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</>
                    : <><CheckCircle2 className="h-3.5 w-3.5" /> {editingSession ? 'Mettre à jour' : 'Créer la session'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

// ── Sub-component: Enrollments list ────────────────────────────────────────
function EnrollmentsList({ sessionId }: { sessionId: number }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(data => setEnrollments(data.enrollments ?? []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  const active = enrollments.filter(e => !['waitlist', 'rejected', 'cancelled'].includes(e.status))

  if (active.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <GraduationCap className="h-10 w-10 mx-auto mb-2 text-slate-200" />
        <p className="text-sm font-bold text-slate-600">Aucun étudiant inscrit</p>
      </div>
    )
  }

  const STATUS_COLORS: Record<string, string> = {
    accepted:  'bg-emerald-100 text-emerald-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-slate-100 text-slate-700',
    pending:   'bg-amber-100 text-amber-800',
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 mb-3">{active.length} étudiant(s) inscrit(s)</p>
      {active.map((e: any) => (
        <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p className="font-bold text-slate-900 text-xs">{e.firstName} {e.lastName}</p>
            <p className="text-[10px] text-slate-500 font-semibold">{e.email}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${STATUS_COLORS[e.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {e.status}
          </span>
        </div>
      ))}
    </div>
  )
}
