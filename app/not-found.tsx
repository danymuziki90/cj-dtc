import Link from 'next/link'
import { BookOpen, Home, UserRound } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_55%,#fff1f2_100%)] px-4 py-12">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_30px_90px_-35px_rgba(0,45,114,0.4)]">
        <div className="bg-[linear-gradient(120deg,#001737_0%,#002d72_52%,#0c4da2_100%)] px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Erreur 404</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page introuvable</h1>
          <p className="mt-4 text-base leading-8 text-white/80">
            La page demandee n'est plus disponible ou a ete deplacee. Voici les points d'entree utiles pour continuer votre navigation.
          </p>
        </div>

        <div className="space-y-8 px-8 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/fr" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
              <Home className="h-6 w-6 text-[var(--cj-blue)]" />
              <p className="mt-4 text-sm font-semibold text-slate-950">Retour a l'accueil</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Revenir a la page d'accueil principale de CJ DTC.</p>
            </Link>
            <Link href="/fr/formations" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
              <BookOpen className="h-6 w-6 text-[var(--cj-blue)]" />
              <p className="mt-4 text-sm font-semibold text-slate-950">Voir les formations</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Explorer les programmes et les prochaines opportunites de formation.</p>
            </Link>
            <Link href="/fr/espace-etudiants" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
              <UserRound className="h-6 w-6 text-[var(--cj-blue)]" />
              <p className="mt-4 text-sm font-semibold text-slate-950">Espace etudiants</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Acceder au tableau de bord, aux travaux et aux certificats.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
