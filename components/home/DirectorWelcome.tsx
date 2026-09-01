import Image from 'next/image'
import { getDirectorWelcome } from '@/lib/director-welcome'

function OpenQuote() {
  return (
    <svg aria-hidden="true" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[var(--cj-red)] opacity-80">
      <path d="M0 36V21.818C0 9.697 7.273 2.545 21.818 0L24 4.364C17.455 6.182 13.818 10.182 13.09 16.364H20.727V36H0ZM23.273 36V21.818C23.273 9.697 30.545 2.545 45.091 0L47.273 4.364C40.727 6.182 37.09 10.182 36.364 16.364H44V36H23.273Z" fill="currentColor" />
    </svg>
  )
}

export default async function DirectorWelcome({ locale }: { locale: string }) {
  const content = await getDirectorWelcome()
  if (!content.isActive) return null

  const isFr = locale === 'fr'
  const role = isFr ? content.titleFr : content.titleEn
  const message = isFr ? content.messageFr : content.messageEn
  const paragraphs = message.split(/\n\s*\n/).filter(Boolean)
  const headline = isFr ? 'Une direction proche de vos ambitions.' : 'Leadership close to your ambitions.'

  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-white py-8 sm:py-10 lg:py-12" aria-labelledby="director-welcome-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="relative w-full max-w-lg lg:ml-auto">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
              <Image
                src={content.imageUrl || '/apropos.jpeg'}
                alt={content.name || role}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md">
                  {content.name && <p className="font-montserrat text-sm font-bold text-white sm:text-base">{content.name}</p>}
                  <p className="mt-0.5 text-xs text-white/80">{role}</p>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 -bottom-6 -right-6 h-full w-full rounded-3xl border-2 border-[var(--cj-red)]/20" aria-hidden="true" />
            <div className="absolute -z-10 -left-6 -top-6 h-32 w-32 rounded-full bg-[var(--cj-blue)]/10 blur-2xl" aria-hidden="true" />
          </div>

          <div className="flex flex-col justify-center">
            <h2 id="director-welcome-title" className="font-montserrat text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{headline}</h2>
            <div className="mt-3.5 h-0.5 w-10 rounded-full bg-[var(--cj-blue)]" aria-hidden="true" />
            <div className="relative mt-4">
              <div className="mb-2"><OpenQuote /></div>
              <blockquote className="space-y-3 font-opensans text-sm leading-relaxed text-slate-600 sm:text-base" style={{ textAlign: 'justify' }}>
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? 'font-bold text-slate-700' : undefined}>{paragraph}</p>
                ))}
              </blockquote>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                {content.name && <p className="font-montserrat text-sm font-bold text-slate-900">{content.name}</p>}
                <p className="text-xs font-semibold text-[var(--cj-blue)]">{role}</p>
              </div>
              <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">CJ Development Training Center</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
