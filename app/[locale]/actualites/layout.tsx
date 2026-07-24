import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Actualités & Événements Académiques | CJ DTC',
  description: 'Retrouvez les dernières actualités, événements, conseils en carrières et annonces officielles de CJ Development Training Center.',
  keywords: ['actualités CJ DTC', 'événements', 'articles RH', 'conseils carrière', 'communiqués'],
  path: '/actualites',
})

export default function ActualitesLayout({ children }: { children: ReactNode }) {
  return children
}
