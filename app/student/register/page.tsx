'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type FieldError = Record<string, string>

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/student/dashboard'
  if (value.startsWith('/student/login') || value.startsWith('/student/register')) return '/student/dashboard'
  return value
}

function StudentRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = safeRedirect(searchParams.get('callbackUrl'))

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    city: '',
    country: '',
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
      errors.username = "Le nom d'utilisateur doit contenir 3 a 40 caracteres valides (lettres, chiffres, . - _)."
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
          phone: form.phone.trim() || undefined,
          city: form.city.trim() || undefined,
          country: form.country.trim() || undefined,
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

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setGlobalError('Impossible de creer le compte pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  function field(
    id: keyof typeof form,
    label: string,
    type = 'text',
    autoComplete?: string,
    required = false,
    placeholder?: string,
  ) {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : <span className="ml-1 text-xs text-slate-400">(optionnel)</span>}
        </label>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={form[id]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-[var(--cj-blue)] ${
            fieldErrors[id] ? 'border-red-400 bg-red-50' : 'border-blue-100 bg-white'
          }`}
          required={required}
          aria-invalid={Boolean(fieldErrors[id])}
          aria-describedby={fieldErrors[id] ? `${id}-error` : undefined}
        />
        {fieldErrors[id] ? (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {fieldErrors[id]}
          </p>
        ) : null}
      </div>
    )
  }

  const loginHref = `/student/login?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_58%,#fff4f5_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">

        {/* Formulaire */}
        <section className="w-full rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Creer un compte</h2>
          <p className="mt-2 text-sm text-slate-600">
            Les champs marques <span className="text-red-500">*</span> sont obligatoires.
          </p>

          {globalError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {globalError}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {/* Identite */}
            {field('fullName', 'Nom complet', 'text', 'name', true, 'Ex: Jean Dupont')}
            {field('email', 'Adresse e-mail', 'email', 'email', true)}
            {field('username', "Nom d'utilisateur", 'text', 'username', true, 'Ex: jean.dupont')}

            {/* Coordonnees optionnelles */}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('phone', 'Telephone', 'tel', 'tel', false, 'Ex: +33 6 12 34 56 78')}
              {field('city', 'Ville', 'text', 'address-level2', false)}
            </div>
            {field('country', 'Pays', 'text', 'country-name', false)}

            {/* Mot de passe */}
            <div className="border-t border-slate-100 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                {field('password', 'Mot de passe', 'password', 'new-password', true)}
                {field('confirmPassword', 'Confirmation du mot de passe', 'password', 'new-password', true)}
              </div>
              <p className="mt-1 text-xs text-slate-500">Minimum 8 caracteres.</p>
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
