import Link from 'next/link'
import { Image as ImageIcon, ArrowLeft, GraduationCap, Award, Users, Calendar } from 'lucide-react'

export default function GaleriePage() {
  const galleryItems = [
    { title: "Cérémonie de remise de certificats", category: "Certification", year: "2024", icon: Award },
    { title: "Atelier pratique en Management des RH", category: "Formation Présentiel", year: "2024", icon: GraduationCap },
    { title: "Session Leadership & Masterclass", category: "Leadership", year: "2023", icon: Users },
    { title: "Rencontre réseau & Alumni CJ DTC", category: "Événement", year: "2023", icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold uppercase text-blue-400">
            <ImageIcon className="w-4 h-4" />
            Vie académique
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Galerie Photos & Moments Forts
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Explorez en images l'ambiance des ateliers pratiques, les remises de diplômes et les rencontres des promotions CJ DTC.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg hover:border-blue-500/50 transition">
                <div className="h-44 rounded-xl bg-gradient-to-br from-blue-900/40 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 text-center border border-white/5">
                  <Icon className="w-10 h-10 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">{item.category}</span>
                </div>
                <div className="mt-4 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold">{item.year}</span>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">{item.title}</h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
