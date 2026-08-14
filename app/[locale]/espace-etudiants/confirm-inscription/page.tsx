'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CalendarDays, CheckCircle2, FileUp, GraduationCap, Loader2, MapPinIcon, ShieldCheck } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  studentSecondaryButtonClassName,
} from '@/components/ui/student-space'

type Formation = {
  id: number
  title: string
  titleEn?: string
  slug: string
  description?: string | null
  descriptionEn?: string | null
  categorie?: string | null
}

type TrainingSession = {
  id: number
  formationId: number
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location?: string | null
  locationEn?: string | null
  format: string
  status?: string
  formation: Formation
  adminMeta?: {
    paymentInfo?: string | null
    customTitle?: string | null
    sessionType?: string | null
    durationLabel?: string | null
    participationType?: string | null
    registrationDeadline?: string | null
  } | null
}

type AuthState = 'checking' | 'authenticated' | 'anonymous'
type SubmitState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

type FormQuestion = {
  id: number
  label: string
  labelEn?: string
  type: 'text_short' | 'text_long' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'yes_no' | 'file_upload'
  required: boolean
  helpText?: string | null
  helpTextEn?: string | null
  options: string[]
  fileTypes?: string[] | null
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '-'
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function ConfirmInscriptionContent() {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const searchParams = useSearchParams()
  const locale = params?.locale || 'fr'

  const formationId = Number(searchParams.get('formationId') || 0)
  const sessionId = Number(searchParams.get('sessionId') || 0)
  const nextPath = `/${locale}/espace-etudiants/confirm-inscription?formationId=${formationId}${
    sessionId ? `&sessionId=${sessionId}` : ''
  }`

  const [authState, setAuthState] = useState<AuthState>('checking')
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string; email: string; username: string } | null>(null)
  const [formation, setFormation] = useState<Formation | null>(null)
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  // Questions personnalisées
  const [customQuestions, setCustomQuestions] = useState<FormQuestion[]>([])
  const [customAnswers, setCustomAnswers] = useState<Record<number, string | string[] | { fileUrl: string, fileName: string }>>({})
  const [customErrors, setCustomErrors] = useState<Record<number, string>>({})
  const [uploadingFiles, setUploadingFiles] = useState<Record<number, boolean>>({})

  const handleFileUpload = async (questionId: number, file: File, allowedTypes: string[]) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileExt)) {
      alert(`Format de fichier non autorisé. Autorisé(s) : ${allowedTypes.map(t => `.${t}`).join(', ')}`)
      return
    }

    setUploadingFiles(prev => ({ ...prev, [questionId]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'submissions')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Erreur de téléversement")
      }

      const data = await res.json()
      setCustomAnswers(prev => ({
        ...prev,
        [questionId]: {
          fileUrl: data.url,
          fileName: file.name
        }
      }))
      // Clear any error
      setCustomErrors(prev => {
        const next = { ...prev }
        delete next[questionId]
        return next
      })
    } catch (error: any) {
      console.error('File upload error:', error)
      alert(`Échec du téléversement : ${error.message || error}`)
    } finally {
      setUploadingFiles(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const validateCustomAnswers = (): boolean => {
    const errors: Record<number, string> = {}
    let isValid = true
    for (const q of customQuestions) {
      if (q.required) {
        const val = customAnswers[q.id]
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === 'string' && !val.trim()) ||
          (Array.isArray(val) && val.length === 0) ||
          (q.type === 'file_upload' && !(val && typeof val === 'object' && !Array.isArray(val) && 'fileUrl' in val))
        if (isEmpty) {
          errors[q.id] = 'Ce champ est requis.'
          isValid = false
        }
      }
    }
    setCustomErrors(errors)
    return isValid
  }

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      const authResponse = await fetch('/api/student/auth/me', { cache: 'no-store' })
      if (authResponse.ok) {
        const authData = await authResponse.json()
        if (active) {
          setAuthState('authenticated')
          setStudentInfo(authData.student)
        }
      } else {
        if (active) {
          setAuthState('anonymous')
          setStudentInfo(null)
        }
      }

      if (!formationId && !sessionId) {
        if (active) {
          setError('Session ou formation invalide.')
          setLoading(false)
        }
        return
      }

      try {
        if (sessionId) {
          const sessionRes = await fetch(`/api/sessions/${sessionId}`, { cache: 'no-store' })
          if (!sessionRes.ok) throw new Error('Impossible de charger la session.')
          const selectedSession = (await sessionRes.json()) as TrainingSession
          if (!selectedSession) {
            throw new Error('Session introuvable.')
          }
          if (active) {
            setSession(selectedSession)
            setFormation(selectedSession.formation)
          }

          // Charger les questions personnalisées
          try {
            const questionsRes = await fetch(`/api/sessions/${sessionId}/form-questions`, { cache: 'no-store' })
            if (questionsRes.ok) {
              const qData = await questionsRes.json()
              if (active) setCustomQuestions(Array.isArray(qData) ? qData : [])
            }
          } catch (err) {
            console.error('Failed to load form questions:', err)
          }
        } else {
          const formationResponse = await fetch(`/api/formations/${formationId}`, { cache: 'no-store' })
          if (!formationResponse.ok) throw new Error('Formation introuvable.')
          const selectedFormation = (await formationResponse.json()) as Formation
          if (active) setFormation(selectedFormation)
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger la formation.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [formationId, sessionId])

  const summary = useMemo(() => {
    const isFr = locale === 'fr'
    if (!formation) return []
    return [
      { label: isFr ? 'Formation' : 'Course', value: isFr ? formation.title : (formation.titleEn || formation.title), icon: GraduationCap },
      {
        label: isFr ? 'Période' : 'Period',
        value: session ? `${formatDate(session.startDate)} - ${formatDate(session.endDate)}` : (isFr ? 'À confirmer' : 'TBD'),
        icon: CalendarDays,
      },
      {
        label: isFr ? 'Lieu / format' : 'Location / format',
        value: session ? [isFr ? session.location : (session.locationEn || session.location), session.format].filter(Boolean).join(' | ') : (isFr ? 'À confirmer' : 'TBD'),
        icon: MapPinIcon,
      },
    ]
  }, [formation, session, locale])

  async function confirmEnrollment(event: FormEvent) {
    event.preventDefault()
    if (!formation) return

    if (!validateCustomAnswers()) {
      setError('Veuillez remplir tous les champs obligatoires (*).')
      return
    }

    setSubmitState('loading')
    setError('')

    const response = await fetch('/api/student/system/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formationId: formation.id,
        ...(session?.id ? { sessionId: session.id } : {}),
      }),
    })
    const payload = await response.json().catch(() => ({}))

    if (response.status === 401 || response.status === 403) {
      setAuthState('anonymous')
      setSubmitState('idle')
      return
    }

    if (response.status === 409) {
      setSubmitState('duplicate')
      return
    }

    if (!response.ok) {
      setError(payload.error || "Impossible d'enregistrer la demande.")
      setSubmitState('error')
      return
    }

    // Soumettre les réponses personnalisées si présentes
    if (customQuestions.length > 0 && payload.id) {
      try {
        const answers = customQuestions.map((q) => {
          const val = customAnswers[q.id]
          if (q.type === 'checkbox') {
            return {
              questionId: q.id,
              jsonValue: Array.isArray(val) ? val : [],
            }
          }
          if (q.type === 'file_upload') {
            const fileObj = typeof val === 'object' && val !== null ? (val as any) : {}
            return {
              questionId: q.id,
              fileUrl: fileObj.fileUrl || null,
              fileName: fileObj.fileName || null,
            }
          }
          return {
            questionId: q.id,
            textValue: typeof val === 'string' ? val : '',
          }
        })

        await fetch(`/api/sessions/${session?.id}/form-answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId: payload.id, answers }),
        })
      } catch (answersError) {
        console.error('Failed to submit custom answers:', answersError)
      }
    }

    setSubmitState('success')
    router.refresh()
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Confirmation d'inscription"
        description="Chargement de la formation selectionnee et verification de votre session etudiant."
        icon={ShieldCheck}
      >
        <StudentSectionCard
          eyebrow="Verification"
          title="Preparation de votre demande"
          description="Nous recuperons les informations utiles avant confirmation."
          icon={Loader2}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            {locale === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  if (authState === 'anonymous') {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow={locale === 'fr' ? 'Espace étudiant' : 'Student Space'}
        title={locale === 'fr' ? 'Connectez-vous pour continuer' : 'Sign in to continue'}
        description={locale === 'fr' ? "Les demandes d'inscription sont maintenant rattachées à un compte étudiant unique." : 'Registration requests are now linked to a unique student account.'}
        icon={ShieldCheck}
      >
        <StudentSectionCard
          eyebrow={locale === 'fr' ? 'Compte requis' : 'Account required'}
          title={locale === 'fr' ? 'Un compte étudiant est nécessaire' : 'A student account is required'}
          description={locale === 'fr' ? 'Connectez-vous ou créez votre compte. Vous reviendrez automatiquement sur cette confirmation.' : 'Sign in or create your account. You will automatically return to this confirmation.'}
          icon={ShieldCheck}
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/auth/student-login?next=${encodeURIComponent(nextPath)}`}
              className={studentPrimaryButtonClassName}
            >
              {locale === 'fr' ? 'Se connecter' : 'Sign in'}
            </Link>
            <Link
              href={`/${locale}/auth/student-register?next=${encodeURIComponent(nextPath)}`}
              className={studentMutedButtonClassName}
            >
              {locale === 'fr' ? 'Créer un compte' : 'Create an account'}
            </Link>
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  if (error && !formation) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow={locale === 'fr' ? 'Espace étudiant' : 'Student Space'}
        title={locale === 'fr' ? 'Demande impossible' : 'Request unavailable'}
        description={locale === 'fr' ? "La formation demandée n'a pas pu être chargée." : 'The requested course could not be loaded.'}
        icon={ShieldCheck}
      >
        <StudentEmptyState
          title={locale === 'fr' ? 'Formation introuvable' : 'Course not found'}
          description={error}
          action={
            <Link href={`/${locale}/formations#sessions`} className={studentPrimaryButtonClassName}>
              {locale === 'fr' ? 'Voir les formations' : 'View courses'}
            </Link>
          }
        />
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow={locale === 'fr' ? 'Espace étudiant' : 'Student Space'}
      title={locale === 'fr' ? 'Confirmer votre inscription' : 'Confirm your registration'}
      description={locale === 'fr' ? "Aucune ressaisie n'est nécessaire. La demande sera liée à votre compte et transmise à l'administration." : 'No re-entry required. The request will be linked to your account and sent to administration.'}
      icon={ShieldCheck}
      actions={
        <Link href={`/${locale}/formations#sessions`} className={studentSecondaryButtonClassName}>
          <ArrowLeft className="h-4 w-4" />
          {locale === 'fr' ? 'Changer de formation' : 'Change course'}
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StudentSectionCard
          eyebrow={locale === 'fr' ? 'Demande' : 'Request'}
          title={locale === 'fr' ? formation?.title || 'Formation sélectionnée' : formation?.titleEn || formation?.title || 'Selected course'}
          description={locale === 'fr' ? 'Vérifiez les informations puis confirmez. Le statut initial sera En attente.' : 'Verify the information and confirm. The initial status will be Pending.'}
          icon={GraduationCap}
        >
          <div className="grid gap-4">
            {summary.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Icon className="h-4 w-4 text-[var(--cj-blue)]" />
                  {label}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
              </div>
            ))}
            {session && (session as any).adminMeta?.paymentInfo ? (
              <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-700">
                Informations tarifaires : <span className="font-semibold text-slate-950">{(session as any).adminMeta.paymentInfo}</span>
              </div>
            ) : null}
          </div>
        </StudentSectionCard>

        <StudentSectionCard
          eyebrow={locale === 'fr' ? 'Confirmation' : 'Confirmation'}
          title={locale === 'fr' ? "Envoi à l'administration" : 'Sent to administration'}
          description={locale === 'fr' ? 'Votre profil étudiant fournit automatiquement nom, téléphone et email.' : 'Your student profile automatically provides name, phone, and email.'}
          icon={CheckCircle2}
        >
          {submitState === 'success' ? (
            <StudentEmptyState
              title={locale === 'fr' ? 'Demande envoyée' : 'Request sent'}
              description={locale === 'fr' ? "Votre demande est maintenant en attente de validation dans le tableau de bord administrateur." : 'Your request is now pending validation in the admin dashboard.'}
              action={
                <Link href={`/${locale}/espace-etudiants/mes-formations`} className={studentPrimaryButtonClassName}>
                  {locale === 'fr' ? 'Voir mes formations' : 'View my courses'}
                </Link>
              }
            />
          ) : submitState === 'duplicate' ? (
            <StudentEmptyState
              title={locale === 'fr' ? 'Demande déjà existante' : 'Request already exists'}
              description={locale === 'fr' ? 'Vous avez déjà une demande active pour cette formation.' : 'You already have an active request for this course.'}
              action={
                <Link href={`/${locale}/espace-etudiants/mes-formations`} className={studentPrimaryButtonClassName}>
                  {locale === 'fr' ? 'Suivre mes demandes' : 'Track my requests'}
                </Link>
              }
            />
          ) : (
            <form onSubmit={confirmEnrollment} className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
                  {error}
                </div>
              ) : null}

              {/* Informations du profil (Lecture seule) */}
              {studentInfo && (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {locale === 'fr' ? 'Informations du profil étudiant' : 'Student profile information'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block font-semibold">{locale === 'fr' ? 'Nom complet' : 'Full name'}</span>
                      <span className="font-bold text-slate-850">{studentInfo.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Email</span>
                      <span className="font-bold text-slate-850 break-all">{studentInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{locale === 'fr' ? 'Identifiant' : 'Username'}</span>
                      <span className="font-bold text-slate-850">{studentInfo.username || (locale === 'fr' ? 'Non défini' : 'Not set')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions complémentaires */}
              {customQuestions.length > 0 && (
                <div className="border-t border-slate-200 pt-5 mt-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    {locale === 'fr' ? 'Questions complémentaires' : 'Additional questions'}
                  </h4>
                  {customQuestions.map((q) => {
                    const questionError = customErrors[q.id]
                    const val = customAnswers[q.id]
                    const setVal = (v: string | string[]) =>
                      setCustomAnswers((prev) => ({ ...prev, [q.id]: v }))

                    return (
                      <div key={q.id} className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500">
                          {locale === 'fr' ? q.label : (q.labelEn || q.label)}
                          {q.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {(q.helpText || q.helpTextEn) && (
                          <p className="text-[10px] text-slate-450 leading-relaxed">{locale === 'fr' ? q.helpText : (q.helpTextEn || q.helpText)}</p>
                        )}

                        {q.type === 'text_short' && (
                          <input
                            type="text"
                            value={typeof val === 'string' ? val : ''}
                            onChange={(e) => setVal(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              questionError ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                          />
                        )}
                        {q.type === 'text_long' && (
                          <textarea
                            value={typeof val === 'string' ? val : ''}
                            onChange={(e) => setVal(e.target.value)}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${
                              questionError ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                          />
                        )}
                        {q.type === 'number' && (
                          <input
                            type="number"
                            value={typeof val === 'string' ? val : ''}
                            onChange={(e) => setVal(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              questionError ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                          />
                        )}
                        {q.type === 'date' && (
                          <input
                            type="date"
                            value={typeof val === 'string' ? val : ''}
                            onChange={(e) => setVal(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              questionError ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                          />
                        )}
                        {q.type === 'select' && (
                          <select
                            value={typeof val === 'string' ? val : ''}
                            onChange={(e) => setVal(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white ${
                              questionError ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                          >
                            <option value="">{locale === 'fr' ? '-- Choisir --' : '-- Select --'}</option>
                            {q.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                        {q.type === 'radio' && (
                          <div className="space-y-1.5 pt-1">
                            {q.options.map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`q_${q.id}`}
                                  value={opt}
                                  checked={val === opt}
                                  onChange={() => setVal(opt)}
                                  className="h-3.5 w-3.5 border-slate-300 accent-[var(--cj-blue)]"
                                />
                                <span className="text-xs text-slate-650">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === 'checkbox' && (
                          <div className="space-y-1.5 pt-1">
                            {q.options.map((opt) => {
                              const checked = Array.isArray(val) && val.includes(opt)
                              return (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      const current = Array.isArray(val) ? val : []
                                      setVal(checked ? current.filter((v) => v !== opt) : [...current, opt])
                                    }}
                                    className="h-3.5 w-3.5 border-slate-300 rounded accent-[var(--cj-blue)]"
                                  />
                                  <span className="text-xs text-slate-650">{opt}</span>
                                </label>
                              )
                            })}
                          </div>
                        )}
                        {q.type === 'yes_no' && (
                          <div className="flex gap-4 pt-1">
                            {(locale === 'fr' ? ['Oui', 'Non'] : ['Yes', 'No']).map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`q_${q.id}`}
                                  value={opt}
                                  checked={val === opt || (locale === 'en' && val === 'Oui' && opt === 'Yes') || (locale === 'en' && val === 'Non' && opt === 'No')}
                                  onChange={() => setVal(opt === 'Yes' ? 'Oui' : opt === 'No' ? 'Non' : opt)}
                                  className="h-3.5 w-3.5 border-slate-300 accent-[var(--cj-blue)]"
                                />
                                <span className="text-xs text-slate-650">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === 'file_upload' && (() => {
                          const isUploading = uploadingFiles[q.id]
                          const fileObj = typeof val === 'object' && val !== null ? (val as any) : null

                          return (
                            <div
                              className={`border border-dashed rounded-xl p-4 text-center transition ${
                                questionError
                                  ? 'border-red-400 bg-red-50/50'
                                  : fileObj
                                  ? 'border-blue-300 bg-blue-50/20'
                                  : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                              }`}
                            >
                              {isUploading ? (
                                <div className="py-2 flex flex-col items-center">
                                  <Loader2 className="h-4 w-4 animate-spin text-[var(--cj-blue)] mb-1" />
                                  <p className="text-[10px] text-slate-450 font-bold">
                                    {locale === 'fr' ? 'Envoi du fichier...' : 'Uploading file...'}
                                  </p>
                                </div>
                              ) : fileObj ? (
                                <div className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-blue-100 shadow-sm">
                                  <span className="text-xs font-bold text-slate-700 truncate pr-2">
                                    📄 {fileObj.fileName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCustomAnswers((p) => {
                                        const next = { ...p }
                                        delete next[q.id]
                                        return next
                                      })
                                    }
                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 rounded hover:bg-red-50 transition"
                                  >
                                    {locale === 'fr' ? 'Supprimer' : 'Remove'}
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer block py-1">
                                  <FileUp className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                                  <span className="text-xs font-bold text-[var(--cj-blue)] hover:underline block mb-0.5">
                                    {locale === 'fr' ? 'Sélectionner un fichier' : 'Select a file'}
                                  </span>
                                  <p className="text-[9px] text-slate-450">
                                    {locale === 'fr' ? 'Formats :' : 'Formats:'}{' '}
                                    {q.fileTypes && q.fileTypes.length > 0
                                      ? q.fileTypes.map((t) => `.${t}`).join(', ')
                                      : (locale === 'fr' ? 'tous' : 'all')}{' '}
                                    (max 10 Mo)
                                  </p>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept={
                                      q.fileTypes && q.fileTypes.length > 0
                                        ? q.fileTypes.map((t) => `.${t}`).join(',')
                                        : '*/*'
                                    }
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleFileUpload(q.id, file, q.fileTypes || [])
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          )
                        })()}

                        {questionError && (
                          <p className="mt-0.5 text-[10px] text-red-650 font-bold">{questionError}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5 text-sm leading-6 text-slate-600">
                {locale === 'fr' 
                  ? "En confirmant, une demande d'inscription sera créée avec le statut En attente. Aucune nouvelle fiche étudiant ne sera créée."
                  : 'By confirming, a registration request will be created with Pending status. No new student record will be created.'}
              </div>
              <button
                type="submit"
                disabled={submitState === 'loading'}
                className={`${studentPrimaryButtonClassName} w-full disabled:opacity-70`}
              >
                {submitState === 'loading' 
                  ? (locale === 'fr' ? 'Envoi en cours...' : 'Sending...') 
                  : (locale === 'fr' ? "Confirmer l'inscription" : 'Confirm registration')}
              </button>
            </form>
          )}
        </StudentSectionCard>
      </div>
    </StudentPageShell>
  )
}

export default function ConfirmInscriptionPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmInscriptionContent />
    </Suspense>
  )
}
