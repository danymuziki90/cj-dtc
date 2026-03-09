'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ProgramSessionType } from '@/lib/programmes/session-types'
import { inferProgramSessionType } from '@/lib/programmes/session-types'
import EnrollmentStatusChanger from './EnrollmentStatusChanger'
import { FormattedDate } from './FormattedDate'

type Payment = {
  id: number
  amount: number
  method: string
  status: string
  reference: string | null
  transactionId: string | null
  notes: string | null
  paidAt: string | null
  createdAt: string
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
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  paymentMethod?: string | null
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
  payments?: Payment[]
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

const METHOD_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  bank_transfer: 'Virement bancaire',
  cash: 'Especes',
  check: 'Cheque',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount || 0)
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

function parsePaymentNotes(notes: string | null) {
  const parsed = parseJsonObject(notes)
  if (!parsed) return {}

  return {
    gateway: typeof parsed.gateway === 'string' ? parsed.gateway : null,
    operator: typeof parsed.operator === 'string' ? parsed.operator : null,
    phoneNumberMasked: typeof parsed.phoneNumberMasked === 'string' ? parsed.phoneNumberMasked : null,
    proofUrl:
      typeof parsed.proofUrl === 'string'
        ? parsed.proofUrl
        : typeof parsed.paymentProofUrl === 'string'
        ? parsed.paymentProofUrl
        : null,
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

function sortPayments(payments: Payment[] | undefined) {
  return [...(payments || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export default function EnrollmentPreviewModal({
  enrollment,
  onClose,
  onStatusChange,
}: EnrollmentPreviewModalProps) {
  const [record, setRecord] = useState<Enrollment>(enrollment)
  const [internalComment, setInternalComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('mobile_money')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentTransactionId, setPaymentTransactionId] = useState('')
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string } | null>(null)

  useEffect(() => {
    setRecord(enrollment)
    const notes = parseEnrollmentNotes(enrollment.notes)
    setInternalComment(notes.adminComment)
    setPaymentMethod(
      sortPayments(enrollment.payments)[0]?.method ||
        enrollment.paymentMethod ||
        'mobile_money'
    )
    setPaymentReference('')
    setPaymentTransactionId('')
    setFeedbackError(null)
    setFeedbackSuccess(null)
    setGeneratedCredentials(null)
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

  const payments = sortPayments(record.payments)
  const canConfirmPayment = record.paymentStatus !== 'paid'

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

  async function handleConfirmPayment() {
    setConfirmingPayment(true)
    setFeedbackError(null)
    setFeedbackSuccess(null)

    try {
      const response = await fetch(`/api/enrollments/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirmPayment',
          paymentMethod,
          amount: record.totalAmount > 0 ? record.totalAmount : undefined,
          reference: paymentReference || undefined,
          transactionId: paymentTransactionId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Impossible de confirmer le paiement.')
      }

      if (data.enrollment) {
        setRecord((prev) => ({ ...prev, ...data.enrollment }))
      }

      if (data.credentials?.username && data.credentials?.password) {
        setGeneratedCredentials({
          username: data.credentials.username,
          password: data.credentials.password,
        })
      } else {
        setGeneratedCredentials(null)
      }

      setFeedbackSuccess(
        data.accountCreated
          ? 'Paiement confirmé. Compte étudiant créé et email envoyé.'
          : 'Paiement confirmé. Compte étudiant activé/maintenu et email envoyé.'
      )

      onStatusChange()
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setConfirmingPayment(false)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Inscription #{record.id} - {record.firstName} {record.lastName}
          </h2>
          <button onClick={onClose} className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100">
            Fermer
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 p-4">
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
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Donnees du participant</h3>
              {enrichedSections.length === 0 && additionalAnswers.length === 0 ? (
                <p className="text-sm text-slate-600">Aucune reponse detaillee disponible.</p>
              ) : (
                <div className="space-y-4">
                  {enrichedSections.map((section) => (
                    <div key={section.title} className="rounded-lg border border-slate-100 p-3">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">{section.title}</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {section.rows.map((row) => (
                          <div key={row.key}>
                            <p className="text-xs text-slate-500">{row.label}</p>
                            <p className="text-sm text-slate-900">{displayValue(row.value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {additionalAnswers.length > 0 ? (
                    <div className="rounded-lg border border-slate-100 p-3">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Autres reponses</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {additionalAnswers.map((entry) => (
                          <div key={entry.key}>
                            <p className="text-xs text-slate-500">{entry.key}</p>
                            <p className="text-sm text-slate-900">{displayValue(entry.value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {record.motivationLetter ? (
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Lettre de motivation</h3>
                <button
                  onClick={downloadMotivationLetter}
                  className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Telecharger
                </button>
              </div>
            ) : null}
          </section>

          <section className="space-y-6">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Verification paiement</h3>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-slate-500">Statut paiement</p>
                  <p className="font-medium text-slate-900">{record.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-slate-500">Statut inscription</p>
                  <p className="font-medium text-slate-900">{record.status}</p>
                </div>
                <div>
                  <p className="text-slate-500">Montant total</p>
                  <p className="font-medium text-slate-900">{formatCurrency(record.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Montant paye</p>
                  <p className="font-medium text-slate-900">{formatCurrency(record.paidAmount)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 className="mb-2 text-sm font-semibold text-slate-800">Confirmer paiement</h4>
                {canConfirmPayment ? (
                  <>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Methode</label>
                        <select
                          value={paymentMethod}
                          onChange={(event) => setPaymentMethod(event.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        >
                          <option value="mobile_money">Mobile Money</option>
                          <option value="card">Carte bancaire</option>
                          <option value="bank_transfer">Virement bancaire</option>
                          <option value="cash">Especes</option>
                          <option value="check">Cheque</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Reference</label>
                        <input
                          value={paymentReference}
                          onChange={(event) => setPaymentReference(event.target.value)}
                          placeholder="REF-123"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-600">Transaction ID</label>
                        <input
                          value={paymentTransactionId}
                          onChange={(event) => setPaymentTransactionId(event.target.value)}
                          placeholder="TX-..."
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={confirmingPayment}
                      className="mt-3 rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                  {confirmingPayment ? 'Confirmation...' : 'Confirmer le paiement et créer/activer le compte étudiant'}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-blue-700">Paiement deja confirme pour cette inscription.</p>
                )}
              </div>

              {generatedCredentials ? (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                  <p className="font-semibold text-blue-800">Nouveau compte étudiant créé</p>
                  <p className="mt-1 text-blue-700">Username: {generatedCredentials.username}</p>
                  <p className="text-blue-700">Mot de passe initial: {generatedCredentials.password}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Transactions</h3>
              {payments.length === 0 ? (
                <p className="text-sm text-slate-600">Aucune transaction enregistree.</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => {
                    const details = parsePaymentNotes(payment.notes)

                    return (
                      <div key={payment.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                        <div className="grid gap-2 md:grid-cols-2">
                          <p>
                            <strong>ID:</strong> {payment.id}
                          </p>
                          <p>
                            <strong>Montant:</strong> {formatCurrency(payment.amount)}
                          </p>
                          <p>
                            <strong>Methode:</strong> {METHOD_LABELS[payment.method] || payment.method}
                          </p>
                          <p>
                            <strong>Statut:</strong> {payment.status}
                          </p>
                          <p>
                            <strong>Reference:</strong> {payment.reference || '-'}
                          </p>
                          <p>
                            <strong>Transaction:</strong> {payment.transactionId || '-'}
                          </p>
                          <p>
                            <strong>Gateway:</strong> {details.gateway || '-'}
                          </p>
                          <p>
                            <strong>Operateur:</strong> {details.operator || '-'}
                          </p>
                          <p>
                            <strong>Date creation:</strong>{' '}
                            <FormattedDate date={payment.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions} />
                          </p>
                          <p>
                            <strong>Date paiement:</strong>{' '}
                            {payment.paidAt ? (
                              <FormattedDate date={payment.paidAt} options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions} />
                            ) : (
                              '-'
                            )}
                          </p>
                          {details.phoneNumberMasked ? (
                            <p>
                              <strong>Numero masque:</strong> {details.phoneNumberMasked}
                            </p>
                          ) : null}
                          {details.proofUrl ? (
                            <p>
                              <strong>Preuve:</strong>{' '}
                              <a className="text-blue-700 underline" href={details.proofUrl} target="_blank" rel="noreferrer">
                                Ouvrir
                              </a>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Commentaires internes</h3>
              <textarea
                value={internalComment}
                onChange={(event) => setInternalComment(event.target.value)}
                rows={4}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Ajouter une note interne (sans perdre les reponses du formulaire)"
              />
              <button
                onClick={handleSaveComment}
                disabled={savingComment}
                className="mt-2 rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {savingComment ? 'Enregistrement...' : 'Enregistrer commentaire'}
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
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
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                <strong>Inscription creee:</strong>{' '}
                <FormattedDate date={record.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' } as Intl.DateTimeFormatOptions} />
              </p>
            </div>

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

