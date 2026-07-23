'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

function safeRedirect(value: string | null, locale: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return `/${locale}/espace-etudiants`
  if (value.includes('/auth/student-login') || value.includes('/auth/student-register')) {
    return `/${locale}/espace-etudiants`
  }
  return value
}

function StudentLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'
  const nextPath = safeRedirect(searchParams.get('next') || searchParams.get('callbackUrl'), locale)
  const successMessage = searchParams.get('registered')
    ? 'Compte cree avec succes. Vous pouvez maintenant vous connecter.'
    : ''

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
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(payload.error || "Nom d'utilisateur ou mot de passe incorrect.")
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "Erreur de réseau ou serveur indisponible. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const registerHref = `/${locale}/auth/student-register?next=${encodeURIComponent(nextPath)}`

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_58%,#fff4f5_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">

        <section className="w-full rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Se connecter</h2>
          <p className="mt-2 text-sm text-slate-600">Utilisez votre nom d'utilisateur ou votre adresse e-mail.</p>

          {successMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          {nextPath.includes('confirm-inscription') ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3.5 text-xs font-bold text-[var(--cj-blue)] shadow-sm">
              <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Connectez-vous ou créez votre compte étudiant pour poursuivre votre inscription à la session sélectionnée.</span>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="student-username" className="mb-1 block text-sm font-medium text-slate-700">
                Nom d'utilisateur ou adresse e-mail
              </label>
              <input
                id="student-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-[var(--cj-blue)]"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="student-password" className="mb-1 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                id="student-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-[var(--cj-blue)]"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[var(--cj-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-70"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link href={registerHref} className="font-semibold text-[var(--cj-blue)] hover:underline">
              Creer un compte
            </Link>
            <Link href={`/${locale}/auth/forgot-password`} className="font-semibold text-[var(--cj-blue)] hover:underline">
              Mot de passe oublie ?
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={null}>
      <StudentLoginForm />
    </Suspense>
  )
}
