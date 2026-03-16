'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StudentPortalNav from '@/components/student-portal/StudentPortalNav'

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
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
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
        setError('Impossible de charger le profil.')
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
    setError('')
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
        setError(data.error || 'Ãƒâ€°chec de mise ÃƒÂ  jour.')
        return
      }

      setMessage('Profil mis ÃƒÂ  jour avec succÃƒÂ¨s.')
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }))
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              student: {
                ...prev.student,
                ...data.student,
              },
            }
          : prev
      )
    } catch {
      setError('Ãƒâ€°chec de mise ÃƒÂ  jour.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Chargement du profil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <StudentPortalNav />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mon compte etudiant</h1>
            <p className="text-sm text-slate-600">Mettez ? jour vos informations personnelles et votre mot de passe.</p>
          </div>
          <Link
            href="/student/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Retour dashboard
          </Link>
        </div>

        {profile ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Numero etudiant</p>
              <p className="mt-1 font-semibold text-slate-900">{profile.student.studentNumber}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Statut</p>
              <p className="mt-1 font-semibold text-slate-900">{profile.student.status}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Formations suivies</p>
              <p className="mt-1 font-semibold text-slate-900">{profile.metrics.sessionsCount}</p>
            </div>
          </div>
        ) : null}

        {message ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Prenom</label>
              <input
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
              <input
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">WhatsApp</label>
              <input
                value={form.whatsapp}
                onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Adresse</label>
              <input
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ville</label>
              <input
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Pays</label>
              <input
                value={form.country}
                onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Changer mon mot de passe</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe actuel</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


