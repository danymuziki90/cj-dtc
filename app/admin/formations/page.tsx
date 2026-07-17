'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  PlusIcon, SearchIcon, Filter, Edit, Trash, Eye,
  BookOpen, Clock, Users, TargetIcon, StarIcon, ChevronRight,
  UserIcon, XIcon, AlertCircle, Copy, RotateCw, CheckSquare,
  SquareIcon, ChevronLeft, ChevronDown, Calendar, MapPin,
  CheckCircle, XCircle, Archive, BarChart2, TrendingUp,
  Loader2, CheckCircle2, AlertTriangle, GraduationCap,
  Globe, Monitor
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

const SESSION_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  ouverte:  { label: 'Ouverte',    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',   icon: CheckCircle },
  fermee:   { label: 'Fermée',     color: 'bg-amber-100 text-amber-800 border-amber-200',          icon: Clock },
  complete: { label: 'Complète',   color: 'bg-blue-100 text-blue-800 border-blue-200',             icon: Users },
  terminee: { label: 'Terminée',   color: 'bg-slate-100 text-slate-700 border-slate-200',          icon: CheckCircle2 },
  annulee:  { label: 'Annulée',    color: 'bg-red-100 text-red-800 border-red-200',                icon: XCircle },
  archive:  { label: 'Archivée',   color: 'bg-gray-100 text-gray-600 border-gray-200',             icon: Archive },
  brouillon:{ label: 'Brouillon',  color: 'bg-purple-100 text-purple-800 border-purple-200',       icon: Edit },
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

const ITEMS_PER_PAGE = 9

export default function CombinedAdminFormationsPage() {
  const router = useRouter()
  const params = useParams()

  // ── Mode Switch ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'sessions' | 'templates'>('sessions')

  // ── Shared Data ────────────────────────────────────────────────────────────
  const [formations, setFormations]   = useState<Formation[]>([])
  const [sessions, setSessions]       = useState<Session[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // ── Sessions Filtering/Sorting ─────────────────────────────────────────────
  const [sessionSearch, setSessionSearch] = useState('')
  const [sessionStatusFilter, setSessionStatusFilter] = useState('all')
  const [sessionFormatFilter, setSessionFormatFilter] = useState('all')
  const [sessionFormationFilter, setSessionFormationFilter] = useState('all')
  const [sessionSortBy, setSessionSortBy] = useState('date-desc')
  const [sessionPage, setSessionPage] = useState(1)

  // ── Formations Filtering/Sorting ───────────────────────────────────────────
  const [formationSearch, setFormationSearch] = useState('')
  const [formationCatFilter, setFormationCatFilter] = useState('all')
  const [formationStatusFilter, setFormationStatusFilter] = useState('all')
  const [formationSortBy, setFormationSortBy] = useState('created')
  const [formationPage, setFormationPage] = useState(1)
  const [selectedFormations, setSelectedFormations] = useState<number[]>([])

  // ── Modals & Action States ─────────────────────────────────────────────────
  const [confirmDeleteFormation, setConfirmDeleteFormation] = useState<Formation | null>(null)
  const [confirmDeleteSession, setConfirmDeleteSession] = useState<Session | null>(null)
  const [confirmBulkDeleteFormations, setConfirmBulkDeleteFormations] = useState(false)
  const [viewSessionInscrits, setViewSessionInscrits] = useState<Session | null>(null)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [sessionFormLoading, setSessionFormLoading] = useState(false)

  // Session Form Fields
  const [sessionFormData, setSessionFormData] = useState({
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

  // ── Load Data ──────────────────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [formRes, sessRes] = await Promise.all([
        fetch('/api/formations?status=all'),
        fetch('/api/sessions'),
      ])
      if (!formRes.ok || !sessRes.ok) throw new Error('Impossible de charger les données administrateur')
      const formData = await formRes.json()
      const sessData = await sessRes.json()
      setFormations(formData.formations ?? [])
      setSessions(Array.isArray(sessData) ? sessData : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Query parameter router check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('action') === 'create-session' || urlParams.get('createSession') === 'true') {
        setActiveTab('sessions')
        openCreateSession()
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [formations])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived Sessions ───────────────────────────────────────────────────────
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => {
        const q = sessionSearch.toLowerCase()
        const matchSearch =
          !q ||
          s.formation?.title?.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
        const matchStatus    = sessionStatusFilter === 'all' || s.status === sessionStatusFilter
        const matchFormat    = sessionFormatFilter === 'all' || s.format === sessionFormatFilter
        const matchFormation = sessionFormationFilter === 'all' || String(s.formationId) === sessionFormationFilter
        return matchSearch && matchStatus && matchFormat && matchFormation
      })
      .sort((a, b) => {
        switch (sessionSortBy) {
          case 'date-asc':  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          case 'date-desc': return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          case 'fill':      return (b.currentParticipants / b.maxParticipants) - (a.currentParticipants / a.maxParticipants)
          case 'alpha':     return a.formation?.title?.localeCompare(b.formation?.title)
          default:          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
  }, [sessions, sessionSearch, sessionStatusFilter, sessionFormatFilter, sessionFormationFilter, sessionSortBy])

  const totalSessionPages = Math.max(1, Math.ceil(filteredSessions.length / ITEMS_PER_PAGE))
  const paginatedSessions = filteredSessions.slice((sessionPage - 1) * ITEMS_PER_PAGE, sessionPage * ITEMS_PER_PAGE)

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

  // ── CRUD - Sessions ────────────────────────────────────────────────────────
  async function doDeleteSession(session: Session) {
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur lors de la suppression de la session')
      await loadAllData()
      showToast('Session supprimée avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setConfirmDeleteSession(null)
    }
  }

  async function doToggleSessionStatus(session: Session, newStatus: string) {
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erreur de modification du statut')
      await loadAllData()
      showToast(`Statut de la session mis à jour en : ${newStatus}`)
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

  async function doDuplicateSession(session: Session) {
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
        }),
      })
      if (!res.ok) throw new Error('Impossible de dupliquer la session')
      await loadAllData()
      showToast('Session dupliquée avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    }
  }

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

  // ── Session Creation Form Handlers ─────────────────────────────────────────
  function openCreateSession() {
    setEditingSession(null)
    setSessionFormData({
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
    setShowSessionForm(true)
  }

  function openEditSession(session: Session) {
    setEditingSession(session)
    setSessionFormData({
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
    setShowSessionForm(true)
  }

  async function handleSessionFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionFormData.formationId || !sessionFormData.startDate || !sessionFormData.endDate || !sessionFormData.location) {
      showToast('Veuillez remplir tous les champs obligatoires (*)', 'error')
      return
    }
    setSessionFormLoading(true)
    try {
      const url = editingSession ? `/api/sessions/${editingSession.id}` : '/api/sessions'
      const method = editingSession ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionFormData,
          formationId: parseInt(sessionFormData.formationId),
          maxParticipants: Number(sessionFormData.maxParticipants),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erreur lors de la sauvegarde de la session')
      }
      await loadAllData()
      setShowSessionForm(false)
      showToast(editingSession ? 'Session modifiée avec succès' : 'Session créée avec succès')
    } catch (e: any) {
      showToast(e.message, 'error')
    } finally {
      setSessionFormLoading(false)
    }
  }

  // ── Session Filling Badge ──────────────────────────────────────────────────
  function FillBadge({ session }: { session: Session }) {
    const pct = session.maxParticipants > 0
      ? Math.min(100, Math.round((session.currentParticipants / session.maxParticipants) * 100))
      : 0
    const color = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'
    return (
      <div className="flex items-center gap-2 min-w-[90px]">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[10px] font-black text-slate-700 tabular-nums">{pct}%</span>
      </div>
    )
  }

  // ── Formations Multi-select ────────────────────────────────────────────────
  const toggleOneFormation = (id: number) => {
    setSelectedFormations(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }
  const toggleAllPageFormations = () => {
    const pageIds = paginatedFormations.map(f => f.id)
    const allSelected = pageIds.every(id => selectedFormations.includes(id))
    if (allSelected) {
      setSelectedFormations(s => s.filter(id => !pageIds.includes(id)))
    } else {
      setSelectedFormations(s => Array.from(new Set([...s, ...pageIds])))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl animate-fade-in-up ${
          toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pédagogie & Offre Académique</p>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            {activeTab === 'sessions' ? 'Planification des Sessions' : 'Catalogue des Formations'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'sessions' ? 'Administrez le calendrier des cohortes et le taux de remplissage des sessions' : 'Gérez les fiches formations et thématiques académiques'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-200/60 p-1 shadow-inner border border-slate-200/50">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'sessions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'templates' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Modèles de formations
            </button>
          </div>

          {activeTab === 'sessions' && (
            <button
              onClick={openCreateSession}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md transition"
            >
              <PlusIcon className="h-4 w-4" />
              Créer une session
            </button>
          )}
        </div>
      </div>

      {/* ── TAB CONTENT: SESSIONS ───────────────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Toolbar Sessions */}
          <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm md:flex-row md:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une session par formation, lieu…"
                value={sessionSearch}
                onChange={e => { setSessionSearch(e.target.value); setSessionPage(1) }}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sessionStatusFilter}
                onChange={e => { setSessionStatusFilter(e.target.value); setSessionPage(1) }}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(SESSION_STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <select
                value={sessionFormatFilter}
                onChange={e => { setSessionFormatFilter(e.target.value); setSessionPage(1) }}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
              >
                <option value="all">Tous les formats</option>
                {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              <select
                value={sessionFormationFilter}
                onChange={e => { setSessionFormationFilter(e.target.value); setSessionPage(1) }}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700 max-w-[200px]"
              >
                <option value="all">Toutes les formations</option>
                {formations.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>

              <select
                value={sessionSortBy}
                onChange={e => setSessionSortBy(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none font-bold text-slate-700"
              >
                <option value="date-desc">Plus récentes d'abord</option>
                <option value="date-asc">Plus anciennes d'abord</option>
                <option value="fill">Remplissage croissant</option>
                <option value="alpha">Alphabétique</option>
              </select>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="font-semibold text-xs uppercase tracking-wider">Chargement des sessions…</span>
              </div>
            ) : paginatedSessions.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p className="text-sm font-bold text-slate-900">Aucune session programmée</p>
                <p className="text-xs text-slate-500 mt-1">Créez votre première session pour ouvrir les inscriptions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-4">Session / Formation</th>
                      <th className="px-5 py-4">Dates</th>
                      <th className="px-5 py-4">Format & Lieu</th>
                      <th className="px-5 py-4">Inscrits</th>
                      <th className="px-5 py-4">Remplissage</th>
                      <th className="px-5 py-4">Statut</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedSessions.map(session => {
                      const statusCfg = SESSION_STATUS_CONFIG[session.status] ?? SESSION_STATUS_CONFIG['ouverte']
                      const FormatIcon = FORMAT_ICONS[session.format] ?? MapPin
                      return (
                        <tr key={session.id} className="hover:bg-slate-50/40 transition group">
                          <td className="px-5 py-4">
                            <div className="space-y-1 max-w-[280px]">
                              <p className="font-extrabold text-slate-900 truncate leading-tight">
                                {session.formation?.title ?? `Session #${session.id}`}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold">
                                Code Session: #{session.id}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-0.5 text-slate-700">
                              <p className="font-bold flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                {new Date(session.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold pl-4">
                                au {new Date(session.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <FormatIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-700">{FORMAT_LABELS[session.format] ?? session.format}</span>
                              </div>
                              {session.location && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{session.location}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800">
                            <span className="text-slate-900 font-black">{session.currentParticipants}</span> / <span className="text-slate-400">{session.maxParticipants}</span>
                          </td>
                          <td className="px-5 py-4">
                            <FillBadge session={session} />
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={session.status}
                              onChange={e => doToggleSessionStatus(session, e.target.value)}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border focus:outline-none transition cursor-pointer ${statusCfg.color}`}
                            >
                              {Object.entries(SESSION_STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => setViewSessionInscrits(session)}
                                className="p-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-800 rounded-lg transition"
                                title="Voir les inscrits"
                              >
                                <Users className="h-3.5 w-3.5" />
                              </button>
                              <Link
                                href={`/admin/sessions/${session.id}`}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                                title="Fiche détaillée"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                onClick={() => openEditSession(session)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                                title="Modifier"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => doDuplicateSession(session)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition"
                                title="Dupliquer"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteSession(session)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition"
                                title="Supprimer"
                              >
                                <Trash className="h-3.5 w-3.5" />
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

          {/* Session Pagination */}
          {totalSessionPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setSessionPage(p => Math.max(1, p - 1))}
                disabled={sessionPage === 1}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg disabled:opacity-40"
              >
                Préc.
              </button>
              <span className="text-xs text-slate-500 font-bold">Page {sessionPage} / {totalSessionPages}</span>
              <button
                onClick={() => setSessionPage(p => Math.min(totalSessionPages, p + 1))}
                disabled={sessionPage === totalSessionPages}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white rounded-lg disabled:opacity-40"
              >
                Suiv.
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: FORMATIONS ─────────────────────────────────────────── */}
      {activeTab === 'templates' && (
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
                        <button
                          onClick={() => {
                            setSessionFormData(prev => ({ ...prev, formationId: String(f.id) }))
                            setShowSessionForm(true)
                          }}
                          className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-black rounded-lg text-center transition"
                        >
                          Planifier Session
                        </button>
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
                            className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg"
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
      )}

      {/* ── MODAL: VIEW SESSION STUDENTS ────────────────────────────────────── */}
      {viewSessionInscrits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Étudiants inscrits
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewSessionInscrits.formation?.title} · Session #{viewSessionInscrits.id}
                </p>
              </div>
              <button
                onClick={() => setViewSessionInscrits(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-2">
              <SessionStudentsList sessionId={viewSessionInscrits.id} />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE SESSION CONFIRM ───────────────────────────────────── */}
      {confirmDeleteSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-650" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Supprimer la session ?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Session #{confirmDeleteSession.id} — <strong>{confirmDeleteSession.formation?.title}</strong>
                </p>
                <p className="text-xs text-red-600 font-semibold mt-2">
                  Attention : cela effacera également toutes les demandes d'inscriptions liées. Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteSession(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
              >
                Annuler
              </button>
              <button
                onClick={() => doDeleteSession(confirmDeleteSession)}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white font-black text-xs rounded-xl shadow-sm transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ── MODAL: CREATE / EDIT SESSION FORM ───────────────────────────────── */}
      {showSessionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 relative max-h-[92vh] overflow-y-auto animate-fade-in-up my-4">
            <button
              onClick={() => setShowSessionForm(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {editingSession ? 'Modifier la session' : 'Nouvelle session'}
              </p>
              <h2 className="text-xl font-black text-slate-900">
                {editingSession
                  ? `Session #${editingSession.id} — ${editingSession.formation?.title}`
                  : '📅 Planifier une session de formation'}
              </h2>
            </div>

            <form onSubmit={handleSessionFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Formation Selection */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Formation Template *
                </label>
                <select
                  value={sessionFormData.formationId}
                  onChange={e => setSessionFormData(p => ({ ...p, formationId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                  required
                  disabled={!!editingSession}
                >
                  <option value="">— Sélectionner le template de formation —</option>
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
                  value={sessionFormData.startDate}
                  onChange={e => setSessionFormData(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date de fin *</label>
                <input
                  type="date"
                  value={sessionFormData.endDate}
                  onChange={e => setSessionFormData(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                  required
                />
              </div>

              {/* Times */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Heure de début</label>
                <input
                  type="time"
                  value={sessionFormData.startTime}
                  onChange={e => setSessionFormData(p => ({ ...p, startTime: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Heure de fin</label>
                <input
                  type="time"
                  value={sessionFormData.endTime}
                  onChange={e => setSessionFormData(p => ({ ...p, endTime: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Lieu / Lien de visioconférence *</label>
                <input
                  type="text"
                  value={sessionFormData.location}
                  onChange={e => setSessionFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="ex. Campus Principal, Kinshasa ou Zoom / Google Meet Link"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                  required
                />
              </div>

              {/* Format & Capacity */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Format de cours</label>
                <select
                  value={sessionFormData.format}
                  onChange={e => setSessionFormData(p => ({ ...p, format: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                >
                  <option value="presentiel">Présentiel</option>
                  <option value="distanciel">Distanciel</option>
                  <option value="hybride">Hybride</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Taille max (étudiants)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={sessionFormData.maxParticipants}
                  onChange={e => setSessionFormData(p => ({ ...p, maxParticipants: parseInt(e.target.value) || 25 }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Statut de la Session</label>
                <select
                  value={sessionFormData.status}
                  onChange={e => setSessionFormData(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-bold text-slate-800"
                >
                  {Object.entries(SESSION_STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Remarques ou description</label>
                <textarea
                  rows={2}
                  value={sessionFormData.description}
                  onChange={e => setSessionFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Notes logistiques, formateurs assignés, etc."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800 font-semibold"
                />
              </div>

              {/* Objectives */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Objectifs de session (optionnel)</label>
                <textarea
                  rows={2}
                  value={sessionFormData.objectives}
                  onChange={e => setSessionFormData(p => ({ ...p, objectives: e.target.value }))}
                  placeholder="Compétences spécifiques visées par cette session académique"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50/30 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800 font-semibold"
                />
              </div>

              {/* Submit Buttons */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSessionForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sessionFormLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {sessionFormLoading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Envoi...</>
                  ) : (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Enregistrer la session</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-component for student list ─────────────────────────────────────────
function SessionStudentsList({ sessionId }: { sessionId: number }) {
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
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  const active = enrollments.filter(e => !['waitlist', 'rejected', 'cancelled'].includes(e.status))

  if (active.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <GraduationCap className="h-10 w-10 mx-auto mb-2 text-slate-200" />
        <p className="text-sm font-bold text-slate-600">Aucun étudiant inscrit sur cette session</p>
      </div>
    )
  }

  const STATUS_COLORS: Record<string, string> = {
    accepted:  'bg-emerald-100 text-emerald-800 border border-emerald-200',
    confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
    completed: 'bg-slate-100 text-slate-700 border border-slate-200',
    pending:   'bg-amber-100 text-amber-800 border border-amber-200',
  }

  return (
    <div className="space-y-2">
      {active.map((e: any) => (
        <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50 text-xs">
          <div>
            <p className="font-extrabold text-slate-900">{e.firstName} {e.lastName}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{e.email}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[e.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {e.status}
          </span>
        </div>
      ))}
    </div>
  )
}
