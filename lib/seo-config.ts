import type { Metadata } from 'next'

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://cjdevelopmenttc.com').replace(/\/$/, '')
export const DEFAULT_SITE_NAME = 'CJ Development Training Center'
export const DEFAULT_OG_IMAGE = `${APP_URL}/logo.png`

export interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  path?: string
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

/**
 * Builds a standardized Next.js Metadata object with Title, Meta Description (150-160 chars),
 * Open Graph, Twitter Card, Canonical URL, Keywords, and Robots instructions.
 */
export function buildMetadata({
  title,
  description,
  keywords = [],
  path = '',
  image,
  type = 'website',
  noIndex = false,
}: SEOProps): Metadata {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  const canonicalUrl = `${APP_URL}${cleanPath}`
  const imageUrl = image ? (image.startsWith('http') ? image : `${APP_URL}${image.startsWith('/') ? image : `/${image}`}`) : DEFAULT_OG_IMAGE

  const baseKeywords = [
    'formation professionnelle',
    'leadership',
    'ressources humaines',
    'RH',
    'employabilité',
    'Afrique',
    'certification',
    'CJ DTC',
    'CJ Development Training Center',
  ]

  const combinedKeywords = Array.from(new Set([...keywords, ...baseKeywords]))

  const fullTitle = title.includes('CJ DTC') || title.includes('CJ Development') ? title : `${title} | CJ DTC`

  return {
    title: fullTitle,
    description: description.trim(),
    keywords: combinedKeywords,
    authors: [{ name: DEFAULT_SITE_NAME }],
    creator: DEFAULT_SITE_NAME,
    publisher: DEFAULT_SITE_NAME,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: description.trim(),
      url: canonicalUrl,
      siteName: DEFAULT_SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'fr_FR',
      type: type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description.trim(),
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  }
}
