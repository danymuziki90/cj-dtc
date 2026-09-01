'use client'

import Image from 'next/image'

interface PartnersProps {
  locale: string
}

// Partner images served from /public/img/partenaires/
const PARTNER_IMAGES = [
  { src: '/img/partenaires/image0.png',  alt: 'Partenaire CJ Development 1' },
  { src: '/img/partenaires/image1.jpeg', alt: 'Partenaire CJ Development 2' },
  { src: '/img/partenaires/image2.png',  alt: 'Partenaire CJ Development 3' },
  { src: '/img/partenaires/image3.png',  alt: 'Partenaire CJ Development 4' },
  { src: '/img/partenaires/image4.jpeg', alt: 'Partenaire CJ Development 5' },
  { src: '/img/partenaires/image6.png',  alt: 'Partenaire CJ Development 6' },
  { src: '/img/partenaires/image7.jpg',  alt: 'Partenaire CJ Development 7' },
]

export default function Partners({ locale }: PartnersProps) {
  const isFr = locale === 'fr'

  // Duplicate the list to create a seamless infinite marquee effect
  const items = [...PARTNER_IMAGES, ...PARTNER_IMAGES]

  return (
    <section
      className="relative bg-white py-6 sm:py-8 border-y border-slate-100 overflow-hidden"
      aria-label={isFr ? 'Nos partenaires' : 'Our partners'}
    >
      {/* Subtle gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cj-blue)]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--cj-blue)]/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-4 sm:mb-5">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          <span className="block h-px w-6 bg-[var(--cj-blue)]/40 rounded-full" />
          {isFr ? 'Nos partenaires' : 'Our partners'}
          <span className="block h-px w-6 bg-[var(--cj-blue)]/40 rounded-full" />
        </span>
      </div>

      {/* Fade masks on the sides */}
      <div
        className="absolute inset-y-0 left-0 w-20 sm:w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, white 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-20 sm:w-32 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, white 0%, transparent 100%)' }}
      />

      {/* Scrolling track */}
      <div className="overflow-hidden" aria-hidden="true">
        <ul className="partners-marquee-track flex items-center gap-8 sm:gap-12 lg:gap-16 w-max">
          {items.map((partner, index) => (
            <li
              key={index}
              className="flex-shrink-0 flex items-center justify-center h-16 sm:h-20 lg:h-24 w-28 sm:w-36 lg:w-44 select-none"
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                width={176}
                height={96}
                className="partners-logo"
                draggable={false}
                unoptimized
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
