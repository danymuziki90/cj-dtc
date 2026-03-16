'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Download, FileText, FolderOpen, GraduationCap, MessageSquare, Upload } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentInputClassName,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  studentSecondaryButtonClassName,
  studentStatusClass,
  type StudentMetric,
} from '@/components/ui/student-space'

interface Submission {
  id: number
  title: string
  fileName: string
  filePath: string
  fileSize: number
  status: string
  submittedAt: string
  feedback: string | null
  formation: {
    id: number
    title: string
  }
}

interface Formation {
  id: number
  title: string
}

export default function TravauxPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    formationId: '',
    file: null as File | null,
  })

  useEffect(() => {
    fetchFormations()
    fetchSubmissions()
  }, [])

  const metrics = useMemo<StudentMetric[]>(() => {
    const approvedCount = submissions.filter((item) => item.status === 'approved').length
    return [
      {
        label: 'Travaux soumis',
        value: submissions.length,
        helper: 'Depot enregistre depuis votre espace personnel.',
        icon: FolderOpen,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Formations liees',
        value: formations.length,
        helper: 'Parcours disponibles pour vos rendus.',
        icon: GraduationCap,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Travaux valides',
        value: approvedCount,
        helper: 'Soumissions deja approuvees.',
        icon: CheckCircle2,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
    ]
  }, [formations.length, submissions])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      const uniqueFormations = Array.from(
        new Map(data.map((item: any) => [item.formation.id, item.formation])).values(),
      ) as Formation[]
      setFormations(uniqueFormations)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      setSubmissions([])
    } catch (error) {
      console.error('Erreur lors du chargement des travaux:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!formData.file || !formData.title || !formData.formationId) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setUploading(true)
    try {
      const submitData = new FormData()
      submitData.append('file', formData.file)
      submitData.append('title', formData.title)
      submitData.append('formationId', formData.formationId)

      const response = await fetch('/api/student-submissions', {
        method: 'POST',
        body: submitData,
      })

      if (response.ok) {
        alert('Travail soumis avec succes!')
        setShowForm(false)
        setFormData({ title: '', formationId: '', file: null })
        fetchSubmissions()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error || 'Erreur lors de la soumission'}`)
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Erreur lors de la soumission du travail')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: 'Soumis',
      reviewed: 'En revision',
      approved: 'Approuve',
      rejected: 'Rejete',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Travaux et projets"
        description="Chargement de vos soumissions, des formations rattachees et des informations de depot."
        icon={FolderOpen}
      >
        <StudentSectionCard
          eyebrow="Travaux"
          title="Preparation des soumissions"
          description="Nous recuperons votre historique de depots et vos formations disponibles."
          icon={FileText}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement des travaux...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Travaux et projets"
      description="Deposez vos travaux pratiques, suivez les retours de validation et gardez une vue claire sur vos livrables."
      icon={FolderOpen}
      metrics={metrics}
      actions={
        <button onClick={() => setShowForm((current) => !current)} className={studentSecondaryButtonClassName}>
          <Upload className="h-4 w-4" />
          {showForm ? 'Fermer le formulaire' : 'Nouveau travail'}
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StudentSectionCard
          eyebrow="Depot"
          title="Soumettre un nouveau travail"
          description="Choisissez la formation concernee, ajoutez un titre clair et chargez votre livrable au bon format."
          icon={Upload}
        >
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Titre du travail *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className={studentInputClassName}
                  placeholder="Ex: TP1 - Gestion des ressources humaines"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Formation *</label>
                <select
                  required
                  value={formData.formationId}
                  onChange={(event) => setFormData({ ...formData, formationId: event.target.value })}
                  className={studentInputClassName}
                >
                  <option value="">Selectionner une formation</option>
                  {formations.map((formation) => (
                    <option key={formation.id} value={formation.id.toString()}>
                      {formation.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fichier *</label>
                <input
                  type="file"
                  required
                  onChange={(event) => setFormData({ ...formData, file: event.target.files?.[0] || null })}
                  className={studentInputClassName}
                  accept=".pdf,.doc,.docx,.zip,.rar"
                />
                {formData.file ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Fichier selectionne: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" disabled={uploading} className={`${studentPrimaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-60`}>
                  {uploading ? 'Envoi en cours...' : 'Soumettre le travail'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={studentMutedButtonClassName}>
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <StudentEmptyState
              title="Aucun depot en cours"
              description="Ouvrez le formulaire pour ajouter un livrable, le rattacher a une formation et le transmettre a l'equipe pedagogique."
              action={
                <button onClick={() => setShowForm(true)} className={studentPrimaryButtonClassName}>
                  <Upload className="h-4 w-4" />
                  Commencer une soumission
                </button>
              }
            />
          )}
        </StudentSectionCard>

        <StudentSectionCard
          eyebrow="Conseils"
          title="Cadre de soumission"
          description="Quelques repaires utiles pour rendre vos livrables plus lisibles et plus faciles a traiter."
          icon={MessageSquare}
        >
          <div className="space-y-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Formats acceptes</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">PDF, DOC, DOCX, ZIP et RAR selon le type de rendu demande.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Bon titrage</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Indiquez la session, le numero du travail et un intitule court pour accelerer la verification.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Suivi</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Une fois soumis, votre travail apparait dans l'historique avec son statut et les retours eventuels.</p>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">Navigation utile</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/${locale}/espace-etudiants/supports`} className={studentMutedButtonClassName}>
                  Voir les supports
                </Link>
                <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                  Retour au dashboard
                </Link>
              </div>
            </div>
          </div>
        </StudentSectionCard>
      </div>

      <StudentSectionCard
        eyebrow="Historique"
        title="Travaux deja soumis"
        description="Retrouvez vos depots, leur statut de validation et les retours pedagogiques deja publies."
        icon={FileText}
      >
        {submissions.length === 0 ? (
          <StudentEmptyState
            title="Aucun travail soumis pour le moment"
            description="Votre historique de rendus apparaitra ici des que vous aurez transmis un premier livrable."
            action={
              <button onClick={() => setShowForm(true)} className={studentPrimaryButtonClassName}>
                Soumettre votre premier travail
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{submission.title}</p>
                    <p className="mt-2 text-sm text-slate-600">Formation: {submission.formation.title}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        Soumis le {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span>{submission.fileName} ({formatFileSize(submission.fileSize)})</span>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${studentStatusClass(submission.status)}`}>
                    {getStatusLabel(submission.status)}
                  </span>
                </div>

                {submission.feedback ? (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-700">
                    <span className="font-semibold text-[var(--cj-blue)]">Feedback:</span> {submission.feedback}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  <a href={`/${submission.filePath}`} download={submission.fileName} className={studentMutedButtonClassName}>
                    <Download className="h-4 w-4" />
                    Telecharger
                  </a>
                  {submission.feedback ? <button className={studentMutedButtonClassName}>Voir le feedback</button> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </StudentSectionCard>
    </StudentPageShell>
  )
}
