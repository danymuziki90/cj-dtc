'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MessageSquareQuote,
  Send,
  Star,
  Upload,
  UserCheck,
} from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentInputClassName,
  studentPrimaryButtonClassName,
} from '@/components/ui/student-space'

interface TestimonialItem {
  id: number
  title: string | null
  quote: string
  rating: number | null
  status: 'pending' | 'approved' | 'rejected'
  approved: boolean
  adminReply: string | null
  showName: boolean
  showPhoto: boolean
  photoUrl: string | null
  createdAt: string
  formation?: { id: number; title: string } | null
  session?: { id: number; startDate: string; location: string } | null
}

export default function TestimonialsPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [items, setItems] = useState<TestimonialItem[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    title: '',
    quote: '',
    formationId: '',
    sessionId: '',
    rating: 5,
    photoUrl: '',
    showName: true,
    showPhoto: true,
  })

  async function loadData() {
    try {
      setLoading(true)
      const [testimonialsRes, dashboardRes] = await Promise.all([
        fetch('/api/student/testimonials'),
        fetch('/api/student/system/dashboard'),
      ])

      if (testimonialsRes.ok) {
        setItems(await testimonialsRes.json())
      }

      if (dashboardRes.ok) {
        const dash = await dashboardRes.json()
        const enrolled = dash.sessionsHistory || dash.enrollments || []
        setSessions(enrolled)

        // Pre-select first session if available and form empty
        if (enrolled.length > 0 && !form.sessionId) {
          const first = enrolled[0]
          setForm((prev) => ({
            ...prev,
            sessionId: String(first.sessionId || first.id || ''),
            formationId: String(first.formationId || first.formation?.id || ''),
          }))
        }
      }
    } catch (err) {
      console.error('Testimonials loading error:', err)
      setErrorMsg('Impossible de charger vos données. Veuillez rafraîchir la page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('La photo ne doit pas dépasser 8 Mo.')
      return
    }

    try {
      setUploadingPhoto(true)
      setErrorMsg('')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'etudiants')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec de l\'upload')

      setForm((prev) => ({ ...prev, photoUrl: data.url }))
    } catch (err: any) {
      console.error('Photo upload error:', err)
      setErrorMsg(err.message || 'Impossible d\'envoyer la photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!form.quote.trim()) {
      setErrorMsg('Veuillez rédiger votre témoignage.')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/student/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setErrorMsg(payload.error || 'Envoi du témoignage impossible.')
        return
      }

      setSuccessMsg(
        'Votre témoignage a été envoyé avec succès. Il sera examiné par notre équipe avant sa publication.'
      )
      setForm({
        title: '',
        quote: '',
        formationId: '',
        sessionId: '',
        rating: 5,
        photoUrl: '',
        showName: true,
        showPhoto: true,
      })

      loadData()
    } catch (err) {
      console.error('Submit error:', err)
      setErrorMsg('Erreur lors de l\'envoi de votre témoignage.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Partager mon expérience"
      description="Votre retour d'expérience aide les futurs apprenants et permet d'améliorer la qualité de nos formations."
      icon={MessageSquareQuote}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        
        {/* FORM SECTION */}
        <StudentSectionCard
          eyebrow="Nouveau témoignage"
          title="Raconter votre expérience"
          description="Votre témoignage sera relu par notre équipe académique avant d'être publié."
          icon={Send}
        >
          <form onSubmit={submit} className="space-y-4">
            
            {/* Formation / Session selection */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Formation ou session concernée *
              </label>
              <select
                required
                value={form.sessionId}
                onChange={(e) => {
                  const val = e.target.value
                  const selected = sessions.find(
                    (s) => String(s.sessionId || s.id) === val
                  )
                  setForm({
                    ...form,
                    sessionId: val,
                    formationId: String(
                      selected?.formationId || selected?.formation?.id || ''
                    ),
                  })
                }}
                className={studentInputClassName}
              >
                <option value="">Sélectionner votre formation / session</option>
                {sessions.map((s, idx) => {
                  const sId = String(s.sessionId || s.id || idx)
                  const fTitle = s.formationTitle || s.formation?.title || 'Formation CJ DTC'
                  const dateStr = s.startDate
                    ? ` (${new Date(s.startDate).toLocaleDateString('fr-FR')})`
                    : ''
                  return (
                    <option key={sId} value={sId}>
                      {fTitle}
                      {dateStr}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Titre (facultatif) */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Titre de votre témoignage (optionnel)
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={studentInputClassName}
                placeholder="Ex: Une formation transformatrice pour ma carrière !"
              />
            </div>

            {/* Evaluation par étoiles */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Note globale *
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="p-1 transition hover:scale-125 focus:outline-none"
                    title={`${star} / 5 étoiles`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= form.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm font-bold text-slate-700">
                  {form.rating} / 5 étoiles
                </span>
              </div>
            </div>

            {/* Contenu du témoignage */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Votre témoignage *
              </label>
              <textarea
                required
                rows={5}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                className={studentInputClassName}
                placeholder="Racontez les points forts de la formation, ce que vous avez appris et ce qu'elle vous a apporté sur le plan professionnel..."
              />
            </div>

            {/* Photo optionnelle */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Joindre une photo (optionnel)
              </label>
              <div className="flex items-center gap-3">
                {form.photoUrl ? (
                  <div className="relative flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                    <img
                      src={form.photoUrl}
                      alt="Aperçu photo"
                      className="h-12 w-12 rounded-xl object-cover border border-emerald-300 shadow-sm"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-800">Photo ajoutée</p>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, photoUrl: '' }))}
                        className="text-red-600 hover:underline font-semibold mt-0.5"
                      >
                        Retirer la photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 transition hover:border-[var(--cj-blue)] hover:bg-blue-50/30">
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--cj-blue)]" />
                        <span>Upload de votre photo en cours...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-slate-500" />
                        <span>Cliquer pour ajouter une photo (JPG, PNG)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Preferences de publication */}
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Autorisations de publication
              </p>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showName}
                  onChange={(e) =>
                    setForm({ ...form, showName: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[var(--cj-blue)] focus:ring-[var(--cj-blue)]"
                />
                <span>Autoriser l'affichage public de mon nom et prénom</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showPhoto}
                  onChange={(e) =>
                    setForm({ ...form, showPhoto: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[var(--cj-blue)] focus:ring-[var(--cj-blue)]"
                />
                <span>Autoriser l'affichage public de ma photo de profil</span>
              </label>
            </div>

            {/* Feedback messages */}
            {errorMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className={`${studentPrimaryButtonClassName} w-full`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Envoyer pour examen</span>
                </>
              )}
            </button>
          </form>
        </StudentSectionCard>

        {/* LIST & STATUS SECTION */}
        <StudentSectionCard
          eyebrow="Suivi"
          title="Mes témoignages envoyés"
          description="Suivez l'état de modération et l'éventuelle réponse de l'administration."
          icon={Star}
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--cj-blue)]" />
            </div>
          ) : items.length === 0 ? (
            <StudentEmptyState
              title="Aucun témoignage soumis"
              description="Vous n'avez pas encore rédigé de témoignage. Partagez votre expérience dès maintenant !"
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const statusBadge =
                  item.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      🟢 Approuvé (Publié)
                    </span>
                  ) : item.status === 'rejected' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                      🔴 Refusé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      🟡 En attente de modération
                    </span>
                  )

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight">
                          {item.title || 'Mon expérience formation'}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {item.formation?.title || 'Formation CJ DTC'}
                          {item.session?.startDate &&
                            ` · Session ${new Date(
                              item.session.startDate
                            ).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                      <div>{statusBadge}</div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= (item.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-slate-700 italic">
                        « {item.quote} »
                      </p>

                      {item.adminReply && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900">
                          <p className="font-bold text-[var(--cj-blue)] mb-1 flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5" /> Réponse de l'administration :
                          </p>
                          <p className="leading-relaxed">{item.adminReply}</p>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </StudentSectionCard>
      </div>
    </StudentPageShell>
  )
}
