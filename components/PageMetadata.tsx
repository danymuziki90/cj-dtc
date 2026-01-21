import { Metadata } from 'next'

interface PageMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image = '/logo.png',
  noIndex = false,
}: PageMetadataProps): Metadata {
  const fullTitle = title 
    ? `${title} | CJ DTC`
    : 'CJ Development Training Center - Formation Professionnelle Panafricaine'
  
  const fullDescription = description || 
    'Centre Panafricain de Formation Professionnelle, Leadership et Insertion. Formations certifiantes en Management des Ressources Humaines, Leadership et Employabilité depuis 2018.'

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [
      'formation professionnelle',
      'leadership',
      'RH',
      'emploi',
      'Afrique',
      'certification',
      ...keywords,
    ],
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      images: [image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  }
}
