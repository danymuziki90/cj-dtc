'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

type FieldError = Record<string, string>

function safeRedirect(value: string | null, locale: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return `/${locale}/espace-etudiants`
  if (value.includes('/auth/student-login') || value.includes('/auth/student-register')) {
    return `/${locale}/espace-etudiants`
  }
  return value
}

function StudentRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'
  const nextPath = safeRedirect(searchParams.get('next') || searchParams.get('callbackUrl'), locale)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function validateClient(): FieldError {
    const errors: FieldError = {}
    if (form.fullName.trim().length < 2) errors.fullName = 'Le nom complet doit comporter au moins 2 caracteres.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Adresse e-mail invalide.'
    if (!/^[a-zA-Z0-9._-]{3,40}$/.test(form.username.trim())) {
      errors.username = 'Le nom d utilisateur doit contenir 3 a 40 caracteres valides.'
    }
    if (form.password.length < 8) errors.password = 'Le mot de passe doit comporter au moins 8 caracteres.'
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    return errors
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setGlobalError('')

    const clientErrors = validateClient()
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/student/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          username: form.username.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (data.details?.fieldErrors) {
          const serverFieldErrors: FieldError = {}
          for (const [key, messages] of Object.entries(data.details.fieldErrors)) {
            serverFieldErrors[key] = Array.isArray(messages) ? String(messages[0]) : String(messages)
          }
          setFieldErrors(serverFieldErrors)
        } else {
          setGlobalError(data.error || 'Impossible de creer le compte.')
        }
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch {
      setGlobalError('Impossible de creer le compte pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  function field(id: keyof typeof form, label: string, type = 'text', autoComplete?: string) {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={form[id]}
          onChange={handleChange}
          className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-[var(--cj-blue)] ${
            fieldErrors[id] ? 'border-red-400 bg-red-50' : 'border-blue-100 bg-white'
          }`}
          required
          aria-invalid={Boolean(fieldErrors[id])}
        />
        {fieldErrors[id] ? <p className="mt-1 text-xs text-red-600">{fieldErrors[id]}</p> : null}
      </div>
    )
  }

  const loginHref = `/${locale}/auth/student-login?next=${encodeURIComponent(nextPath)}`

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_58%,#fff4f5_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">

        <section className="w-full rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Créer un compte étudiant</h2>
          <p className="mt-2 text-sm text-slate-600">Renseignez les informations de base de votre compte.</p>

          {nextPath.includes('confirm-inscription') ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3.5 text-xs font-bold text-[var(--cj-blue)] shadow-sm">
              <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Créez votre compte étudiant pour finaliser votre inscription à la session sélectionnée.</span>
            </div>
          ) : null}

          {globalError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {globalError}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {field('fullName', 'Nom complet', 'text', 'name')}
            {field('email', 'Adresse e-mail', 'email', 'email')}
            {field('username', "Nom d'utilisateur", 'text', 'username')}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('password', 'Mot de passe', 'password', 'new-password')}
              {field('confirmPassword', 'Confirmation du mot de passe', 'password', 'new-password')}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[var(--cj-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)] disabled:opacity-70"
            >
              {loading ? 'Creation en cours...' : 'Creer mon compte'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Vous avez deja un compte ?{' '}
            <Link href={loginHref} className="font-semibold text-[var(--cj-blue)] hover:underline">
              Se connecter
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default function StudentRegisterPage() {
  return (
    <Suspense fallback={null}>
      <StudentRegisterForm />
    </Suspense>
  )
}
