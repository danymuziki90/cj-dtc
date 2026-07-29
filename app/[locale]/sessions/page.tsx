import { Suspense } from 'react'
import RecentSessions from '@/components/RecentSessions'
import { StudentAuthProvider } from '@/lib/auth/StudentAuthContext'
import { PageHero } from '@/components/ui/PageHero'
import { resolveSiteLocale } from '@/lib/i18n/locale'

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
      <PageHero
        eyebrow={isFr ? 'Formations Certifiantes' : 'Certified Training'}
        title={isFr ? "Développez vos compétences dès aujourd'hui." : 'Develop your skills today.'}
        description={isFr ? 'Découvrez nos sessions ouvertes à l\'inscription et donnez un nouvel élan à votre carrière avec CJ DTC.' : 'Discover our open training sessions and give your career a new boost with CJ DTC.'}
        image="/img/sessions-hero.jpg"
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
