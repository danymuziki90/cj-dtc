'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ProgramSessionType } from '@/lib/programmes/session-types'
import { inferProgramSessionType } from '@/lib/programmes/session-types'
import EnrollmentStatusChanger from './EnrollmentStatusChanger'
import { FormattedDate } from './FormattedDate'
import {
  AdminBadge,
  AdminEmptyState,
  AdminPanel,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminTextareaClassName,
} from '@/components/admin-portal/ui'

type EnrollmentAccount = {
  state: string
  label: string
  tone: 'warning' | 'success' | 'primary' | 'neutral' | 'danger'
  canCreate: boolean
  canLogin: boolean
  studentId?: string | null
  username?: string | null
}

type Enrollment = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  startDate: string
  status: string
  createdAt: string
  motivationLetter?: string
  notes?: string
  formation: {
    id: number
    title: string
    slug: string
  }
  session?: {
    id: number
    startDate: string
    endDate: string
    location: string
    format: string
    maxParticipants: number
  } | null
  account?: EnrollmentAccount
}

interface EnrollmentPreviewModalProps {
  enrollment: Enrollment
  onClose: () => void
  onStatusChange: () => void
}

type DisplaySection = {
  title: string
  fields: Array<{ key: string; label: string }>
}

const SESSION_FIELDS: Record<ProgramSessionType, DisplaySection[]> = {
  MRH: [
    {
      title: 'Informations personnelles',
      fields: [
        { key: 'lastName', label: 'Nom' },
        { key: 'firstName', label: 'Prenom' },
        { key: 'email', label: 'Email professionnel' },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'dateOfBirth', label: 'Date de naissance' },
        { key: 'address', label: 'Adresse' },
      ],
    },
    {
      title: 'Informations professionnelles',
      fields: [
        { key: 'company', label: 'Entreprise' },
        { key: 'position', label: 'Poste' },
        { key: 'professionalStatus', label: 'Statut professionnel' },
      ],
    },
    {
      title: 'Engagement et disponibilite',
      fields: [
        { key: 'practicalExercises', label: 'Exercices pratiques' },
        { key: 'preferredSessionType', label: 'Type session prefere' },
        { key: 'preferredSlots', label: 'Creneaux preferes' },
        { key: 'weeklyHours', label: 'Investissement horaire' },
        { key: 'conflictPlan', label: 'Plan en cas de conflit' },
      ],
    },
    {
      title: 'Niveau et experience RH',
      fields: [
        { key: 'rhLevel', label: 'Niveau RH' },
        { key: 'rhKnowledge', label: 'Connaissances RH' },
        { key: 'rhTopics', label: 'Sujets a approfondir' },
        { key: 'previousTrainings', label: 'Formations precedentes' },
      ],
    },
    {
      title: 'Motivation',
      fields: [
        { key: 'expectations', label: 'Attentes' },
        { key: 'reasonsToJoin', label: 'Raisons d integration' },
        { key: 'rhChallenges', label: 'Defis RH' },
        { key: 'refusalReaction', label: 'Reaction en cas de refus' },
        { key: 'concreteExpectations', label: 'Attentes concretes' },
      ],
    },
    {
      title: 'Engagement final',
      fields: [
        { key: 'acceptFinalExamProject', label: 'Engagement examen final et projet' },
        { key: 'acceptTruthfulness', label: 'Confirmation exactitude des informations' },
      ],
    },
  ],
  IOP: [
    {
      title: 'Informations personnelles',
      fields: [
        { key: 'lastName', label: 'Nom' },
        { key: 'firstName', label: 'Prenom' },
        { key: 'email', label: 'Email' },
        { key: 'gender', label: 'Sexe' },
        { key: 'infoSource', label: 'Source de l information' },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'age', label: 'Age' },
      ],
    },
    {
      title: 'Situation actuelle',
      fields: [
        { key: 'currentStatus', label: 'Statut actuel' },
        { key: 'currentDescription', label: 'Description actuelle' },
        { key: 'biggestChallenge', label: 'Plus grand defi' },
      ],
    },
    {
      title: 'Experience et motivation',
      fields: [
        { key: 'previousTrainingParticipation', label: 'Formation precedente suivie' },
        { key: 'respectRequirements', label: 'Respect des exigences' },
        { key: 'limitedSeatsAcknowledgment', label: 'Connaissance des places limitees' },
      ],
    },
    {
      title: 'Objectifs professionnels',
      fields: [
        { key: 'targetJob', label: 'Metier vise' },
        { key: 'professionalExpectations', label: 'Attentes professionnelles' },
        { key: 'candidateConclusion', label: 'Conclusion' },
        { key: 'educationLevel', label: 'Niveau etudes' },
        { key: 'expectedChange', label: 'Changement attendu' },
      ],
    },
    {
      title: 'Experiences passees et projection',
      fields: [
        { key: 'pastActions', label: 'Actions realisees' },
        { key: 'failureLesson', label: 'Échec et leçon' },
        { key: 'personalDiscipline', label: 'Discipline personnelle' },
        { key: 'difficultAction', label: 'Action difficile' },
        { key: 'projectionOneYear', label: 'Projection a 1 an' },
        { key: 'projectionFiveYears', label: 'Projection a 5 ans' },
        { key: 'selectionJustification', label: 'Justification de selection' },
        { key: 'communityImpact', label: 'Impact communautaire' },
        { key: 'answersAreAccurate', label: 'Confirmation exactitude des reponses' },
      ],
    },
  ],
  CONFERENCE_FORUM: [
    {
      title: 'Informations personnelles',
      fields: [
        { key: 'lastName', label: 'Nom' },
        { key: 'firstName', label: 'Prenom' },
        { key: 'email', label: 'Email' },
        { key: 'gender', label: 'Sexe' },
        { key: 'cityCountry', label: 'Ville / Pays' },
        { key: 'whatsapp', label: 'WhatsApp' },
      ],
    },
    {
      title: 'Statut et experience',
      fields: [
        { key: 'profileStatus', label: 'Profil' },
        { key: 'organization', label: 'Organisation / entreprise / eglise' },
        { key: 'followedIOP', label: 'A suivi IOP' },
        { key: 'iopCertified', label: 'Certifie IOP' },
        { key: 'iopYear', label: 'Annee IOP' },
      ],
    },
    {
      title: 'Projet forum',
      fields: [
        { key: 'wantsProjectPitch', label: 'Souhaite presenter un projet' },
        { key: 'projectTitle', label: 'Titre du projet' },
        { key: 'projectPitch', label: 'Pitch du projet' },
        { key: 'conferenceAnswersConfirmed', label: 'Confirmation exactitude des infos' },
      ],
    },
  ],
}



