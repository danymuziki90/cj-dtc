import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

interface PageMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  path?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title = 'CJ Development Training Center - Formation Professionnelle Panafricaine',
  description = 'Centre Panafricain de Formation Professionnelle, Leadership et Insertion. Formations certifiantes en Management des RH, Leadership et Employabilité depuis 2018.',
  keywords = [],
  image = '/logo.png',
  path = '',
  noIndex = false,
}: PageMetadataProps): Metadata {
  return buildMetadata({
    title,
    description,
    keywords,
    image,
    path,
    noIndex,
  })
}
