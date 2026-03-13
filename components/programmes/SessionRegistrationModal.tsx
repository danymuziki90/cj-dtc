'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import type { ProgramSessionType } from '@/lib/programmes/session-types'

type SessionCardData = {
  id: number
  formation: {
    title: string
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  format: string
  price: number
}

type FieldType = 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox'

type FieldConfig = {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: Array<{ value: string; label: string }>
  showIf?: (values: Record<string, string | boolean>) => boolean
}

type SectionConfig = {
  title: string
  fields: FieldConfig[]
}

const MRH_SECTIONS: SectionConfig[] = [
  {
    title: 'Informations personnelles',
    fields: [
      { key: 'lastName', label: 'Nom', type: 'text', required: true },
      { key: 'firstName', label: 'Prenom', type: 'text', required: true },
      { key: 'email', label: 'Email professionnel', type: 'email', required: true },
      { key: 'whatsapp', label: 'WhatsApp', type: 'tel', required: true },
      { key: 'dateOfBirth', label: 'Date de naissance', type: 'date', required: true },
      { key: 'address', label: 'Adresse', type: 'text', required: true },
    ],
  },
  {
    title: 'Informations professionnelles',
    fields: [
      { key: 'company', label: 'Entreprise', type: 'text', required: true },
      { key: 'position', label: 'Poste', type: 'text', required: true },
      {
        key: 'professionalStatus',
        label: 'Statut',
        type: 'select',
        required: true,
        options: [
          { value: 'employe', label: 'Employe' },
          { value: 'etudiant', label: 'Etudiant' },
          { value: 'entrepreneur', label: 'Entrepreneur' },
          { value: 'autre', label: 'Autre' },
        ],
      },
    ],
  },
  {
    title: 'Engagement et disponibilite',
    fields: [
      {
        key: 'practicalExercises',
        label: 'Pret a participer aux exercices pratiques ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'oui', label: 'Oui' },
          { value: 'non', label: 'Non' },
        ],
      },
      {
        key: 'preferredSessionType',
        label: 'Type de session prefere',
        type: 'select',
        required: true,
        options: [
          { value: 'distanciel', label: 'En ligne' },
          { value: 'hybride', label: 'Hybride' },
          { value: 'presentiel', label: 'Presentiel' },
        ],
      },
      { key: 'preferredSlots', label: 'Creneaux preferes', type: 'text', required: true },
      { key: 'weeklyHours', label: 'Investissement horaire', type: 'number', required: true },
      { key: 'conflictPlan', label: 'Plan en cas de conflit', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Niveau et experience RH',
    fields: [
      {
        key: 'rhLevel',
        label: 'Niveau RH',
        type: 'select',
        required: true,
        options: [
          { value: 'debutant', label: 'Debutant' },
          { value: 'intermediaire', label: 'Intermediaire' },
          { value: 'avance', label: 'Avance' },
        ],
      },
      { key: 'rhKnowledge', label: 'Connaissances RH', type: 'textarea', required: true },
      { key: 'rhTopics', label: 'Sujets a approfondir', type: 'textarea', required: true },
      { key: 'previousTrainings', label: 'Formations precedentes', type: 'textarea' },
    ],
  },
  {
    title: 'Motivation',
    fields: [
      { key: 'expectations', label: 'Attentes', type: 'textarea', required: true },
      { key: 'reasonsToJoin', label: "Raisons d'integration", type: 'textarea', required: true },
      { key: 'rhChallenges', label: 'Defis RH', type: 'textarea', required: true },
      { key: 'refusalReaction', label: 'Reaction en cas de refus', type: 'textarea', required: true },
      { key: 'concreteExpectations', label: 'Attentes concretes', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Engagement final',
    fields: [
      {
        key: 'acceptFinalExamProject',
        label: "Je m'engage a l'examen final et au projet.",
        type: 'checkbox',
        required: true,
      },
      {
        key: 'acceptTruthfulness',
        label: 'Je confirme que les informations sont exactes.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
]

const IOP_SECTIONS: SectionConfig[] = [
  {
    title: 'Informations personnelles',
    fields: [
      { key: 'lastName', label: 'Nom', type: 'text', required: true },
      { key: 'firstName', label: 'Prenom', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      {
        key: 'gender',
        label: 'Sexe',
        type: 'select',
        required: true,
        options: [
          { value: 'femme', label: 'Femme' },
          { value: 'homme', label: 'Homme' },
          { value: 'autre', label: 'Autre' },
        ],
      },
      { key: 'infoSource', label: "Source de l'information", type: 'text', required: true },
      { key: 'whatsapp', label: 'WhatsApp', type: 'tel', required: true },
      { key: 'age', label: 'Age', type: 'number', required: true },
    ],
  },
  {
    title: 'Situation actuelle',
    fields: [
      { key: 'currentStatus', label: 'Statut actuel', type: 'text', required: true },
      { key: 'currentDescription', label: 'Description actuelle', type: 'textarea', required: true },
      { key: 'biggestChallenge', label: 'Plus grand defi', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Experience et motivation',
    fields: [
      {
        key: 'previousTrainingParticipation',
        label: 'Formation precedente suivie ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'oui', label: 'Oui' },
          { value: 'non', label: 'Non' },
        ],
      },
      {
        key: 'respectRequirements',
        label: 'Respect des exigences ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'oui', label: 'Oui' },
          { value: 'non', label: 'Non' },
        ],
      },
      {
        key: 'limitedSeatsAcknowledgment',
        label: 'Je reconnais que les places sont limitees.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
  {
    title: 'Objectifs professionnels',
    fields: [
      { key: 'targetJob', label: 'Metier vise', type: 'text', required: true },
      { key: 'professionalExpectations', label: 'Attentes', type: 'textarea', required: true },
      { key: 'candidateConclusion', label: 'Conclusion', type: 'textarea', required: true },
      { key: 'educationLevel', label: "Niveau d'etudes", type: 'text', required: true },
      { key: 'expectedChange', label: 'Changement attendu', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Experiences passees et vision',
    fields: [
      { key: 'pastActions', label: 'Actions realisees', type: 'textarea', required: true },
      { key: 'failureLesson', label: 'Échec et leçon', type: 'textarea', required: true },
      { key: 'personalDiscipline', label: 'Discipline personnelle', type: 'textarea', required: true },
      { key: 'difficultAction', label: 'Action difficile', type: 'textarea', required: true },
      { key: 'projectionOneYear', label: 'Projection a 1 an', type: 'textarea', required: true },
      { key: 'projectionFiveYears', label: 'Projection a 5 ans', type: 'textarea', required: true },
      { key: 'selectionJustification', label: 'Justification de selection', type: 'textarea', required: true },
      { key: 'communityImpact', label: 'Impact communautaire', type: 'textarea', required: true },
      {
        key: 'answersAreAccurate',
        label: 'Je confirme que mes reponses sont exactes.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
]

const CONFERENCE_SECTIONS: SectionConfig[] = [
  {
    title: 'Informations personnelles',
    fields: [
      { key: 'lastName', label: 'Nom', type: 'text', required: true },
      { key: 'firstName', label: 'Prenom', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      {
        key: 'gender',
        label: 'Sexe',
        type: 'select',
        required: true,
        options: [
          { value: 'femme', label: 'Femme' },
          { value: 'homme', label: 'Homme' },
          { value: 'autre', label: 'Autre' },
        ],
      },
      { key: 'cityCountry', label: 'Ville / Pays', type: 'text', required: true },
      { key: 'whatsapp', label: 'WhatsApp', type: 'tel', required: true },
    ],
  },
  {
    title: 'Statut et experience',
    fields: [
      { key: 'profileStatus', label: 'Profil (leader/entrepreneur/etc.)', type: 'text', required: true },
      { key: 'organization', label: 'Organisation / Entreprise / Eglise', type: 'text', required: true },
      {
        key: 'followedIOP',
        label: 'A suivi IOP ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'oui', label: 'Oui' },
          { value: 'non', label: 'Non' },
        ],
      },
      {
        key: 'iopCertified',
        label: 'Certifie IOP ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'oui', label: 'Oui' },
          { value: 'non', label: 'Non' },
        ],
        showIf: (values) => values.followedIOP === 'oui',
      },
      { key: 'iopYear', label: 'Annee IOP', type: 'number', showIf: (values) => values.followedIOP === 'oui' },
    ],
  },
  {
    title: 'Projet au forum',
    fields: [
      {
        key: 'wantsProjectPitch',
        label: 'Souhaite presenter un projet ?',
        type: 'radio',
        required: true,
        options: [
          { value: 'oui', label: 'Oui' },
          { value: 'non', label: 'Non' },
        ],
      },
      { key: 'projectTitle', label: 'Titre du projet', type: 'text', required: true, showIf: (v) => v.wantsProjectPitch === 'oui' },
      { key: 'projectPitch', label: 'Pitch du projet', type: 'textarea', required: true, showIf: (v) => v.wantsProjectPitch === 'oui' },
      {
        key: 'conferenceAnswersConfirmed',
        label: 'Je confirme que les informations sont exactes.',
        type: 'checkbox',
        required: true,
      },
    ],
  },
]

function getSections(type: ProgramSessionType) {
  if (type === 'MRH') return MRH_SECTIONS
  if (type === 'IOP') return IOP_SECTIONS
  return CONFERENCE_SECTIONS
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`
}

function getInitialValues(sections: SectionConfig[]) {
  const initialValues: Record<string, string | boolean> = {}
  for (const section of sections) {
    for (const field of section.fields) {
      initialValues[field.key] = field.type === 'checkbox' ? false : ''
    }
  }
  return initialValues
}

interface SessionRegistrationModalProps {
  open: boolean
  locale: string
  session: SessionCardData | null
  programType: ProgramSessionType
  onClose: () => void
}

export default function SessionRegistrationModal({ open, locale, session, programType, onClose }: SessionRegistrationModalProps) {
  const sections = useMemo(() => getSections(programType), [programType])
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    kind: 'success' | 'error'
    message: string
    paymentId?: number
    paymentStatus?: string
  } | null>(null)
  const [checkingPawaPayStatus, setCheckingPawaPayStatus] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(getInitialValues(sections))
    setErrors({})
    setResult(null)
    setSubmitting(false)
    setCheckingPawaPayStatus(false)
  }, [open, sections])

  if (!open || !session) return null

  const onChangeValue = (key: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.showIf && !field.showIf(values)) continue
        if (!field.required) continue
        const current = values[field.key]
        if (field.type === 'checkbox') {
          if (current !== true) nextErrors[field.key] = 'Requis.'
        } else if (typeof current !== 'string' || !current.trim()) {
          nextErrors[field.key] = 'Requis.'
        }
      }
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setResult(null)

    try {
      const payload = {
        sessionId: session.id,
        formType: programType,
        personal: {
          firstName: String(values.firstName || ''),
          lastName: String(values.lastName || ''),
          email: String(values.email || ''),
          whatsapp: String(values.whatsapp || ''),
          address: typeof values.address === 'string' ? values.address : '',
          dateOfBirth: typeof values.dateOfBirth === 'string' ? values.dateOfBirth : '',
        },
        answers: {
          ...values,
          locale,
        },
        payment: {
          provider: 'pawapay',
          method: 'mobile_money',
          currency: 'USD',
          phoneNumber: String(values.whatsapp || ''),
        },
      }

      const response = await fetch('/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Inscription impossible.')
      }

      const action = data.payment?.action
      setResult({
        kind: 'success',
        message: action?.message || "Inscription enregistree avec succes.",
        paymentId: data.payment?.id,
        paymentStatus: data.payment?.status,
      })
    } catch (error) {
      setResult({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Erreur inattendue.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const checkPawaPayStatus = async () => {
    if (!result?.paymentId) return
    setCheckingPawaPayStatus(true)

    try {
      const response = await fetch(`/api/payments/pawapay/status?paymentId=${result.paymentId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de verifier le statut PawaPay.')
      }

      setResult((prev) =>
        prev
          ? {
              ...prev,
              kind: 'success',
              message: `Statut paiement: ${data.status}`,
              paymentStatus: data.status,
            }
          : prev
      )
    } catch (error) {
      setResult((prev) =>
        prev
          ? {
              ...prev,
              kind: 'error',
              message: error instanceof Error ? error.message : 'Erreur de verification.',
            }
          : prev
      )
    } finally {
      setCheckingPawaPayStatus(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-2 md:p-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Inscription session</p>
            <h3 className="text-lg font-semibold">{session.formation.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 overflow-hidden lg:grid-cols-[300px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
            <p className="text-sm text-slate-600">{formatDateRange(session.startDate, session.endDate)}</p>
            <p className="text-sm text-slate-600">{session.startTime} - {session.endTime}</p>
            <p className="text-sm text-slate-600">{session.location}</p>
            <p className="mt-2 text-sm text-slate-600">Type: {programType}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{formatPrice(session.price)}</p>
          </aside>

          <div className="overflow-y-auto p-4 md:p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              {sections.map((section) => (
                <section key={section.title} className="rounded-xl border border-slate-200 p-4">
                  <h4 className="text-base font-semibold text-slate-900">{section.title}</h4>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {section.fields.map((field) => {
                      if (field.showIf && !field.showIf(values)) return null
                      const value = values[field.key]
                      const error = errors[field.key]

                      if (field.type === 'checkbox') {
                        return (
                          <label key={field.key} className="col-span-full inline-flex items-start gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={value === true}
                              onChange={(e) => onChangeValue(field.key, e.target.checked)}
                              className="mt-0.5"
                            />
                            <span>{field.label}</span>
                            {error ? <span className="text-red-600">{error}</span> : null}
                          </label>
                        )
                      }

                      if (field.type === 'textarea') {
                        return (
                          <div key={field.key} className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              {field.label} {field.required ? '*' : ''}
                            </label>
                            <textarea
                              rows={3}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              value={typeof value === 'string' ? value : ''}
                              onChange={(e) => onChangeValue(field.key, e.target.value)}
                            />
                            {error ? <p className="text-xs text-red-600">{error}</p> : null}
                          </div>
                        )
                      }

                      if (field.type === 'select') {
                        return (
                          <div key={field.key}>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                              {field.label} {field.required ? '*' : ''}
                            </label>
                            <select
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              value={typeof value === 'string' ? value : ''}
                              onChange={(e) => onChangeValue(field.key, e.target.value)}
                            >
                              <option value="">Selectionner...</option>
                              {(field.options || []).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {error ? <p className="text-xs text-red-600">{error}</p> : null}
                          </div>
                        )
                      }

                      if (field.type === 'radio') {
                        return (
                          <div key={field.key} className="md:col-span-2">
                            <p className="mb-1 text-sm font-medium text-slate-700">
                              {field.label} {field.required ? '*' : ''}
                            </p>
                            <div className="flex gap-3">
                              {(field.options || []).map((option) => (
                                <label key={option.value} className="inline-flex items-center gap-2 text-sm text-slate-700">
                                  <input
                                    type="radio"
                                    name={field.key}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={() => onChangeValue(field.key, option.value)}
                                  />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                            {error ? <p className="text-xs text-red-600">{error}</p> : null}
                          </div>
                        )
                      }

                      return (
                        <div key={field.key}>
                          <label className="mb-1 block text-sm font-medium text-slate-700">
                            {field.label} {field.required ? '*' : ''}
                          </label>
                          <input
                            type={field.type}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            value={typeof value === 'string' ? value : ''}
                            onChange={(e) => onChangeValue(field.key, e.target.value)}
                          />
                          {error ? <p className="text-xs text-red-600">{error}</p> : null}
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}

              <section className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-base font-semibold text-slate-900">Paiement et conditions</h4>
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Paiement disponible: <strong>PawaPay Mobile Money</strong>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Saisissez votre numero WhatsApp ou Mobile Money. Le montant preleve correspond au prix de la session
                  et le correspondant PawaPay est detecte automatiquement.
                </p>
              </section>

              {result ? (
                <div className="space-y-2">
                  <p className={`text-sm ${result.kind === 'success' ? 'text-blue-700' : 'text-red-700'}`}>{result.message}</p>
                  {result.paymentStatus ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Statut paiement: {result.paymentStatus}
                    </p>
                  ) : null}
                  {result.paymentStatus === 'pending' && result.paymentId ? (
                    <button
                      type="button"
                      onClick={checkPawaPayStatus}
                      disabled={checkingPawaPayStatus}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 disabled:opacity-60"
                    >
                      {checkingPawaPayStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Verifier le statut PawaPay
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Traitement...' : "Valider l'inscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

