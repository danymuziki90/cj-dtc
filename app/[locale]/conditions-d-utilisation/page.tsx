import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold uppercase text-blue-400">
            <FileText className="w-4 h-4" />
            Cadre légal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Conditions Générales d'Utilisation (CGU)
          </h1>
          <p className="text-sm text-slate-400">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation du site web et de la plateforme LMS de CJ Development Training Center (CJ DTC).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Inscriptions et Accès aux Cours</h2>
            <p>
              L'accès aux sessions de formation est soumis à l'acceptation du dossier de candidature et au règlement des frais d'inscription applicables selon le format choisi (présentiel, hybride ou en ligne).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus, cours, vidéos, supports pédagogiques et marques présents sur le site sont la propriété exclusive de CJ DTC et sont protégés par les lois sur le droit d'auteur.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
