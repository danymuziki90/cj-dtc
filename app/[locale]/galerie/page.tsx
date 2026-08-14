import Link from 'next/link'
import { Image as ImageIcon, ArrowLeft, GraduationCap, Award, Users, Calendar } from 'lucide-react'
import UnifiedHero from '@/components/ui/UnifiedHero'
import { publicMessages } from '@/lib/i18n/public-messages'
import { getHeroData } from '@/lib/hero/getHeroData'

export default async function GaleriePage({ params }: { params: Promise<{ locale?: string }> }) {
  const locale = (await params).locale === 'en' ? 'en' : 'fr'
  const tHome = publicMessages.header[locale].home
  const tGallery = publicMessages.galerie[locale]

  const heroData = await getHeroData('galerie')

  const galleryItems = [
    { title: tGallery.items.certif, category: tGallery.categories.certification, year: "2024", icon: Award },
    { title: tGallery.items.workshop, category: tGallery.categories.onsite, year: "2024", icon: GraduationCap },
    { title: tGallery.items.leadership, category: tGallery.categories.leadership, year: "2023", icon: Users },
    { title: tGallery.items.alumni, category: tGallery.categories.event, year: "2023", icon: Calendar },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <UnifiedHero
        eyebrow={tGallery.academicLife}
        title={tGallery.title}
        description={tGallery.description}
        image="/img/actu.jpeg"
        compact
        heroData={heroData}
        locale={locale}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm text-[var(--cj-blue)] hover:underline font-semibold">
          <ArrowLeft className="w-4 h-4" />
          {tHome}
        </Link>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-12">
          {galleryItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="cj-card-interactive group overflow-hidden">
                <div className="h-44 bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
                  <Icon className="w-10 h-10 text-[var(--cj-blue)] mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.category}</span>
                </div>
                <div className="mt-4 space-y-1 p-5 pt-0">
                  <span className="text-[10px] text-slate-400 font-semibold">{item.year}</span>
                  <h3 className="text-sm font-black text-[var(--cj-blue)] group-hover:text-[var(--cj-red)] transition-colors font-montserrat">{item.title}</h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
