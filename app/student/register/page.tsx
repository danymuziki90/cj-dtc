'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type FieldError = Record<string, string>

export default function StudentRegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldError>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
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
    if (form.firstName.trim().length < 2) errors.firstName = 'Le prénom doit comporter au moins 2 caractères.'
    if (form.lastName.trim().length < 2) errors.lastName = 'Le nom doit comporter au moins 2 caractères.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Adresse e-mail invalide.'
    }
    if (form.password.length < 8) errors.password = 'Le mot de passe doit comporter au moins 8 caractères.'
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
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details?.fieldErrors) {
          const serverFieldErrors: FieldError = {}
          for (const [key, messages] of Object.entries(data.details.fieldErrors)) {
            serverFieldErrors[key] = Array.isArray(messages) ? (messages[0] as string) : String(messages)
          }
          setFieldErrors(serverFieldErrors)
        } else {
          setGlobalError(data.error || "Une erreur est survenue. Veuillez réessayer.")
        }
        return
      }

      // Registered and logged in — go straight to the dashboard
      router.push('/student/dashboard')
      router.refresh()
    } catch {
      setGlobalError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  function field(
    id: keyof typeof form,
    label: string,
    type = 'text',
    autoComplete?: string
  ) {
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
          className={`w-full rounded-lg border px-3 py-2 outline-none transition-colors focus:border-blue-500 ${
            fieldErrors[id] ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
          }`}
          required={id !== 'phone'}
          aria-describedby={fieldErrors[id] ? `${id}-error` : undefined}
          aria-invalid={Boolean(fieldErrors[id])}
        />
        {fieldErrors[id] ? (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
            {fieldErrors[id]}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Créer un compte</h1>
        <p className="mb-6 text-sm text-slate-600">
          Inscrivez-vous gratuitement pour accéder à votre espace étudiant.
        </p>

        {globalError ? (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {globalError}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            {field('firstName', 'Prénom', 'text', 'given-name')}
            {field('lastName', 'Nom', 'text', 'family-name')}
          </div>
          {field('email', 'Adresse e-mail', 'email', 'email')}
          {field('phone', 'Téléphone (optionnel)', 'tel', 'tel')}
          {field('password', 'Mot de passe', 'password', 'new-password')}
          {field('confirmPassword', 'Confirmer le mot de passe', 'password', 'new-password')}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Vous avez déjà un compte ?{' '}
          <Link href="/student/login" className="font-medium text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
