'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function StudentLoginPage() {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/student/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(payload.error || "Nom d'utilisateur ou mot de passe incorrect. Veuillez reessayer.")
        setLoading(false)
        return
      }

      router.push(`/${locale}/espace-etudiants`)
      router.refresh()
    } catch {
      setError("Nom d'utilisateur ou mot de passe incorrect. Veuillez reessayer.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cj-blue-50)] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-cjblue">Espace Etudiant</h1>
        <p className="mb-6 text-sm text-slate-600">
          Connectez-vous avec les identifiants fournis par l administrateur.
        </p>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nom d utilisateur ou email</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cjblue px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-70"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href={`/${locale}/auth/forgot-password`} className="text-cjblue hover:underline">
            Mot de passe oublie ?
          </Link>
          <Link href={`/${locale}`} className="text-slate-500 hover:underline">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

