import Image from 'next/image'
import { getDirectorWelcome } from '@/lib/director-welcome'

// ── Guillemets typographiques décoratifs ──────────────────────────────────────
function OpenQuote() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-7 w-7 text-[var(--cj-red)] opacity-80"
    >
      <path
        d="M0 36V21.818C0 9.697 7.273 2.545 21.818 0L24 4.364C17.455 6.182 13.818 10.182 13.09 16.364H20.727V36H0ZM23.273 36V21.818C23.273 9.697 30.545 2.545 45.091 0L47.273 4.364C40.727 6.182 37.09 10.182 36.364 16.364H44V36H23.273Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default async function DirectorWelcome({ locale }: { locale: string }) {
  const content = await getDirectorWelcome()
  if (!content.isActive) return null

  const isFr = locale === 'fr'
  const role = isFr ? content.titleFr : content.titleEn
  const message = isFr ? content.messageFr : content.messageEn
  const eyebrow = isFr ? 'Mot du Directeur Général' : 'Message from the Managing Director'
  const headline = isFr
    ? 'Une direction proche de vos ambitions.'
    : 'Leadership close to your ambitions.'

  return (
    <section
      className="relative bg-white overflow-hidden py-8 sm:py-10 lg:py-12 border-b border-slate-100"
      aria-labelledby="director-welcome-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[minmax(260px,4.5fr)_minmax(0,7.5fr)] gap-8 lg:gap-12 items-center">

          {/* ── Colonne gauche : Photo du DG ─────────────────────────────── */}
          <div className="relative mx-auto w-full max-w-[300px] lg:max-w-[320px]">
            {/* Accent géométrique sobre */}
            <div
              className="absolute -top-2.5 -left-2.5 w-full h-full rounded-2xl border-2 border-[var(--cj-blue)]/15 pointer-events-none"
              aria-hidden="true"
            />

            {/* Photo principale */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-lg bg-slate-100">
              <Image
                src={content.imageUrl || '/apropos.jpeg'}
                alt={content.name || role}
                fill
                sizes="(max-width: 1024px) 90vw, 320px"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Pastille d'accent discrète */}
            <div
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[var(--cj-red)] opacity-90 shadow-md"
              aria-hidden="true"
            />
          </div>

          {/* ── Colonne droite : Message éditorial ───────────────────────── */}
          <div className="flex flex-col justify-center">

            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cj-red)]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--cj-red)] font-montserrat">
                {eyebrow}
              </p>
            </div>

            {/* Titre éditorial */}
            <h2
              id="director-welcome-title"
              className="mt-2.5 font-montserrat text-2xl font-black leading-tight text-slate-900 sm:text-3xl"
            >
              {headline}
            </h2>

            {/* Ligne d'accent */}
            <div className="mt-3.5 h-0.5 w-10 bg-[var(--cj-blue)] rounded-full" aria-hidden="true" />

            {/* Citation */}
            <div className="mt-4 relative">
              <div className="mb-2">
                <OpenQuote />
              </div>
              <blockquote className="text-sm leading-relaxed text-slate-600 sm:text-base font-opensans italic">
                “{message}”
              </blockquote>
            </div>

            {/* Signature épurée (sans double avatar, sans doublon) */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="font-montserrat text-sm font-bold text-slate-900">
                  {content.name}
                </p>
                <p className="text-xs font-semibold text-[var(--cj-blue)]">
                  {role}
                </p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CJ DTC
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
