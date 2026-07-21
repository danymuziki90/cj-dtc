'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  MessageSquare,
  Upload,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentInputClassName,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  type StudentMetric,
} from '@/components/ui/student-space'

interface Assignment {
  id: number
  title: string
  description: string
  type: string // tp, exam, project
  deadline: string
  instructions: string | null
  formation: {
    id: number
    title: string
  }
  files: Array<{
    id: number
    name: string
    originalName: string
    size: number
    url: string
  }>
  submissions: Array<{
    id: number
    status: string // submitted, graded, returned
    submittedAt: string
    feedback: string | null
    grade?: number | null
    files: Array<{
      id: number
      name: string
      size: number
      url: string
    }>
  }>
}

export default function TravauxPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // Tracking upload states
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/student/assignments')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      } else {
        console.error('Failed to load assignments:', response.statusText)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des devoirs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const metrics = useMemo<StudentMetric[]>(() => {
    const totalCount = assignments.length
    const submittedCount = assignments.filter((a) => a.submissions && a.submissions.length > 0).length
    const pendingCount = assignments.filter(
      (a) => (!a.submissions || a.submissions.length === 0) && new Date(a.deadline).getTime() >= Date.now()
    ).length

    return [
      {
        label: 'Travaux assignés',
        value: totalCount,
        helper: 'Total des TP et examens publiés pour vos cours.',
        icon: FolderOpen,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Déposés',
        value: submittedCount,
        helper: 'Rendus enregistrés avec succès.',
        icon: CheckCircle2,
        accent: 'from-emerald-500 to-teal-700',
      },
      {
        label: 'À remettre',
        value: pendingCount,
        helper: 'Travaux en attente avant la date limite.',
        icon: Clock3,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
    ]
  }, [assignments])

  const handleUploadSubmit = async (assignmentId: number, event: FormEvent) => {
    event.preventDefault()
    if (!uploadFile) {
      setUploadError('Veuillez sélectionner un fichier.')
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const submitData = new FormData()
      submitData.append('assignmentId', String(assignmentId))
      submitData.append('fileCount', '1')
      submitData.append('file_0', uploadFile)

      const response = await fetch('/api/student/assignments', {
        method: 'POST',
        body: submitData,
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Erreur lors du dépôt.')
      }

      setUploadSuccess('Votre travail a été déposé avec succès !')
      setUploadFile(null)
      setSelectedAssignmentId(null)
      await fetchAssignments()

      setTimeout(() => {
        setUploadSuccess(null)
      }, 3000)
    } catch (error: any) {
      console.error('Erreur lors du dépôt:', error)
      setUploadError(error.message || 'Erreur lors de la soumission du travail.')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
  }

  const getAssignmentStatus = (assign: Assignment) => {
    const hasSub = assign.submissions && assign.submissions.length > 0
    if (hasSub) {
      return {
        label: 'Déposé',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        textColor: 'text-emerald-700',
      }
    }

    const isPast = new Date(assign.deadline).getTime() < Date.now()
    if (isPast) {
      return {
        label: 'Date dépassée',
        color: 'border-red-200 bg-red-50 text-red-800',
        textColor: 'text-red-700',
      }
    }

    return {
      label: 'À faire',
      color: 'border-orange-200 bg-orange-50 text-orange-850',
      textColor: 'text-orange-700',
    }
  }

  const getSubmissionStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Déposé (En attente)'
      case 'graded':
        return 'Corrigé'
      case 'returned':
        return 'Renvoyé pour correction'
      default:
        return status
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'returned':
        return 'bg-red-50 text-red-700 border-red-100'
      case 'submitted':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100'
    }
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Travaux et projets"
        description="Chargement de vos devoirs, examens et travaux académiques..."
        icon={FolderOpen}
      >
        <StudentSectionCard
          eyebrow="Travaux"
          title="Préparation des évaluations"
          description="Veuillez patienter pendant la synchronisation avec le catalogue d'apprentissage."
          icon={FileText}
        >
          <div className="flex justify-center items-center py-20 text-slate-500 text-sm">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span>Récupération de vos devoirs...</span>
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Travaux et projets"
      description="Déposez vos travaux pratiques (TP), suivez les retours de correction de vos formateurs et consultez vos notes."
      icon={FolderOpen}
      metrics={metrics}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Active Assignments List */}
        <div className="space-y-6">
          <StudentSectionCard
            eyebrow="Évaluations"
            title="Mes travaux en cours & TP"
            description="Chaque carte correspond à un devoir assigné à l'une de vos formations actives."
            icon={FileText}
          >
            {assignments.length === 0 ? (
              <StudentEmptyState
                title="Aucun travail assigné"
                description="L'administration n'a planifié aucun examen ou TP pour vos formations en cours pour le moment."
              />
            ) : (
              <div className="space-y-6">
                {assignments.map((assign) => {
                  const status = getAssignmentStatus(assign)
                  const isFuture = new Date(assign.deadline).getTime() >= Date.now()

                  return (
                    <article
                      key={assign.id}
                      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1.5">
                          <span className="inline-flex rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">
                            {assign.type.toUpperCase()}
                          </span>
                          <h4 className="text-lg font-bold text-slate-950 tracking-tight">{assign.title}</h4>
                          <p className="text-xs text-slate-500">Formation : <span className="font-semibold text-slate-700">{assign.formation?.title}</span></p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">
                            Date limite : {new Date(assign.deadline).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description :</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{assign.description}</p>
                        </div>

                        {/* Instruction Files */}
                        {assign.files && assign.files.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Consignes & Fichiers joints :</p>
                            <div className="mt-2 space-y-1.5">
                              {assign.files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.url}
                                  download={file.originalName}
                                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  {file.originalName} ({formatFileSize(file.size)})
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Submission History */}
                        {assign.submissions && assign.submissions.length > 0 && (
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                            <p className="text-xs font-bold text-slate-800 mb-2">Votre copie soumise :</p>
                            <div className="space-y-3">
                              {assign.submissions.map((sub) => (
                                <div key={sub.id} className="rounded-xl border border-slate-150 bg-white p-3 shadow-sm text-xs">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-900">Soumission</span>
                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSubmissionStatusColor(sub.status)}`}>
                                      {getSubmissionStatusLabel(sub.status)}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    Transmis le {new Date(sub.submittedAt).toLocaleString('fr-FR')}
                                  </p>

                                  {/* Submitted files list */}
                                  {sub.files && sub.files.length > 0 && (
                                    <div className="mt-2 space-y-1 pt-2 border-t border-slate-100">
                                      {sub.files.map((f) => (
                                        <a
                                          key={f.id}
                                          href={f.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 text-[10px] text-blue-600 hover:underline font-semibold"
                                        >
                                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                                          {f.name} ({formatFileSize(f.size)})
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  {/* Reviewer feedback */}
                                  {sub.feedback && (
                                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-[10px] text-slate-700">
                                      <span className="font-bold text-[var(--cj-blue)]">Feedback formateur :</span>{' '}
                                      {sub.feedback}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upload action form */}
                        <div className="pt-2">
                          {(() => {
                            const hasResubmissionRequest = assign.submissions?.some((sub) => sub.status === 'returned')
                            const canUpload = isFuture || hasResubmissionRequest
                            return canUpload ? (
                              selectedAssignmentId === assign.id ? (
                                <form
                                  onSubmit={(e) => handleUploadSubmit(assign.id, e)}
                                  className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4"
                                >
                                  {uploadSuccess && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                                      {uploadSuccess}
                                    </div>
                                  )}
                                  {uploadError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-800">
                                      {uploadError}
                                    </div>
                                  )}

                                  <div>
                                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                                      Fichier de rendu (PDF, DOCX, ZIP...) *
                                    </label>
                                    <input
                                      type="file"
                                      required
                                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                      className={studentInputClassName}
                                      accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      disabled={uploading}
                                      className={`${studentPrimaryButtonClassName} text-xs py-2 disabled:opacity-60`}
                                    >
                                      {uploading ? 'Téléversement...' : 'Valider mon dépôt'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAssignmentId(null)
                                        setUploadFile(null)
                                        setUploadError(null)
                                      }}
                                      className={studentMutedButtonClassName}
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  onClick={() => setSelectedAssignmentId(assign.id)}
                                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-blue)] py-2 text-xs font-semibold text-white hover:bg-[var(--cj-blue-700)] transition shadow-sm"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  Déposer mon travail
                                </button>
                              )
                            ) : (
                              <button
                                disabled
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-200 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                              >
                                Dépôt verrouillé (date limite dépassée)
                              </button>
                            )
                          })()}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </StudentSectionCard>
        </div>

        {/* Right Column: Information & Guidelines */}
        <div className="space-y-6">
          <StudentSectionCard
            eyebrow="Conseils"
            title="Consignes générales de dépôt"
            description="Prenez connaissance de notre cadre pédagogique pour le traitement rapide de vos livrables."
            icon={MessageSquare}
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Fichiers autorisés</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Les formats usuels PDF, DOC, DOCX et les archives ZIP/RAR sont autorisés. Pensez à compresser vos fichiers si nécessaire.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Date limite de rigueur</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Les dépôts sont automatiquement verrouillés par le serveur dès l'heure limite dépassée.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Grille de notation</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Chaque correction donne lieu à des commentaires détaillés du formateur disponibles sous votre copie, avec notification automatique.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-150 bg-blue-50/50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cj-blue)] mb-3">Navigation</p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                    Retour au Dashboard
                  </Link>
                  <Link href={`/${locale}/espace-etudiants/mes-formations`} className={studentMutedButtonClassName}>
                    Mes formations
                  </Link>
                </div>
              </div>
            </div>
          </StudentSectionCard>
        </div>

      </div>
    </StudentPageShell>
  )
}
