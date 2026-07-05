'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Clock3, GraduationCap, Tag } from 'lucide-react'
import StudentPortalNav from '@/components/student-portal/StudentPortalNav'

type Formation = {
  id: number
  title: string
  slug: string
  description: string
  categorie: string | null
  duree: string | null
  imageUrl: string | null
  statut: string
}

export default function StudentFormationsPage() {
  const router = useRouter()
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/formations', { cache: 'no-store' })
      if (res.status === 401 || res.status === 403) {
        router.push('/student/login')
        return
      }
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setFormations(Array.isArray(data) ? data.filter((f: Formation) => f.statut === 'publie') : [])
      setLoading(false)
    }
    load()
  }, [router])

  const filtered = formations.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    (f.categorie || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Chargement des formations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-slate-900">Formations disponibles</h1>
          <p className="mt-1 text-sm text-slate-500">Sélectionnez une formation pour vous inscrire.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <StudentPortalNav />

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <span className="text-sm text-slate-500">{filtered.length} formation{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-4 text-slate-500">Aucune formation disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((formation) => (
              <Link
                key={formation.id}
                href={`/student/formations/${formation.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                {formation.imageUrl ? (
                  <img
                    src={formation.imageUrl}
                    alt={formation.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <GraduationCap className="h-12 w-12 text-white/30" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-base font-semibold text-slate-900 group-hover:text-blue-700">
                    {formation.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {formation.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formation.categorie ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <Tag className="h-3 w-3" />
                        {formation.categorie}
                      </span>
                    ) : null}
                    {formation.duree ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        <Clock3 className="h-3 w-3" />
                        {formation.duree}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
                    <BookOpen className="h-4 w-4" />
                    Voir la formation
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
