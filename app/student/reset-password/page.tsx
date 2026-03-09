'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'

export default function StudentResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const query = new URLSearchParams(window.location.search)
    setToken(query.get('token'))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Token manquant.')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/student/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Echec de reinitialisation.')
        return
      }

      setMessage(data.message || 'Mot de passe reinitialise avec succes.')
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError('Echec de reinitialisation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Reinitialiser le mot de passe</h1>
        <p className="mb-6 text-sm text-slate-600">Definissez un nouveau mot de passe pour votre compte etudiant.</p>

        {message ? (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Traitement...' : 'Mettre a jour le mot de passe'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link href="/student/login" className="text-blue-600 hover:underline">
            Retour connexion
          </Link>
        </div>
      </div>
    </div>
  )
}

