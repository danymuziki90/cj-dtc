import Link from 'next/link'
import { Info, ArrowLeft } from 'lucide-react'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold uppercase text-blue-400">
            <Info className="w-4 h-4" />
            Informations officielles
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Mentions Légales
          </h1>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Éditeur du site</h2>
            <p>
              Le présent site est édité par <strong>CJ Development Training Center (CJ DTC)</strong>, centre panafricain de formation professionnelle spécialisé en Leadership, Management des Ressources Humaines et Employabilité.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Contact & Secrétariat</h2>
            <p>
              E-mail : contact@cjdevelopmenttc.com <br />
              Site officiel : https://cjdevelopmenttc.com
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Hébergement</h2>
            <p>
              Le site est hébergé sur les infrastructures de Vercel Inc. et Cloudflare R2.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
