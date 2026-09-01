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
      className="h-9 w-9 text-[var(--cj-red)] opacity-80"
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
      className="relative bg-white overflow-hidden"
      aria-labelledby="director-welcome-title"
    >
      {/* Bande de couleur décorative haut de page */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--cj-blue)] via-[var(--cj-red)] to-[var(--cj-blue)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[minmax(280px,5fr)_minmax(0,7fr)] gap-0 lg:gap-0 items-stretch min-h-[520px]">

          {/* ── Colonne gauche : Photo du DG ─────────────────────────────── */}
          <div className="relative flex flex-col py-12 lg:py-16 lg:pr-12">
            {/* Bloc photo avec traitement éditorial */}
            <div className="relative w-full max-w-[340px] mx-auto lg:mx-0 flex-1">

              {/* Accent géométrique derrière la photo */}
              <div
                className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-[var(--cj-blue)]/15"
                aria-hidden="true"
              />

              {/* Photo principale */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/20 bg-slate-200">
                <Image
                  src={content.imageUrl || '/apropos.jpeg'}
                  alt={content.name || 'Direction générale'}
                  fill
                  sizes="(max-width: 1024px) 90vw, 320px"
                  className="object-cover object-top"
                  priority
                />
                {/* Gradient subtil en bas pour lire le nom sur mobile */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                {/* Identité — visible uniquement en mobile, positionné sur la photo */}
                <div className="absolute bottom-0 inset-x-0 p-5 lg:hidden">
                  <p className="font-montserrat text-base font-bold leading-tight text-white">
                    {content.name}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--cj-red)]/90 uppercase tracking-wider">
                    {role}
                  </p>
                </div>
              </div>

              {/* Pastille décorative rouge */}
              <div
                className="absolute -bottom-3 -right-3 h-14 w-14 rounded-full bg-[var(--cj-red)] opacity-90 shadow-lg"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Séparateur vertical desktop */}
          <div
            className="hidden lg:block absolute left-[calc(5/12*100%)] top-16 bottom-16 w-px bg-slate-100"
            aria-hidden="true"
          />

          {/* ── Colonne droite : Message éditorial ───────────────────────── */}
          <div className="flex flex-col justify-center py-12 lg:py-16 lg:pl-14">

            {/* Eyebrow label */}
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cj-red)]">
              <span className="inline-block h-px w-6 bg-[var(--cj-red)]" aria-hidden="true" />
              {eyebrow}
            </p>

            {/* Titre éditorial */}
            <h2
              id="director-welcome-title"
              className="mt-4 font-montserrat text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-[2rem] lg:leading-snug"
            >
              {headline}
            </h2>

            {/* Ligne de séparation fine */}
            <div className="mt-5 h-px w-12 bg-slate-200" aria-hidden="true" />

            {/* Citation — guillemet décoratif + texte */}
            <div className="mt-5 relative">
              <div className="mb-3 -ml-1">
                <OpenQuote />
              </div>
              <blockquote className="text-base leading-[1.85] text-slate-600 sm:text-[1.05rem] font-opensans">
                {message}
              </blockquote>
            </div>

            {/* Identité du DG — visible uniquement sur desktop */}
            <div className="hidden lg:flex mt-8 items-center gap-4">
              {/* Miniature photo ronde */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-slate-100 shadow-md">
                <Image
                  src={content.imageUrl || '/apropos.jpeg'}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover object-top"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-montserrat text-sm font-bold leading-tight text-slate-900">
                  {content.name}
                </p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--cj-blue)]">
                  {role}
                </p>
              </div>
            </div>

            {/* Signature graphique CJ en bas à droite */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center gap-2 opacity-50" aria-hidden="true">
              <div className="h-4 w-4 rounded-sm bg-[var(--cj-blue)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                CJ DEVELOPMENT
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
