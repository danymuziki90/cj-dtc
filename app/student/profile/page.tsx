'use client'

import { FormEvent, useEffect, useState } from 'react'
import { KeyRound, User } from 'lucide-react'
import {
  StudentSectionCard,
  studentInputClassName,
  studentPrimaryButtonClassName,
  type StudentMetric,
} from '@/components/ui/student-space'
import {
  StudentPortalError,
  StudentPortalLoading,
  StudentPortalPageShell,
} from '@/components/student-portal/StudentPortalPageShell'
import { useRouter } from 'next/navigation'

type ProfileResponse = {
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
    username: string | null
    whatsapp: string | null
    status: string
    studentNumber: string
    address: string | null
    city: string | null
    country: string | null
    createdAt: string
  }
  metrics: {
    sessionsCount: number
    submissionsCount: number
    certificatesCount: number
  }
}

export default function StudentProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    address: '',
    city: '',
    country: '',
    currentPassword: '',
    newPassword: '',
  })

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      const response = await fetch('/api/student/system/profile', { cache: 'no-store' })
      if (response.status === 401 || response.status === 403) {
        router.push('/student/login')
        return
      }
      if (!response.ok) {
        setLoadError('Impossible de charger le profil.')
        setLoading(false)
        return
      }

      const data = (await response.json()) as ProfileResponse
      setProfile(data)
      setForm({
        firstName: data.student.firstName || '',
        lastName: data.student.lastName || '',
        email: data.student.email || '',
        whatsapp: data.student.whatsapp || '',
        address: data.student.address || '',
        city: data.student.city || '',
        country: data.student.country || '',
        currentPassword: '',
        newPassword: '',
      })
      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    setMessage('')
    setSaving(true)

    try {
      const response = await fetch('/api/student/system/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || 'Echec de la mise a jour.')
        return
      }

      setMessage('Profil mis a jour avec succes.')
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }))
      setProfile((prev) =>
        prev
          ? { ...prev, student: { ...prev.student, ...data.student } }
          : prev
      )
    } catch {
      setFormError('Echec de la mise a jour. Veuillez reessayer.')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <StudentPortalLoading
        title="Mon profil"
        description="Gerer vos informations personnelles et votre mot de passe."
        icon={User}
      />
    )
  }

  if (loadError) {
    return (
      <StudentPortalError
        title="Mon profil"
        description="Gerer vos informations personnelles et votre mot de passe."
        icon={User}
        error={loadError}
      />
    )
  }

  const metrics: StudentMetric[] = [
    {
      label: 'Numero etudiant',
      value: profile?.student.studentNumber || '-',
      helper: 'Identifiant unique de votre compte.',
      icon: User,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'Statut',
      value: profile?.student.status || '-',
      helper: 'Etat actuel de votre compte.',
      icon: User,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'Sessions',
      value: profile?.metrics.sessionsCount ?? 0,
      helper: 'Inscriptions enregistrees.',
      icon: User,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
    {
      label: 'Travaux',
      value: profile?.metrics.submissionsCount ?? 0,
      helper: 'Fichiers deposes.',
      icon: User,
      accent: 'from-[#001737] to-[#002D72]',
    },
  ]

  return (
    <StudentPortalPageShell
      title="Mon profil"
      description="Mettez a jour vos informations personnelles et changez votre mot de passe."
      icon={User}
      metrics={metrics}
    >
      <form onSubmit={onSubmit} noValidate>
        {/* Informations personnelles */}
        <StudentSectionCard
          eyebrow="Compte"
          title="Informations personnelles"
          description="Ces informations sont visibles par l'administration."
          icon={User}
        >
          {message ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700" role="status">
              {message}
            </div>
          ) : null}
          {formError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
                Prenom <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className={studentInputClassName}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={studentInputClassName}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={studentInputClassName}
                required
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-slate-700">
                Telephone
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                value={form.whatsapp}
                onChange={handleChange}
                className={studentInputClassName}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
                Adresse
              </label>
              <input
                id="address"
                name="address"
                autoComplete="street-address"
                value={form.address}
                onChange={handleChange}
                className={studentInputClassName}
              />
            </div>
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
                Ville
              </label>
              <input
                id="city"
                name="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={handleChange}
                className={studentInputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="country" className="mb-1 block text-sm font-medium text-slate-700">
                Pays
              </label>
              <input
                id="country"
                name="country"
                autoComplete="country-name"
                value={form.country}
                onChange={handleChange}
                className={studentInputClassName}
              />
            </div>
          </div>
        </StudentSectionCard>

        {/* Changement de mot de passe */}
        <div className="mt-6">
          <StudentSectionCard
            eyebrow="Securite"
            title="Changer mon mot de passe"
            description="Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe."
            icon={KeyRound}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-slate-700">
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className={studentInputClassName}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className={studentInputClassName}
                  placeholder="Minimum 8 caracteres"
                />
              </div>
            </div>
          </StudentSectionCard>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className={`${studentPrimaryButtonClassName} disabled:opacity-70`}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </StudentPortalPageShell>
  )
}
