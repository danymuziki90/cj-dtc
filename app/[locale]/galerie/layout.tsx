import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Galerie Photos & Événements Académiques | CJ DTC',
  description: 'Découvrez la galerie photos des cérémonies de remise de certificats, ateliers pratiques et sessions de formation de CJ DTC.',
  keywords: ['galerie photos', 'remise de certificats', 'ateliers formation', 'événements CJ DTC', 'photos promotion'],
  path: '/galerie',
})

export default function GalerieLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
