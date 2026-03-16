import Link from 'next/link'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

type HomeSectionsProps = {
  locale?: string
}

const serviceStyles = [
  {
    glow: 'from-blue-500 to-blue-600',
    background: 'from-blue-500 to-blue-600',
    frame: 'from-blue-100 to-blue-100',
    href: 'audit-rh',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    glow: 'from-blue-500 to-blue-600',
    background: 'from-blue-500 to-blue-600',
    frame: 'from-blue-100 to-blue-100',
    href: 'recrutement',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    glow: 'from-blue-500 to-red-600',
    background: 'from-blue-500 to-red-600',
    frame: 'from-blue-100 to-red-100',
    href: 'formations-entreprise',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    glow: 'from-red-500 to-red-600',
    background: 'from-red-500 to-red-600',
    frame: 'from-red-100 to-red-100',
    href: 'gouvernance',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
  {
    glow: 'from-blue-500 to-blue-600',
    background: 'from-blue-500 to-blue-600',
    frame: 'from-blue-100 to-blue-100',
    href: 'coaching',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
]

const quoteIcon = (
  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
)

const copy = publicMessages.homeSections

export default function HomeSections({ locale }: HomeSectionsProps) {
  const resolvedLocale = resolveSiteLocale(locale)
  const t = copy[resolvedLocale]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mb-8 text-center sm:mb-12 lg:mb-16">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl lg:text-4xl">
            {t.servicesTitle.split(' ')[0]}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
              {t.servicesTitle.replace(`${t.servicesTitle.split(' ')[0]} `, '')}
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:max-w-3xl sm:text-lg lg:text-xl">{t.servicesDescription}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {t.serviceCards.map((card, index) => {
            const style = serviceStyles[index]
            return (
              <div key={card.title} className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-500 hover:shadow-2xl sm:rounded-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${style.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-10`} />

                <div className="relative p-6 sm:p-8">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-transparent to-transparent sm:mb-6 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                    <div className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${style.background} transition-transform duration-300 group-hover:scale-110 sm:rounded-2xl`}>
                      <svg className="h-6 w-6 text-white sm:h-7 sm:w-7 lg:h-8 lg:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {style.icon}
                      </svg>
                    </div>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl">{card.title}</h3>
                  <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">{card.description}</p>

                  <div className="mb-4 flex flex-wrap gap-1.5 sm:mb-6 sm:gap-2">
                    {card.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 sm:px-3 sm:text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/${resolvedLocale}/services#${style.href}`}
                    className="inline-flex items-center text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 sm:text-base"
                  >
                    {t.learnMore}
                    <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            )
          })}

          <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg transition-all duration-500 hover:shadow-2xl sm:rounded-2xl">
            <div className="relative flex h-full flex-col items-center justify-center p-6 text-center sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 transition-transform duration-300 group-hover:scale-110 sm:mb-6 sm:h-14 sm:w-14 lg:h-16 lg:w-16 sm:rounded-2xl">
                <svg className="h-6 w-6 text-white sm:h-7 sm:w-7 lg:h-8 lg:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl">{t.needAdviceTitle}</h3>
              <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">{t.needAdviceDescription}</p>

              <Link
                href={`/${resolvedLocale}/contact`}
                className="inline-flex items-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 sm:px-6 sm:py-3 sm:text-base"
              >
                {t.contactExpert}
                <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 py-12 sm:rounded-3xl sm:py-16 lg:py-20">
        <div className="mb-8 text-center sm:mb-12 lg:mb-16">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl lg:text-4xl">
            {t.testimonialsTitle}
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 sm:max-w-3xl sm:text-lg lg:text-xl">
            {t.testimonialsDescription}
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {t.testimonials.map((item) => (
            <div key={item.name} className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg sm:rounded-2xl sm:p-8">
              <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:right-4 sm:top-4 sm:h-12 sm:w-12">
                <svg className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                  {quoteIcon}
                </svg>
              </div>

              <div className="mb-4 flex items-center sm:mb-6">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white sm:mr-4 sm:h-12 sm:w-12">
                  {item.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 sm:text-base">{item.name}</div>
                  <div className="text-xs text-gray-600 sm:text-sm">{item.location}</div>
                </div>
              </div>

              <blockquote className="mb-4 text-sm leading-relaxed text-gray-700 sm:mb-6 sm:text-base lg:text-lg">
                « {item.quote} »
              </blockquote>

              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current text-red-400 sm:h-5 sm:w-5" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 p-8 text-center sm:rounded-3xl sm:p-12 lg:p-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-5 top-5 h-16 w-16 rounded-full bg-white sm:left-10 sm:top-10 sm:h-32 sm:w-32" />
            <div className="absolute bottom-5 right-5 h-24 w-24 rounded-full bg-white sm:bottom-10 sm:right-10 sm:h-48 sm:w-48" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
              <svg className="mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {t.newsletterBadge}
            </div>

            <h2 className="mb-4 text-2xl font-bold text-white sm:mb-6 sm:text-3xl lg:text-4xl">{t.newsletterTitle}</h2>
            <p className="mx-auto mb-6 max-w-2xl text-base text-white/90 sm:mb-8 sm:text-lg lg:text-xl">{t.newsletterDescription}</p>

            <div className="mx-auto mb-4 flex max-w-md flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-4">
              <input
                type="email"
                placeholder={t.newsletterPlaceholder}
                className="flex-1 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 sm:px-6 sm:py-4 sm:text-base"
              />
              <button className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-gray-100 sm:px-8 sm:py-4 sm:text-base">
                {t.newsletterButton}
              </button>
            </div>

            <p className="text-xs text-white/80 sm:text-sm">
              {t.newsletterHelper}{' '}
              <a href="mailto:contact@cjdevelopmenttc.org" className="underline transition-colors hover:text-white">
                contact@cjdevelopmenttc.org
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

