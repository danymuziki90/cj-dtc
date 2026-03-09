'use client'

import { FormEvent, useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type AdminRow = {
  id: string
  username: string
  createdAt: string
  updatedAt: string
}

type MeResponse = {
  admin: {
    id: string
    username: string
  }
}

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [currentAdmin, setCurrentAdmin] = useState<MeResponse['admin'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [adminsRes, meRes] = await Promise.all([
        fetch('/api/admin/system/admins', { cache: 'no-store' }),
        fetch('/api/admin/auth/me', { cache: 'no-store' }),
      ])

      if (!adminsRes.ok || !meRes.ok) {
        throw new Error('Unable to load admin settings.')
      }

      const adminsPayload = await adminsRes.json()
      const mePayload = (await meRes.json()) as MeResponse

      setAdmins(adminsPayload.admins || [])
      setCurrentAdmin(mePayload.admin || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function createAdmin(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/system/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || 'Unable to create admin.')

      setCreateForm({ username: '', password: '' })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setSaving(false)
    }
  }

  async function resetAdminPassword(admin: AdminRow) {
    const nextPassword = window.prompt(`Nouveau mot de passe pour ${admin.username}`)
    if (!nextPassword) return

    const response = await fetch(`/api/admin/system/admins/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: nextPassword }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(payload?.error || 'Unable to reset password.')
      return
    }

    alert(`Mot de passe mis a jour pour ${admin.username}.`)
  }

  async function renameAdmin(admin: AdminRow) {
    const username = window.prompt('Nouveau username', admin.username)
    if (!username || username === admin.username) return

    const response = await fetch(`/api/admin/system/admins/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(payload?.error || 'Unable to update username.')
      return
    }

    await loadData()
  }

  async function removeAdmin(admin: AdminRow) {
    const confirmed = window.confirm(`Supprimer le compte admin "${admin.username}" ?`)
    if (!confirmed) return

    const response = await fetch(`/api/admin/system/admins/${admin.id}`, { method: 'DELETE' })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(payload?.error || 'Unable to delete admin.')
      return
    }

    await loadData()
  }

  async function updateMyPassword(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('La confirmation du nouveau mot de passe ne correspond pas.')
      return
    }

    const response = await fetch('/api/admin/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(payload?.error || 'Unable to update password.')
      return
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    alert('Mot de passe admin mis a jour.')
  }

  return (
    <AdminShell title="Parametres Admin">
      <div className="space-y-6">
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Ajouter un administrateur</h2>
          <form onSubmit={createAdmin} className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              value={createForm.username}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="username"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="mot de passe"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70"
            >
              {saving ? 'Creation...' : 'Creer admin'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Modifier mon mot de passe</h2>
          <form onSubmit={updateMyPassword} className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
              placeholder="mot de passe actuel"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              placeholder="nouveau mot de passe"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
              }
              placeholder="confirmer nouveau mot de passe"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Enregistrer
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Comptes administrateurs</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Username</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Creation</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Maj</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-3 py-3 text-slate-900">
                      {admin.username}
                      {currentAdmin?.id === admin.id ? (
                        <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                          vous
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {new Date(admin.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {new Date(admin.updatedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => renameAdmin(admin)}
                          className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Renommer
                        </button>
                        <button
                          onClick={() => resetAdminPassword(admin)}
                          className="rounded border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                        >
                          Reset mdp
                        </button>
                        <button
                          onClick={() => removeAdmin(admin)}
                          disabled={currentAdmin?.id === admin.id}
                          className="rounded border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-500">
                      Aucun compte admin.
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-500">
                      Chargement...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
