'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Award, BookOpen, CheckCircle, Clock3, GraduationCap, Layers3, Tag } from 'lucide-react'
import StudentPortalNav from '@/components/student-portal/StudentPortalNav'

type Formation = {
  id: number
  title: string
  slug: string
  description: string
  categorie: string | null
  duree: string | null
  modules: string | null
  objectifs: string | null
  methodes: string | null
  certification: string | null
  imageUrl: string | null
  statut: string
}

function toItems(value?: string | null) {
  return (value || '')
    .split(/\r?\n|,|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

type EnrollState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export default function StudentFormationDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [formation, setFormation] = useState<Formation | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollState, setEnrollState] = useState<EnrollState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!slug) return
    async function load() {
      const res = await fetch(`/api/formations/${slug}`, { cache: 'no-store' })
      if (res.status === 401 || res.status === 403) {
        router.push('/student/login')
        return
      }
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setFormation(data)
      setLoading(false)
    }
    load()
  }, [slug, router])

  async function handleEnroll() {
    if (!formation) return
    setEnrollState('loading')
    setErrorMsg('')

    const res = await fetch('/api/student/system/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formationId: formation.id }),
    })
    const data = await res.json()

    if (res.status === 409) {
      setEnrollState('duplicate')
      return
    }
    if (!res.ok) {
      setErrorMsg(data.error || 'Une erreur est survenue.')
      setEnrollState('error')
      return
    }
    setEnrollState('success')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Chargement...</p>
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
        <p className="text-slate-600">Formation introuvable.</p>
        <Link href="/student/formations" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Retour aux formations
        </Link>
      </div>
    )
  }

  const objectives = toItems(formation.objectifs)
  const modules = toItems(formation.modules)

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link href="/student/formations" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Formations
          </Link>
          <h1 className="text-lg font-bold text-slate-900 line-clamp-1">{formation.title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <StudentPortalNav />

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left — content */}
          <div className="space-y-5">
            {formation.imageUrl ? (
              <img src={formation.imageUrl} alt={formation.title} className="h-56 w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900">
                <GraduationCap className="h-16 w-16 text-white/20" />
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900">{formation.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {formation.categorie ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    <Tag className="h-3 w-3" />{formation.categorie}
                  </span>
                ) : null}
                {formation.duree ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    <Clock3 className="h-3 w-3" />{formation.duree}
                  </span>
                ) : null}
                {formation.certification ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <Award className="h-3 w-3" />{formation.certification}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{formation.description}</p>
            </div>

            {objectives.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Objectifs</h3>
                <ul className="mt-3 space-y-2">
                  {objectives.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {modules.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="inline-flex items-center gap-2 font-semibold text-slate-900">
                  <Layers3 className="h-4 w-4 text-blue-600" />
                  Modules
                </h3>
                <ul className="mt-3 space-y-2">
                  {modules.map((item, i) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {formation.methodes ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="inline-flex items-center gap-2 font-semibold text-slate-900">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Méthodes pédagogiques
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{formation.methodes}</p>
              </div>
            ) : null}
          </div>

          {/* Right — enroll card */}
          <div className="self-start">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Inscription</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{formation.title}</h3>

              {enrollState === 'success' ? (
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Demande envoyée !</p>
                      <p className="mt-1 text-xs text-emerald-700">
                        Votre inscription est en attente de validation par l'administrateur.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/enrollments"
                    className="block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Suivre mes inscriptions
                  </Link>
                </div>
              ) : enrollState === 'duplicate' ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Vous avez déjà une inscription en cours pour cette formation.
                  </div>
                  <Link
                    href="/student/enrollments"
                    className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Voir mes inscriptions
                  </Link>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Confirmez votre intérêt pour cette formation. L'administrateur sera notifié et traitera votre demande.
                  </p>

                  {enrollState === 'error' ? (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMsg}
                    </div>
                  ) : null}

                  <button
                    onClick={handleEnroll}
                    disabled={enrollState === 'loading'}
                    className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {enrollState === 'loading' ? 'Envoi en cours...' : "S'inscrire à cette formation"}
                  </button>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    Statut initial : <span className="font-medium text-amber-600">En attente de validation</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
