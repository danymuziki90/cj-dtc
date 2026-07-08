'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Lock, Shield } from 'lucide-react'

const errorMessages: Record<string, string> = {
  expired:
    'Votre session a expiré. Veuillez vous reconnecter pour reprendre vos opérations.',
  unauthorized:
    'Accès non autorisé. Ce portail est réservé aux administrateurs habilités.',
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'
  const errorQuery = searchParams.get('error') || ''

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
        setError(data.error || 'Identifiants invalides. Vérifiez vos informations et réessayez.')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Impossible de se connecter au serveur. Veuillez réessayer dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/70 bg-white/88 shadow-[0_40px_110px_-60px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">

        {/* Panneau gauche — identité */}
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,rgba(0,45,114,0.98),rgba(0,48,160,0.92),rgba(227,6,19,0.88))] px-6 py-10 text-white md:px-10 md:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_26%)]" />
          {/* Grille décorative */}
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                Accès administrateur
              </div>

              <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                Portail d'administration
                <br />
                <span className="text-blue-200">CJ Development</span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-blue-50/90 md:text-base">
                Connectez-vous pour gérer les sessions, les inscriptions et le suivi des étudiants
                depuis un espace de travail clair, sécurisé et adapté aux opérations du centre.
              </p>
            </div>

            {/* Indicateurs de capacités */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Sessions & cohortes', desc: 'Calendrier et capacités' },
                { label: 'Étudiants & accès', desc: 'Comptes et portail' },
                { label: 'Inscriptions & travaux', desc: 'Suivi et corrections' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"
                >
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-[11px] text-blue-100/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panneau droit — formulaire */}
        <section className="flex flex-col justify-center px-6 py-10 md:px-10 md:py-14">
          <div className="mx-auto w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-[26px] border border-slate-200 bg-white shadow-[0_22px_60px_-44px_rgba(0,48,160,0.45)]">
                <img src="/logo.png" alt="CJ Development Training Center" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Connexion sécurisée
                </p>
                <h2 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-950">Bienvenue</h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600">
              Utilisez vos identifiants administrateurs pour accéder au tableau de bord, aux contenus
              éditoriaux et aux opérations étudiants.
            </p>

            {/* Message d'erreur */}
            {(errorQuery || error) ? (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-[22px] border border-[var(--admin-accent-200)] bg-[var(--admin-accent-50)] px-4 py-3 text-sm text-[var(--admin-accent-700)]"
              >
                <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {error || errorMessages[errorQuery] || 'Une erreur est survenue. Veuillez vous reconnecter.'}
                </span>
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nom d'utilisateur
                </label>
                <input
                  id="admin-username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--admin-primary-200)] focus:ring-4 focus:ring-[var(--admin-primary-100)]"
                  placeholder="Votre identifiant administrateur"
                  data-testid="admin-login-username"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Mot de passe
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--admin-primary-200)] focus:ring-4 focus:ring-[var(--admin-primary-100)]"
                  placeholder="Votre mot de passe"
                  data-testid="admin-login-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[var(--admin-primary)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-70"
                data-testid="admin-login-submit"
              >
                {loading ? (
                  'Connexion en cours…'
                ) : (
                  <>
                    Accéder à l'administration
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Accès réservé au personnel administratif habilité de CJ Development Training Center.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  )
}
