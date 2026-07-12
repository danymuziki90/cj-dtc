'use client'

import { FormEvent, useRef, useState } from 'react'
import { Download, FileUp, BookOpen, Paperclip, UploadCloud } from 'lucide-react'
import {
  StudentEmptyState,
  StudentSectionCard,
  type StudentMetric,
  studentInputClassName,
  studentPrimaryButtonClassName,
} from '@/components/ui/student-space'
import {
  StudentPortalError,
  StudentPortalLoading,
  StudentPortalPageShell,
} from '@/components/student-portal/StudentPortalPageShell'
import { useStudentDashboardData } from '@/components/student-portal/useStudentDashboard'
import { formatPortalDateTime, statusToneClass } from '@/lib/student-portal/format'

type SubmissionStatus = 'en_attente_de_correction' | 'corrige' | 'valide'

function statusLabel(raw: string): SubmissionStatus {
  if (raw === 'approved') return 'valide'
  if (raw === 'rejected') return 'corrige'
  return 'en_attente_de_correction'
}

function statusDisplay(value: SubmissionStatus) {
  if (value === 'valide') return 'Valide'
  if (value === 'corrige') return 'Corrige'
  return 'En attente de correction'
}

function statusTone(value: SubmissionStatus) {
  if (value === 'valide') return statusToneClass('approved')
  if (value === 'corrige') return statusToneClass('rejected')
  return statusToneClass('pending')
}

export default function StudentSubmissionsPage() {
  const { data, loading, error, refresh } = useStudentDashboardData()

  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (loading) {
    return (
      <StudentPortalLoading
        title="Mes travaux"
        description="Deposez vos travaux, suivez leur statut et consultez les retours du formateur."
        icon={BookOpen}
      />
    )
  }

  if (!data || error) {
    return (
      <StudentPortalError
        title="Mes travaux"
        description="Deposez vos travaux, suivez leur statut et consultez les retours du formateur."
        icon={BookOpen}
        error={error}
      />
    )
  }

  const submissions = data.dashboard.submissions
  const approved = submissions.filter((s) => s.status === 'approved').length
  const pending = submissions.filter((s) => s.status === 'pending').length
  const reviewed = submissions.filter((s) => s.status === 'rejected').length

  const metrics: StudentMetric[] = [
    {
      label: 'Travaux soumis',
      value: submissions.length,
      helper: 'Total des depots effectues.',
      icon: FileUp,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'Valides',
      value: approved,
      helper: 'Travaux acceptes par le formateur.',
      icon: BookOpen,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'En attente',
      value: pending,
      helper: 'En cours de correction.',
      icon: UploadCloud,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
    {
      label: 'Corriges',
      value: reviewed,
      helper: 'Travaux avec retours formateur.',
      icon: Paperclip,
      accent: 'from-[#001737] to-[#002D72]',
    },
  ]

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setUploadError('')
    setUploadSuccess('')

    if (!file) {
      setUploadError('Veuillez selectionner un fichier.')
      return
    }

    const trimmedTitle = title.trim()
    if (trimmedTitle.length < 3) {
      setUploadError('Le titre doit contenir au moins 3 caracteres.')
      return
    }

    const formData = new FormData()
    formData.append('title', trimmedTitle)
    formData.append('file', file)

    setUploading(true)
    try {
      const response = await fetch('/api/student/system/submissions', {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setUploadError(payload.error || 'Echec du depot. Veuillez reessayer.')
        return
      }

      setUploadSuccess(`"${trimmedTitle}" depose avec succes.`)
      setTitle('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await refresh()
    } catch {
      setUploadError('Echec du depot. Veuillez verifier votre connexion.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <StudentPortalPageShell
      title="Mes travaux"
      description="Deposez vos travaux, suivez leur statut de correction et consultez les retours du formateur."
      icon={BookOpen}
      metrics={metrics}
    >
      {/* Formulaire de depot */}
      <StudentSectionCard
        eyebrow="Nouveau depot"
        title="Remettre un travail"
        description="Formats acceptes : PDF, DOCX, DOC, ZIP, JPG, PNG, WEBP. Taille maximale : 20 Mo."
        icon={UploadCloud}
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {uploadSuccess ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">
              {uploadSuccess}
            </div>
          ) : null}
          {uploadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {uploadError}
            </div>
          ) : null}

          <div>
            <label htmlFor="submission-title" className="mb-1 block text-sm font-medium text-slate-700">
              Titre du travail <span className="text-red-500">*</span>
            </label>
            <input
              id="submission-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Projet final module 3"
              className={studentInputClassName}
              required
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="submission-file" className="mb-1 block text-sm font-medium text-slate-700">
              Fichier <span className="text-red-500">*</span>
            </label>
            <input
              id="submission-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className={studentInputClassName}
              required
            />
            {file ? (
              <p className="mt-1 text-xs text-slate-500">
                Fichier selectionne : <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} Mo)
              </p>
            ) : null}
          </div>

          <div>
            <button
              type="submit"
              disabled={uploading}
              className={`${studentPrimaryButtonClassName} disabled:opacity-70`}
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? 'Depot en cours...' : 'Soumettre le travail'}
            </button>
          </div>
        </form>
      </StudentSectionCard>

      {/* Liste des soumissions */}
      <StudentSectionCard
        eyebrow="Historique"
        title="Tous mes depots"
        description="Consultez le statut, les retours du formateur et telechargez vos fichiers soumis."
        icon={BookOpen}
      >
        {submissions.length ? (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const label = statusLabel(sub.status)
              return (
                <article
                  key={sub.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Depose le {formatPortalDateTime(sub.submittedAt)}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                        {sub.title}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(label)}`}
                    >
                      {statusDisplay(label)}
                    </span>
                  </div>

                  {/* Feedback formateur */}
                  {sub.reviewFeedback ? (
                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
                      <p className="font-semibold text-[var(--cj-blue)]">Retour du formateur</p>
                      <p className="mt-1 text-slate-700">{sub.reviewFeedback}</p>
                      {sub.reviewedAt ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Mis a jour le {formatPortalDateTime(sub.reviewedAt)}
                        </p>
                      ) : null}
                    </div>
                  ) : label === 'en_attente_de_correction' ? (
                    <p className="mt-3 text-sm text-slate-500">
                      Aucun retour pour le moment — la correction est en cours.
                    </p>
                  ) : null}

                  {/* Telecharger le fichier soumis */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)]"
                    >
                      <Download className="h-4 w-4" />
                      Telecharger mon fichier
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <StudentEmptyState
            title="Aucun travail soumis"
            description="Utilisez le formulaire ci-dessus pour deposer votre premier travail. Il apparaitra ici avec son statut de correction."
          />
        )}
      </StudentSectionCard>
    </StudentPortalPageShell>
  )
}
