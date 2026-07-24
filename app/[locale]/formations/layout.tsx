import type { Metadata } from 'next'

import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Catalogue de Formations Certifiantes | CJ DTC',
  description: 'Explorez notre catalogue de formations certifiantes en Management des RH, Leadership et Employabilité. Formats en ligne, présentiel et hybride.',
  keywords: [
    'formations professionnelles',
    'formation leadership',
    'formation management',
    'formation RH',
    'certification professionnelle',
    'formation en ligne',
    'formation présentiel',
    'CJ DTC',
  ],
  path: '/formations',
})

export default function FormationsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
