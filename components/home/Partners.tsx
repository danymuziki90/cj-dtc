'use client'

import Image from 'next/image'

interface PartnersProps {
  locale: string
}

export default function Partners({ locale }: PartnersProps) {
  const isFr = locale === 'fr'

  const partners = [
    'World Bank Group',
    'UNESCO',
    'African Union',
    'SHRM Member',
    'Harvard Business Publishing',
    'Microsoft'
  ]

  return (
    <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-10 font-opensans">
          {isFr ? 'Ils soutiennent nos initiatives et certifiés' : 'They support our initiatives and graduates'}
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8">
          {partners.map((partner) => (
            <div 
              key={partner} 
              className="group flex h-20 w-[160px] sm:w-[180px] items-center justify-center rounded-2xl bg-white border border-slate-200 px-4 py-4 text-sm font-bold text-slate-400 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md hover:-translate-y-1"
            >
              <span className="text-center group-hover:text-slate-700 transition-colors">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
