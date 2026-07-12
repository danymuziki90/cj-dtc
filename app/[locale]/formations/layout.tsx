import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catalogue de Formations | CJ Development Training Center',
  description: 'Explorez notre catalogue complet de formations professionnelles : Leadership, RH, Management, Entrepreneuriat, Digital et plus. Certifications reconnues, formateurs experts, accompagnement personnalisé.',
  keywords: [
    'formations professionnelles',
    'CJ Development',
    'CJ DTC',
    'formation leadership',
    'formation management',
    'formation RH',
    'formation entrepreneuriat',
    'certification professionnelle',
    'Kinshasa',
    'RDC',
    'Congo',
    'formation en ligne',
    'formation présentiel',
    'développement professionnel'
  ],
  openGraph: {
    title: 'Catalogue de Formations Professionnelles | CJ Development Training Center',
    description: 'Développez vos compétences avec nos formations certifiantes conçues par des experts pour le marché africain et international.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'CJ Development Training Center',
    images: [
      {
        url: '/images/formations-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Catalogue de Formations CJ Development'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catalogue de Formations | CJ Development Training Center',
    description: 'Formations professionnelles certifiantes : Leadership, Management, RH, Entrepreneuriat et plus.',
    images: ['/images/formations-twitter.jpg']
  },
  alternates: {
    canonical: 'https://cjdevelopment.cd/formations',
    languages: {
      'fr-FR': 'https://cjdevelopment.cd/fr/formations',
      'en-US': 'https://cjdevelopment.cd/en/formations'
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function FormationsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
