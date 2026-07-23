'use client'

import { useState, useEffect, useMemo } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'
import { useToastNotification } from '@/components/ui/toast'
import {
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  User,
  GraduationCap,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface Testimonial {
  id: number
  studentId: string
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  formationId?: number | null
  formation?: {
    id: number
    title: string
  } | null
  sessionId?: number | null
  session?: {
    id: number
    startDate: string
    endDate?: string
  } | null
  rating: number
  title?: string | null
  content: string
  status: 'pending' | 'approved' | 'rejected'
  adminReply?: string | null
  adminNote?: string | null
  createdAt: string
}

interface Evaluation {
  id: number
  overallRating: number
  overallComment?: string
  contentRating?: number
  instructorRating?: number
  materialRating?: number
  organizationRating?: number
  facilityRating?: number
  strengths?: string
  improvements?: string
  recommendations?: string
  submittedAt: string
  isAnonymous: boolean
  enrollment?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  formation?: {
    id: number
    title: string
  }
  session?: {
    id: number
    startDate: string
    location?: string
  }
}

interface FormationOption {
  id: number
  title: string
}

export default function AdminEvaluationsPage() {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'evaluations'>('testimonials')

  // States pour Témoignages
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)

  // States pour Évaluations Pédagogiques
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [evaluationsLoading, setEvaluationsLoading] = useState(true)

  // Liste des formations pour filtres
  const [formations, setFormations] = useState<FormationOption[]>([])

  // Filtres et Recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formationFilter, setFormationFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')

  // Modale de réponse Admin
  const [replyingTestimonial, setReplyingTestimonial] = useState<Testimonial | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  // Modale de confirmation de suppression
  const [deletingTestimonial, setDeletingTestimonial] = useState<Testimonial | null>(null)
  const [submittingDelete, setSubmittingDelete] = useState(false)

  const { success, error: toastError } = useToastNotification() || {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg)
  }

  // Chargeur des témoignages (déféctivité garantie Array.isArray)
  const fetchTestimonials = async () => {
    try {
      setTestimonialsLoading(true)
      const res = await fetch('/api/admin/testimonials')
      if (!res.ok) throw new Error('Échec du chargement des témoignages')
      const data = await res.json()
      setTestimonials(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement témoignages:', err)
      setTestimonials([])
    } finally {
      setTestimonialsLoading(false)
    }
  }

  // Chargeur des évaluations (déféctivité garantie Array.isArray)
  const fetchEvaluations = async () => {
    try {
      setEvaluationsLoading(true)
      const res = await fetch('/api/evaluations')
      if (!res.ok) throw new Error('Échec du chargement des évaluations')
      const data = await res.json()
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement évaluations:', err)
      setEvaluations([])
    } finally {
      setEvaluationsLoading(false)
    }
  }

  // Chargeur des formations
  const fetchFormations = async () => {
    try {
      const res = await fetch('/api/formations')
      const data = await res.json()
      setFormations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement formations:', err)
      setFormations([])
    }
  }

  useEffect(() => {
    fetchTestimonials()
    fetchEvaluations()
    fetchFormations()
  }, [])

  // Action : Modifier statut témoignage (Approuver / Refuser)
  const handleUpdateStatus = async (id: number, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erreur lors de la mise à jour')
      }

      const updated = await res.json()

      setTestimonials(prev =>
        prev.map(t => (t.id === id ? { ...t, status: updated.status || newStatus } : t))
      )

      success(`Statut mis à jour : ${newStatus === 'approved' ? 'Approuvé' : newStatus === 'rejected' ? 'Refusé' : 'En attente'}`)
    } catch (err: any) {
      console.error(err)
      toastError(err.message || 'Impossible de mettre à jour le statut.')
    }
  }

  // Action : Soumettre une réponse admin
  const handleSendReply = async () => {
    if (!replyingTestimonial) return

    setSubmittingReply(true)
    try {
      const res = await fetch(`/api/admin/testimonials/${replyingTestimonial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erreur lors de l’envoi de la réponse')
      }

      const updated = await res.json()

      setTestimonials(prev =>
        prev.map(t => (t.id === replyingTestimonial.id ? { ...t, adminReply: updated.adminReply || replyText } : t))
      )

      success('Réponse enregistrée avec succès.')
      setReplyingTestimonial(null)
      setReplyText('')
    } catch (err: any) {
      console.error(err)
      toastError(err.message || 'Erreur lors de l’enregistrement.')
    } finally {
      setSubmittingReply(false)
    }
  }

  // Action : Supprimer un témoignage
  const handleDeleteTestimonial = async () => {
    if (!deletingTestimonial) return

    setSubmittingDelete(true)
    try {
      const res = await fetch(`/api/admin/testimonials/${deletingTestimonial.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erreur lors de la suppression')
      }

      setTestimonials(prev => prev.filter(t => t.id !== deletingTestimonial.id))
      success('Témoignage supprimé définitivement.')
      setDeletingTestimonial(null)
    } catch (err: any) {
      console.error(err)
      toastError(err.message || 'Erreur lors de la suppression.')
    } finally {
      setSubmittingDelete(false)
    }
  }

  // Filtrage sécurisé des Témoignages
  const filteredTestimonials = useMemo(() => {
    if (!Array.isArray(testimonials)) return []

    return testimonials.filter(t => {
      // Statut
      if (statusFilter !== 'all' && t.status !== statusFilter) return false

      // Note
      if (ratingFilter !== 'all' && t.rating !== Number(ratingFilter)) return false

      // Formation
      if (formationFilter !== 'all' && String(t.formationId) !== formationFilter) return false

      // Recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const studentName = `${t.student?.firstName || ''} ${t.student?.lastName || ''}`.toLowerCase()
        const studentEmail = (t.student?.email || '').toLowerCase()
        const title = (t.title || '').toLowerCase()
        const content = (t.content || '').toLowerCase()
        const formationTitle = (t.formation?.title || '').toLowerCase()

        if (
          !studentName.includes(q) &&
          !studentEmail.includes(q) &&
          !title.includes(q) &&
          !content.includes(q) &&
          !formationTitle.includes(q)
        ) {
          return false
        }
      }

      return true
    })
  }, [testimonials, statusFilter, ratingFilter, formationFilter, searchQuery])

  // Filtrage sécurisé des Évaluations
  const filteredEvaluations = useMemo(() => {
    if (!Array.isArray(evaluations)) return []

    return evaluations.filter(ev => {
      if (formationFilter !== 'all' && String(ev.formation?.id) !== formationFilter) return false
      if (ratingFilter !== 'all' && ev.overallRating !== Number(ratingFilter)) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const name = `${ev.enrollment?.firstName || ''} ${ev.enrollment?.lastName || ''}`.toLowerCase()
        const comment = (ev.overallComment || '').toLowerCase()
        const formationTitle = (ev.formation?.title || '').toLowerCase()

        if (!name.includes(q) && !comment.includes(q) && !formationTitle.includes(q)) {
          return false
        }
      }

      return true
    })
  }, [evaluations, formationFilter, ratingFilter, searchQuery])

  // Métriques pour Témoignages
  const testimonialMetrics = useMemo(() => {
    const safeList = Array.isArray(testimonials) ? testimonials : []
    const total = safeList.length
    const pending = safeList.filter(t => t.status === 'pending').length
    const approved = safeList.filter(t => t.status === 'approved').length
    const avgRating = total > 0 ? (safeList.reduce((acc, t) => acc + t.rating, 0) / total).toFixed(1) : '0'

    return { total, pending, approved, avgRating }
  }, [testimonials])

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <AdminShell title="Évaluations & Témoignages">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Témoignages & Évaluations des Étudiants
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gérez les avis publiés depuis l’Espace Étudiant et les questionnaires de satisfaction.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'testimonials'
                  ? 'bg-white text-[var(--cj-blue)] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💬 Témoignages ({testimonials.length})
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'evaluations'
                  ? 'bg-white text-[var(--cj-blue)] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Évaluations Pédagogiques ({evaluations.length})
            </button>
          </div>
        </div>

        {/* CARTES MÉTRIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[var(--cj-blue)] rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Témoignages
              </span>
              <span className="text-2xl font-black text-slate-900">{testimonialMetrics.total}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                En attente
              </span>
              <span className="text-2xl font-black text-amber-600">{testimonialMetrics.pending}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Approuvés
              </span>
              <span className="text-2xl font-black text-emerald-600">{testimonialMetrics.approved}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Star className="w-6 h-6 fill-yellow-500" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Note Moyenne
              </span>
              <span className="text-2xl font-black text-slate-900">{testimonialMetrics.avgRating} / 5</span>
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher étudiant, avis, formation..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900/20 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {activeTab === 'testimonials' && (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente (Modération)</option>
                <option value="approved">Approuvés (Public)</option>
                <option value="rejected">Refusés</option>
              </select>
            )}

            <input
              type="text"
              value={formationFilter === 'all' ? '' : formationFilter}
              onChange={e => setFormationFilter(e.target.value || 'all')}
              placeholder="Filtrer par domaine/type..."
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white"
            />

            <select
              value={ratingFilter}
              onChange={e => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">Toutes les notes</option>
              <option value="5">5 Étoiles</option>
              <option value="4">4 Étoiles</option>
              <option value="3">3 Étoiles</option>
              <option value="2">2 Étoiles</option>
              <option value="1">1 Étoile</option>
            </select>

            <button
              onClick={() => {
                fetchTestimonials()
                fetchEvaluations()
              }}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* VUE ONGLET 1 : TÉMOIGNAGES ÉTUDIANTS */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            {testimonialsLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mb-3"></div>
                <p>Chargement des témoignages Supabase...</p>
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Aucun témoignage disponible</h3>
                <p className="text-xs text-slate-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Aucun résultat ne correspond à vos filtres de recherche.'
                    : 'Aucun témoignage n’a encore été soumis par les étudiants.'}
                </p>
              </div>
            ) : (
              filteredTestimonials.map(t => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--cj-blue)] font-bold flex items-center justify-center text-sm border border-blue-100">
                        {t.student?.firstName?.[0] || 'E'}
                        {t.student?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {t.student?.firstName} {t.student?.lastName}
                        </h4>
                        <span className="text-xs text-slate-400">{t.student?.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {renderStarRating(t.rating)}
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg border ${
                          t.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {t.status === 'approved'
                          ? 'Approuvé'
                          : t.status === 'rejected'
                          ? 'Refusé'
                          : 'En attente'}
                      </span>
                    </div>
                  </div>

                  {/* Meta Formation & Session */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      {t.formation?.title || 'Formation générale'}
                    </span>
                    {t.session && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Session #{t.session.id} (du {new Date(t.session.startDate).toLocaleDateString('fr-FR')})
                      </span>
                    )}
                    <span className="ml-auto text-[11px] text-slate-400">
                      Envoyé le {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Titre & Contenu */}
                  <div className="space-y-1.5">
                    {t.title && <h5 className="text-xs font-bold text-slate-900">« {t.title} »</h5>}
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-55/50 p-3.5 rounded-xl border border-slate-100">
                      {t.content}
                    </p>
                  </div>

                  {/* Réponse de l'administration */}
                  {t.adminReply && (
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-700">
                      <strong className="text-[var(--cj-blue)] block mb-1">
                        💬 Réponse de l’Administration :
                      </strong>
                      <p className="whitespace-pre-line">{t.adminReply}</p>
                    </div>
                  )}

                  {/* Boutons d'Action Modération */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      {t.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'approved')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approuver
                        </button>
                      )}

                      {t.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'rejected')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Refuser
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setReplyingTestimonial(t)
                          setReplyText(t.adminReply || '')
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        {t.adminReply ? 'Modifier la réponse' : 'Répondre'}
                      </button>
                    </div>

                    <button
                      onClick={() => setDeletingTestimonial(t)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 font-semibold transition ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VUE ONGLET 2 : ÉVALUATIONS PÉDAGOGIQUES */}
        {activeTab === 'evaluations' && (
          <div className="space-y-4">
            {evaluationsLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mb-3"></div>
                <p>Chargement des évaluations pédagogiques...</p>
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Aucune évaluation enregistrée</h3>
                <p className="text-xs text-slate-500">
                  Les questionnaires de fin de formation soumis par les étudiants s'afficheront ici.
                </p>
              </div>
            ) : (
              filteredEvaluations.map(ev => (
                <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        {renderStarRating(ev.overallRating)}
                        <span className="text-xs font-bold text-slate-900">{ev.overallRating}/5</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {ev.isAnonymous
                          ? 'Étudiant Anonyme'
                          : `${ev.enrollment?.firstName || 'Étudiant'} ${ev.enrollment?.lastName || ''}`}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(ev.submittedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Formation : <strong>{ev.formation?.title || 'Non spécifiée'}</strong>
                  </div>

                  {ev.overallComment && (
                    <div className="text-xs text-slate-700 bg-slate-55/50 p-3 rounded-xl border border-slate-100">
                      <strong>Commentaire global :</strong>
                      <p className="mt-1 whitespace-pre-line">{ev.overallComment}</p>
                    </div>
                  )}

                  {ev.strengths && (
                    <div className="text-xs text-emerald-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <strong>Points forts :</strong>
                      <p className="mt-1 whitespace-pre-line">{ev.strengths}</p>
                    </div>
                  )}

                  {ev.improvements && (
                    <div className="text-xs text-rose-800 bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                      <strong>Axes d'amélioration :</strong>
                      <p className="mt-1 whitespace-pre-line">{ev.improvements}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODALE DE RÉPONSE ADMIN */}
      {replyingTestimonial && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Répondre au témoignage de {replyingTestimonial.student?.firstName} {replyingTestimonial.student?.lastName}
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600">
              <p className="font-semibold text-slate-900 mb-1">« {replyingTestimonial.content} »</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Votre réponse (Visible par l'étudiant)
              </label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={4}
                placeholder="Merci pour votre retour d'expérience ! Nous sommes ravis..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900/20 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReplyingTestimonial(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSendReply}
                disabled={submittingReply}
                className="px-4 py-2 text-xs font-bold text-white bg-[var(--cj-blue)] hover:bg-blue-900 rounded-xl transition disabled:opacity-50"
              >
                {submittingReply ? 'Envoi...' : 'Enregistrer la réponse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DE SUPPRESSION */}
      {deletingTestimonial && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement le témoignage de{' '}
              <strong>
                {deletingTestimonial.student?.firstName} {deletingTestimonial.student?.lastName}
              </strong>{' '}
              ? Cette action est irréversible.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTestimonial(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTestimonial}
                disabled={submittingDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50"
              >
                {submittingDelete ? 'Suppression...' : 'Oui, Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
