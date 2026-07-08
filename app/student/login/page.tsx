'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/student/dashboard'
  if (value.startsWith('/student/login') || value.startsWith('/student/register')) return '/student/dashboard'
  return value
}

function StudentLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = safeRedirect(searchParams.get('callbackUrl'))
  const successMessage = searchParams.get('registered')
    ? 'Compte cree avec succes. Vous pouvez maintenant vous connecter.'
    : ''

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "Nom d'utilisateur ou mot de passe incorrect.")
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError("Nom d'utilisateur ou mot de passe incorrect.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_58%,#fff4f5_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[30px] bg-[linear-gradient(135deg,#02142f_0%,#002d72_56%,#0c4da2_100%)] p-8 text-white shadow-[0_30px_90px_-40px_rgba(0,45,114,0.65)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Espace Etudiant</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">Connexion a votre tableau de bord</h1>
          <p className="mt-4 text-sm leading-7 text-white/78">
            Retrouvez vos inscriptions, ressources, travaux et certificats dans un espace securise.
          </p>
        </section>

        <section className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Se connecter</h2>
          <p className="mt-2 text-sm text-slate-600">Utilisez votre nom d'utilisateur ou votre adresse e-mail.</p>

          {successMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
                Nom d'utilisateur ou adresse e-mail
              </label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-[var(--cj-blue)]"
                data-testid="student-login-username"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-[var(--cj-blue)]"
                data-testid="student-login-password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[var(--cj-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-70"
              data-testid="student-login-submit"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link href="/student/register" className="font-semibold text-[var(--cj-blue)] hover:underline">
              Creer un compte
            </Link>
            <Link href="/student/forgot-password" className="font-semibold text-[var(--cj-blue)] hover:underline">
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