function normalizeFormType(value: unknown): ProgramSessionType | null {
  if (value === 'MRH' || value === 'IOP' || value === 'CONFERENCE_FORUM') {
    return value
  }

  return null
}

function hasDisplayValue(value: unknown) {
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return true
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return false
}

function displayValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value || '-'
  if (Array.isArray(value)) return value.join(', ')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return '-'
}

function parseJsonObject(value?: string | null) {
  if (!value) return null

  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

function parseEnrollmentNotes(notes?: string) {
  const parsed = parseJsonObject(notes)
  if (!parsed) {
    return {
      parsed: null as Record<string, unknown> | null,
      answers: {} as Record<string, unknown>,
      formType: null as ProgramSessionType | null,
      adminComment: notes || '',
    }
  }

  const answers = parsed.answers
  const safeAnswers = answers && typeof answers === 'object' && !Array.isArray(answers)
    ? (answers as Record<string, unknown>)
    : {}

  return {
    parsed,
    answers: safeAnswers,
    formType: normalizeFormType(parsed.formType),
    adminComment: typeof parsed.adminComment === 'string' ? parsed.adminComment : '',
  }
}



function buildKnownFields(sections: DisplaySection[]) {
  return new Set(sections.flatMap((section) => section.fields.map((field) => field.key)))
}

function inferTypeFromEnrollment(enrollment: Enrollment): ProgramSessionType {
  return inferProgramSessionType({
    title: enrollment.formation.title,
    format: enrollment.session?.format,
  })
}



const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  rejected: 'Refusé',
  waitlist: 'En liste d\'attente',
  cancelled: 'Annulé',
  confirmed: 'Confirmé',
  completed: 'Terminé'
}

function enrollmentStatusTone(status: string): 'warning' | 'success' | 'danger' | 'neutral' | 'primary' {
  if (status === 'accepted') return 'success'
  if (status === 'confirmed' || status === 'completed') return 'primary'
  if (status === 'rejected') return 'danger'
  if (status === 'pending' || status === 'waitlist') return 'warning'
  return 'neutral'
}

