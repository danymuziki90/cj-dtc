import Link from 'next/link'
import { Image as ImageIcon, ArrowLeft, GraduationCap, Award, Users, Calendar } from 'lucide-react'
import UnifiedHero from '@/components/ui/UnifiedHero'
import { publicMessages } from '@/lib/i18n/public-messages'
import { getHeroData } from '@/lib/hero/getHeroData'

export default async function GaleriePage({ params }: { params: Promise<{ locale?: string }> }) {
  const locale = (await params).locale === 'en' ? 'en' : 'fr'
  const isFr = locale === 'fr'
  const tHome = publicMessages.header[locale].home
  const tTitle = isFr ? "Galerie Photos & Moments Forts" : "Photo Gallery & Highlights"
  const tDesc = isFr ? "Explorez en images l'ambiance des ateliers pratiques, les remises de diplômes et les rencontres des promotions CJ DTC." : "Explore the atmosphere of practical workshops, graduations, and CJ DTC alumni meetings in pictures."
  const tAcademic = isFr ? "Vie académique" : "Academic Life"

  const heroData = await getHeroData('galerie')

  const galleryItems = [
    { title: isFr ? "Cérémonie de remise de certificats" : "Certificate Award Ceremony", category: "Certification", year: "2024", icon: Award },
    { title: isFr ? "Atelier pratique en Management des RH" : "HR Management Practical Workshop", category: isFr ? "Formation Présentiel" : "On-site Training", year: "2024", icon: GraduationCap },
    { title: isFr ? "Session Leadership & Masterclass" : "Leadership Session & Masterclass", category: "Leadership", year: "2023", icon: Users },
    { title: isFr ? "Rencontre réseau & Alumni CJ DTC" : "Network & Alumni Meeting CJ DTC", category: isFr ? "Événement" : "Event", year: "2023", icon: Calendar },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <UnifiedHero
        eyebrow={tAcademic}
        title={tTitle}
        description={tDesc}
        image="/img/actu.jpeg"
        compact
        heroData={heroData}
        locale={locale}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
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
