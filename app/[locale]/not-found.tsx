'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BookOpen, Home, Search, UserRound } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/${locale}/formations`)
    }, 10000)

    return () => clearTimeout(timer)
  }, [locale, router])

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#02142f_0%,#002d72_48%,#eef5ff_100%)] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[32px] border border-white/30 bg-white/95 shadow-[0_32px_90px_-45px_rgba(0,45,114,0.45)] backdrop-blur">
          <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-8 py-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Erreur 404</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page non trouvee</h1>
            <p className="mt-4 text-base leading-8 text-white/80">
              La page que vous recherchez n'est plus disponible ou a ete deplacee. Voici les acces utiles les plus proches.
            </p>
          </div>

          <div className="space-y-8 px-8 py-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Link href={`/${locale}/formations`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
                <BookOpen className="h-6 w-6 text-[var(--cj-blue)]" />
                <p className="mt-4 text-sm font-semibold text-slate-950">Voir les formations</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Retrouvez nos programmes et les prochaines sessions ouvertes.</p>
              </Link>
              <Link href={`/${locale}/espace-etudiants`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
                <UserRound className="h-6 w-6 text-[var(--cj-blue)]" />
                <p className="mt-4 text-sm font-semibold text-slate-950">Espace etudiant</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Accedez a votre dashboard, vos travaux et vos resultats.</p>
              </Link>
              <Link href={`/${locale}/contact`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
                <Search className="h-6 w-6 text-[var(--cj-blue)]" />
                <p className="mt-4 text-sm font-semibold text-slate-950">Nous contacter</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Si vous cherchiez une page precise, nous pouvons vous reorienter.</p>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}`} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cj-blue)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)]">
                <Home className="h-4 w-4" />
                Retour a l'accueil
              </Link>
              <button onClick={() => router.push(`/${locale}/formations`)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)]">
                Aller aux formations
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Redirection automatique vers les formations dans 10 secondes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
