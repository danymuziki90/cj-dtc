import Image from 'next/image'
import { getDirectorWelcome } from '@/lib/director-welcome'

export default async function DirectorWelcome({ locale }: { locale: string }) {
  const content = await getDirectorWelcome()
  if (!content.isActive) return null
  const isFr = locale === 'fr'
  const role = isFr ? content.titleFr : content.titleEn
  const message = isFr ? content.messageFr : content.messageEn
  return <section className="overflow-hidden bg-slate-50 py-10 sm:py-12 lg:py-14" aria-labelledby="director-welcome-title">
    <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-8">
      <div className="relative mx-auto w-full max-w-sm"><div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-200 shadow-xl"><Image src={content.imageUrl || '/apropos.jpeg'} alt={content.name || 'Direction générale'} fill sizes="(max-width: 1024px) 90vw, 34vw" className="object-cover" /><div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/55 to-transparent" /></div><div className="absolute -bottom-3 -right-3 h-20 w-20 rounded-full border-8 border-slate-50 bg-[var(--cj-red)]/90" aria-hidden="true" /></div>
      <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cj-red)]">{isFr ? 'Mot de bienvenue' : 'Welcome message'}</p><h2 id="director-welcome-title" className="mt-3 font-montserrat text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{isFr ? 'Une direction proche de vos ambitions.' : 'Leadership close to your ambitions.'}</h2><blockquote className="mt-5 border-l-4 border-[var(--cj-red)] pl-5 text-base leading-8 text-slate-600 sm:text-lg">“{message}”</blockquote><div className="mt-6"><p className="font-montserrat text-lg font-bold text-slate-950">{content.name}</p><p className="mt-1 text-sm font-semibold text-[var(--cj-blue)]">{role}</p></div></div>
    </div>
  </section>
}
