'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Identifiants invalides.')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Impossible de se connecter. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/70 bg-white/86 shadow-[0_40px_110px_-60px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,rgba(0,45,114,0.98),rgba(0,48,160,0.92),rgba(227,6,19,0.88))] px-6 py-8 text-white md:px-8 md:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_26%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Acces admin
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Une connexion admin claire et professionnelle.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-blue-50/90 md:text-[15px]">
                Accedez a une interface claire pour suivre les KPIs, les risques et les actions prioritaires du panneau admin.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Acces securise',
                  text: 'Authentification admin et secrets dedies au portail.',
                },
                {
                  icon: LockKeyhole,
                  title: 'Controle fin',
                  text: 'Actions critiques, paiements et comptes sous surveillance.',
                },
                {
                  icon: Sparkles,
                  title: 'Interface coherente',
                  text: 'Une base claire pour toutes les pages de gestion.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.title} className="rounded-[26px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/12">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-blue-50/85">{item.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-8 md:px-8 md:py-10">
          <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-[26px] border border-slate-200 bg-white shadow-[0_22px_60px_-44px_rgba(0,48,160,0.45)]">
                <img src="/logo.png" alt="CJ DTC" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Connexion admin</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Bienvenue</h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600">
              Utilisez vos identifiants administrateur pour acceder au tableau de bord, aux paiements, aux contenus et aux operations etudiants.
            </p>

            {error ? (
              <div className="mt-6 rounded-[24px] border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm text-[var(--admin-accent-700)]">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nom d utilisateur</label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--admin-primary-200)] focus:ring-4 focus:ring-[var(--admin-primary-100)]"
                  placeholder="nom d utilisateur admin"
                  data-testid="admin-login-username"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--admin-primary-200)] focus:ring-4 focus:ring-[var(--admin-primary-100)]"
                  placeholder="mot de passe"
                  data-testid="admin-login-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[var(--admin-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-70"
                data-testid="admin-login-submit"
              >
                <ArrowRight className="h-4 w-4" />
                {loading ? 'Connexion en cours...' : 'Acceder au panneau admin'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