export default function EnrollmentPreviewModal({
  enrollment,
  onClose,
  onStatusChange,
}: EnrollmentPreviewModalProps) {
  const [record, setRecord] = useState<Enrollment>(enrollment)
  const [internalComment, setInternalComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [creatingStudentAccount, setCreatingStudentAccount] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string } | null>(null)
  const [customFormAnswers, setCustomFormAnswers] = useState<Array<{ questionLabel: string; answerText: string }>>([])

  useEffect(() => {
    setRecord(enrollment)
    const notes = parseEnrollmentNotes(enrollment.notes)
    setInternalComment(notes.adminComment)
    setFeedbackError(null)
    setFeedbackSuccess(null)
    setGeneratedCredentials(null)

    if (enrollment.session?.id && enrollment.id) {
      fetch(`/api/sessions/${enrollment.session.id}/form-answers?enrollmentId=${enrollment.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.answers) && data.answers.length > 0) {
            const parsedList = data.answers.map((ans: any) => {
              const label = ans.question?.label || `Question #${ans.questionId}`
              let val = ans.textValue || ans.jsonValue || (ans.fileUrl ? `${ans.fileName || 'Fichier'}: ${ans.fileUrl}` : '-')
              if (Array.isArray(val)) val = val.join(', ')
              return { questionLabel: label, answerText: String(val) }
            })
            setCustomFormAnswers(parsedList)
          } else {
            setCustomFormAnswers([])
          }
        })
        .catch(() => setCustomFormAnswers([]))
    } else {
      setCustomFormAnswers([])
    }
  }, [enrollment])

  const notesInfo = useMemo(() => parseEnrollmentNotes(record.notes), [record.notes])
  const resolvedType = notesInfo.formType || inferTypeFromEnrollment(record)
  const sections = SESSION_FIELDS[resolvedType]
  const knownFields = useMemo(() => buildKnownFields(sections), [sections])

  const enrichedSections = sections
    .map((section) => {
      const rows = section.fields
        .map((field) => ({
          key: field.key,
          label: field.label,
          value: notesInfo.answers[field.key],
        }))
        .filter((row) => hasDisplayValue(row.value))

      return {
        title: section.title,
        rows,
      }
    })
    .filter((section) => section.rows.length > 0)

  const additionalAnswers = Object.entries(notesInfo.answers)
    .filter(([key, value]) => key !== 'locale' && !knownFields.has(key) && hasDisplayValue(value))
    .map(([key, value]) => ({ key, value }))

  async function handleSaveComment() {
    setSavingComment(true)
    setFeedbackError(null)
    setFeedbackSuccess(null)

    try {
      const notesPayload = notesInfo.parsed
        ? JSON.stringify({
            ...notesInfo.parsed,
            adminComment: internalComment,
          })
        : internalComment

      const response = await fetch(`/api/enrollments/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesPayload }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de la sauvegarde du commentaire.')
      }

      const updatedEnrollment = data.enrollment || data
      setRecord((prev) => ({ ...prev, ...updatedEnrollment }))
      setFeedbackSuccess('Commentaire interne enregistre.')
      onStatusChange()
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setSavingComment(false)
    }
  }

  async function handleCreateStudentAccount() {
    setCreatingStudentAccount(true)
    setFeedbackError(null)
    setFeedbackSuccess(null)

    try {
      const response = await fetch(`/api/enrollments/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createStudentAccount',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Impossible de creer le compte etudiant.')
      }

      if (data.enrollment) {
        setRecord((prev) => ({
          ...prev,
          ...data.enrollment,
          ...(data.account ? { account: data.account } : {}),
        }))
      }

      if (data.credentials?.username && data.credentials?.password) {
        setGeneratedCredentials({
          username: data.credentials.username,
          password: data.credentials.password,
        })
      } else {
        setGeneratedCredentials(null)
      }

      const emailSuffix = data.notifications?.credentialsEmailSent
        ? ' Les identifiants ont ete envoyes automatiquement.'
        : ''

      setFeedbackSuccess(
        data.accountCreated
          ? `Compte etudiant cree avec succes.${emailSuffix}`
          : `Compte etudiant active avec succes.${emailSuffix}`
      )

      onStatusChange()
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setCreatingStudentAccount(false)
    }
  }

  const downloadMotivationLetter = () => {
    if (!record.motivationLetter) return
    const link = document.createElement('a')
    link.href = record.motivationLetter
    link.download = `${record.firstName}_${record.lastName}_motivation.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="max-h-[92vh] sm:max-h-[88vh] w-full max-w-6xl overflow-y-auto rounded-[24px] sm:rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.96))] shadow-[0_40px_110px_-60px_rgba(15,23,42,0.75)]">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-4 sm:p-5 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Revue inscription</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-950 truncate">
                Inscription #{record.id} - {record.firstName} {record.lastName}
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                <AdminBadge tone={enrollmentStatusTone(record.status)}>{record.status}</AdminBadge>
                {record.account ? <AdminBadge tone={record.account.tone}>{record.account.label}</AdminBadge> : null}
                <AdminBadge tone="neutral">{record.formation.title}</AdminBadge>
              </div>
            </div>
            <button onClick={onClose} className={`${adminSecondaryButtonClassName} shrink-0`}>
              Fermer
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_1fr]">
          <section className="space-y-6">
            <AdminPanel className="p-5">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Profil inscription</h3>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-slate-500">Nom complet</p>
                  <p className="font-medium text-slate-900">
                    {record.firstName} {record.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">{record.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">WhatsApp / Telephone</p>
                  <p className="font-medium text-slate-900">{record.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Adresse</p>
                  <p className="font-medium text-slate-900">{record.address || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Formation</p>
                  <p className="font-medium text-slate-900">{record.formation.title}</p>
                </div>
                <div>
                  <p className="text-slate-500">Type session</p>
                  <p className="font-medium text-slate-900">{resolvedType}</p>
                </div>
                <div>
                  <p className="text-slate-500">Date session</p>
                  <p className="font-medium text-slate-900">
                    <FormattedDate date={record.startDate} options={{ dateStyle: 'medium' } as Intl.DateTimeFormatOptions} />
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Lieu</p>
                  <p className="font-medium text-slate-900">{record.session?.location || '-'}</p>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel className="p-5">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Donnees du participant</h3>
              {customFormAnswers.length > 0 && (
                <div className="mb-4 rounded-[22px] border border-blue-200 bg-blue-50/50 p-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                    Réponses au formulaire personnalisé de la session
                  </h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {customFormAnswers.map((item, idx) => (
                      <div key={idx} className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500">{item.questionLabel}</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 break-words">{item.answerText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {enrichedSections.length === 0 && additionalAnswers.length === 0 && customFormAnswers.length === 0 ? (
                <AdminEmptyState
                  title="Aucune reponse detaillee"
                  description="Cette inscription ne contient pas encore de reponses structurees exploitables."
                />
              ) : (
                <div className="space-y-4">
                  {enrichedSections.map((section) => (
                    <div key={section.title} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">{section.title}</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {section.rows.map((row) => (
                          <div key={row.key} className="rounded-2xl border border-white/80 bg-white px-3 py-3 shadow-sm">
                            <p className="text-xs text-slate-500">{row.label}</p>
                            <p className="text-sm text-slate-900">{displayValue(row.value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {additionalAnswers.length > 0 ? (
                    <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Autres reponses</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {additionalAnswers.map((entry) => (
                          <div key={entry.key} className="rounded-2xl border border-white/80 bg-white px-3 py-3 shadow-sm">
                            <p className="text-xs text-slate-500">{entry.key}</p>
                            <p className="text-sm text-slate-900">{displayValue(entry.value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </AdminPanel>

            {record.motivationLetter ? (
              <AdminPanel className="p-5">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Lettre de motivation</h3>
                <button
                  onClick={downloadMotivationLetter}
                  className={adminPrimaryButtonClassName}
                >
                  Telecharger
                </button>
              </AdminPanel>
            ) : null}
          </section>

          <section className="space-y-6">
            <AdminPanel className="p-5">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Compte etudiant</h3>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-slate-500">Etat du compte</p>
                  <div className="mt-2">
                    {record.account ? (
                      <AdminBadge tone={record.account.tone}>{record.account.label}</AdminBadge>
                    ) : (
                      <AdminBadge tone="neutral">Etat indisponible</AdminBadge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500">Identifiant</p>
                  <p className="font-medium text-slate-900">{record.account?.username || 'Pas encore genere'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Connexion</p>
                  <p className="font-medium text-slate-900">{record.account?.canLogin ? 'Autorisee' : 'Bloquee'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Action admin</p>
                  <p className="font-medium text-slate-900">
                    {record.account?.canCreate ? 'Creation de compte possible maintenant' : 'Aucune action manuelle requise'}
                  </p>
                </div>
              </div>

              {record.account?.canCreate ? (
                <div className="mt-4 rounded-[22px] border border-[var(--admin-primary-100)] bg-[var(--admin-primary-50)] p-4">
                  <p className="text-sm font-semibold text-[var(--admin-primary-800)]">
                    Cette inscription est eligible a la creation du compte etudiant.
                  </p>
                  <p className="mt-1 text-sm text-[var(--admin-primary-700)]">
                    Le compte sera cree, active et les identifiants seront envoyes automatiquement a l'etudiant.
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateStudentAccount}
                    disabled={creatingStudentAccount}
                    className={`mt-3 ${adminPrimaryButtonClassName}`}
                  >
                    {creatingStudentAccount ? 'Creation en cours...' : 'Creer le compte etudiant'}
                  </button>
                </div>
              ) : null}
            </AdminPanel>

            <AdminPanel className="p-5">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Commentaires internes</h3>
              <textarea
                value={internalComment}
                onChange={(event) => setInternalComment(event.target.value)}
                rows={4}
                className={adminTextareaClassName}
                placeholder="Ajouter une note interne (sans perdre les reponses du formulaire)"
              />
              <button
                onClick={handleSaveComment}
                disabled={savingComment}
                className={`mt-2 ${adminPrimaryButtonClassName}`}
              >
                {savingComment ? 'Enregistrement...' : 'Enregistrer commentaire'}
              </button>
            </AdminPanel>

            <AdminPanel className="p-5">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Actions statut inscription</h3>
              <EnrollmentStatusChanger
                key={`${record.id}-${record.status}`}
                enrollmentId={record.id}
                currentStatus={record.status}
                email={record.email}
                formationTitle={record.formation.title}
                onStatusChanged={(newStatus) => {
                  setRecord((prev) => ({ ...prev, status: newStatus }))
                  onStatusChange()
                }}
              />
            </AdminPanel>

            {/* Historique des décisions */}
            <AdminPanel className="p-5">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">📜 Historique des décisions</h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-xs border-l-2 border-slate-200 pl-4 relative pb-2">
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-400" />
                  <div>
                    <p className="font-bold text-slate-700">Dossier créé</p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      <FormattedDate date={record.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions} />
                    </p>
                  </div>
                </div>

                {notesInfo.parsed?.history && Array.isArray(notesInfo.parsed.history) && notesInfo.parsed.history.length > 0 ? (
                  (notesInfo.parsed.history as any[]).map((entry: any, index: number) => (
                    <div key={index} className="flex gap-3 text-xs border-l-2 border-slate-200 pl-4 relative pb-2 font-sans">
                      <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-600" />
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800">
                          Statut : <span className="text-slate-500 font-semibold">{STATUS_LABELS[entry.fromStatus] || entry.fromStatus}</span> →{' '}
                          <span className="text-blue-600 font-bold">{STATUS_LABELS[entry.toStatus] || entry.toStatus}</span>
                        </p>
                        {entry.reason && (
                          <p className="text-slate-650 bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1">
                            « {entry.reason} »
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-bold flex flex-wrap items-center gap-1.5 mt-1">
                          <span>Par @{entry.adminUsername}</span>
                          <span>•</span>
                          <span>
                            <FormattedDate date={entry.timestamp} options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions} />
                          </span>
                          <span>•</span>
                          <span className={entry.emailSent ? 'text-emerald-600 font-extrabold' : 'text-slate-450 font-semibold'}>
                            {entry.emailSent ? '📧 Email envoyé' : '📧 Pas d\'email envoyé'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun changement de statut enregistré.</p>
                )}
              </div>
            </AdminPanel>

            <AdminPanel className="bg-slate-50/80 p-5 text-sm text-slate-700">
              <p>
                <strong>Inscription creee:</strong>{' '}
                <FormattedDate date={record.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions} />
              </p>
            </AdminPanel>

            {feedbackError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{feedbackError}</div>
            ) : null}
            {feedbackSuccess ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">{feedbackSuccess}</div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}









