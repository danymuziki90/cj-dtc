'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CalendarDays, CheckCircle2, GraduationCap, Loader2, MapPin, ShieldCheck } from 'lucide-react'
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
  slug: string
  description?: string | null
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
  format: string
  price: number
  formation: Formation
}

type AuthState = 'checking' | 'authenticated' | 'anonymous'
type SubmitState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

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
  const [formation, setFormation] = useState<Formation | null>(null)
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      const authResponse = await fetch('/api/student/auth/me', { cache: 'no-store' })
      if (active) setAuthState(authResponse.ok ? 'authenticated' : 'anonymous')

      if (!formationId) {
        if (active) {
          setError('Formation invalide.')
          setLoading(false)
        }
        return
      }

      try {
        if (sessionId) {
          const sessionsResponse = await fetch('/api/sessions', { cache: 'no-store' })
          if (!sessionsResponse.ok) throw new Error('Impossible de charger la session.')
          const sessions = (await sessionsResponse.json()) as TrainingSession[]
          const selectedSession = sessions.find((item) => item.id === sessionId && item.formationId === formationId)
          if (!selectedSession) throw new Error('Session introuvable pour cette formation.')
          if (active) {
            setSession(selectedSession)
            setFormation(selectedSession.formation)
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
    if (!formation) return []
    return [
      { label: 'Formation', value: formation.title, icon: GraduationCap },
      {
        label: 'Periode',
        value: session ? `${formatDate(session.startDate)} - ${formatDate(session.endDate)}` : 'A confirmer',
        icon: CalendarDays,
      },
      {
        label: 'Lieu / format',
        value: session ? [session.location, session.format].filter(Boolean).join(' | ') : 'A confirmer',
        icon: MapPin,
      },
    ]
  }, [formation, session])

  async function confirmEnrollment(event: FormEvent) {
    event.preventDefault()
    if (!formation) return

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
            Chargement...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  if (authState === 'anonymous') {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Connectez-vous pour continuer"
        description="Les demandes d'inscription sont maintenant rattachees a un compte etudiant unique."
        icon={ShieldCheck}
      >
        <StudentSectionCard
          eyebrow="Compte requis"
          title="Un compte etudiant est necessaire"
          description="Connectez-vous ou creez votre compte. Vous reviendrez automatiquement sur cette confirmation."
          icon={ShieldCheck}
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/auth/student-login?next=${encodeURIComponent(nextPath)}`}
              className={studentPrimaryButtonClassName}
            >
              Se connecter
            </Link>
            <Link
              href={`/${locale}/auth/student-register?next=${encodeURIComponent(nextPath)}`}
              className={studentMutedButtonClassName}
            >
              Creer un compte
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
        eyebrow="Espace etudiant"
        title="Demande impossible"
        description="La formation demandee n'a pas pu etre chargee."
        icon={ShieldCheck}
      >
        <StudentEmptyState
          title="Formation introuvable"
          description={error}
          action={
            <Link href={`/${locale}/formations#sessions`} className={studentPrimaryButtonClassName}>
              Voir les formations
            </Link>
          }
        />
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Confirmer votre inscription"
      description="Aucune ressaisie n'est necessaire. La demande sera liee a votre compte et transmise a l'administration."
      icon={ShieldCheck}
      actions={
        <Link href={`/${locale}/formations#sessions`} className={studentSecondaryButtonClassName}>
          <ArrowLeft className="h-4 w-4" />
          Changer de formation
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StudentSectionCard
          eyebrow="Demande"
          title={formation?.title || 'Formation selectionnee'}
          description="Verifiez les informations puis confirmez. Le statut initial sera En attente."
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
            {session ? (
              <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-700">
                Montant indicatif: <span className="font-semibold text-slate-950">{formatCurrency(session.price)}</span>
              </div>
            ) : null}
          </div>
        </StudentSectionCard>

        <StudentSectionCard
          eyebrow="Confirmation"
          title="Envoi a l'administration"
          description="Votre profil etudiant fournit automatiquement nom, telephone et email."
          icon={CheckCircle2}
        >
          {submitState === 'success' ? (
            <StudentEmptyState
              title="Demande envoyee"
              description="Votre demande est maintenant en attente de validation dans le tableau de bord administrateur."
              action={
                <Link href={`/${locale}/espace-etudiants/mes-formations`} className={studentPrimaryButtonClassName}>
                  Voir mes formations
                </Link>
              }
            />
          ) : submitState === 'duplicate' ? (
            <StudentEmptyState
              title="Demande deja existante"
              description="Vous avez deja une demande active pour cette formation."
              action={
                <Link href={`/${locale}/espace-etudiants/mes-formations`} className={studentPrimaryButtonClassName}>
                  Suivre mes demandes
                </Link>
              }
            />
          ) : (
            <form onSubmit={confirmEnrollment} className="space-y-4">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5 text-sm leading-6 text-slate-600">
                En confirmant, une demande d'inscription sera creee avec le statut En attente. Aucune nouvelle fiche etudiant ne sera creee.
              </div>
              <button
                type="submit"
                disabled={submitState === 'loading'}
                className={`${studentPrimaryButtonClassName} w-full disabled:opacity-70`}
              >
                {submitState === 'loading' ? 'Envoi en cours...' : "Confirmer l'inscription"}
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
