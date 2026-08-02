import { Suspense } from 'react'
import RecentSessions from '@/components/RecentSessions'
import { StudentAuthProvider } from '@/lib/auth/StudentAuthContext'
import SectionHero from '@/components/ui/SectionHero'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { GraduationCap, CalendarCheck, Wifi } from 'lucide-react'

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Nos Sessions de Formation Ouvertes | CJ DTC',
  description: 'Inscrivez-vous aux prochaines sessions de formation certifiantes en RH, leadership et management. Formats en ligne, hybride et présentiel.',
  keywords: ['sessions de formation', 'prochaines sessions', 'inscription formation', 'calendrier académique', 'CJ DTC'],
  path: '/sessions',
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LocalizedSessionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await Promise.resolve(params)
  const loc = resolveSiteLocale(locale)
  const isFr = loc === 'fr'

  return (
    <div className="bg-slate-50 text-slate-900 pb-20">
      <SectionHero
        image="/img/Formaions 2.jpg"
        imageAlt="Participants en session de formation CJ DTC"
        eyebrow={isFr ? 'Formations Certifiantes' : 'Certified Training'}
        title={isFr ? 'Nos Sessions de Formation' : 'Our Training Sessions'}
        description={
          isFr
            ? 'Inscrivez-vous aux prochaines sessions ouvertes et développez vos compétences en RH, leadership et management avec des formateurs experts et des certifications reconnues.'
            : 'Join our upcoming open sessions and develop your HR, leadership and management skills with expert trainers and recognized certifications.'
        }
        badges={[
          { label: isFr ? 'Sessions ouvertes' : 'Open sessions',          icon: <CalendarCheck className="h-3.5 w-3.5" />, color: 'green'  },
          { label: isFr ? 'Formations certifiantes' : 'Certified training', icon: <GraduationCap   className="h-3.5 w-3.5" />, color: 'blue'   },
          { label: isFr ? 'En ligne & présentiel' : 'Online & in-person',  icon: <Wifi            className="h-3.5 w-3.5" />, color: 'purple' },
        ]}
        ctas={[
          { label: isFr ? 'Voir les formations' : 'View programs',    href: `/${loc}/formations`           },
          { label: isFr ? "S'inscrire maintenant" : 'Register now',   href: `/${loc}/inscription`, variant: 'secondary' },
        ]}
        breadcrumbs={[{ label: isFr ? 'Sessions' : 'Sessions' }]}
        homeLabel={isFr ? 'Accueil' : 'Home'}
        homeHref={`/${loc}`}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <StudentAuthProvider>
          <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Chargement des sessions...</div>}>
            <RecentSessions limit={0} hideHeader />
          </Suspense>
        </StudentAuthProvider>
      </div>
    </div>
  )
}
