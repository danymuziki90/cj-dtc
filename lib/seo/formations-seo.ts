/**
 * Utilitaires SEO pour les formations
 * Génération de métadonnées, structured data (JSON-LD), sitemap
 */

import type { Formation } from '../types/formation'
import type { Metadata } from 'next'

/**
 * Génère les métadonnées pour une page de formation
 */
export function generateFormationMetadata(
  formation: Formation,
  locale: string = 'fr'
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cjdevelopment.cd'
  const formationUrl = `${baseUrl}/${locale}/formations/${formation.slug}`
  
  // Extraire les 3 premiers objectifs pour la description
  const objectivesPreview = formation.objectifs
    ? formation.objectifs.split('\n').slice(0, 3).join('. ')
    : formation.description

  return {
    title: `${formation.title} | CJ Development Training Center`,
    description: formation.shortDescription || objectivesPreview || formation.description,
    keywords: [
      formation.title,
      ...(formation.tags || []),
      formation.categorie || '',
      'formation professionnelle',
      'CJ Development',
      'certification'
    ].filter(Boolean),
    openGraph: {
      title: formation.title,
      description: formation.shortDescription || formation.description,
      type: 'website',
      url: formationUrl,
      siteName: 'CJ Development Training Center',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images: formation.imageUrl ? [
        {
          url: formation.imageUrl,
          width: 1200,
          height: 630,
          alt: formation.title
        }
      ] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: formation.title,
      description: formation.shortDescription || formation.description,
      images: formation.imageUrl ? [formation.imageUrl] : []
    },
    alternates: {
      canonical: formationUrl,
      languages: {
        'fr-FR': `${baseUrl}/fr/formations/${formation.slug}`,
        'en-US': `${baseUrl}/en/formations/${formation.slug}`
      }
    },
    robots: {
      index: formation.statut === 'publie',
      follow: true
    }
  }
}

/**
 * Génère les données structurées JSON-LD pour une formation (Schema.org Course)
 */
export function generateFormationStructuredData(
  formation: Formation,
  locale: string = 'fr'
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cjdevelopment.cd'
  const formationUrl = `${baseUrl}/${locale}/formations/${formation.slug}`

  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: formation.title,
    description: formation.description,
    provider: {
      '@type': 'Organization',
      name: 'CJ Development Training Center',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [
        'https://www.facebook.com/cjdevelopment',
        'https://www.linkedin.com/company/cjdevelopment',
        'https://twitter.com/cjdevelopment'
      ]
    },
    educationalLevel: formation.level,
    teaches: formation.objectifs?.split('\n').filter(Boolean) || [],
    courseCode: formation.slug,
    hasCourseInstance: []
  }

  // Ajouter l'image si disponible
  if (formation.imageUrl) {
    structuredData.image = formation.imageUrl
  }

  // Ajouter le formateur si disponible
  if (formation.instructor) {
    structuredData.instructor = {
      '@type': 'Person',
      name: `${formation.instructor.firstName} ${formation.instructor.lastName}`,
      jobTitle: formation.instructor.title,
      description: formation.instructor.bio,
      image: formation.instructor.photoUrl
    }
  }

  // Ajouter les sessions disponibles
  if (formation.sessions && formation.sessions.length > 0) {
    structuredData.hasCourseInstance = formation.sessions.map((session: any) => ({
      '@type': 'CourseInstance',
      courseMode: session.format === 'en_ligne' ? 'online' : 
                  session.format === 'presentiel' ? 'onsite' : 'blended',
      location: session.format === 'en_ligne' ? {
        '@type': 'VirtualLocation',
        url: formationUrl
      } : {
        '@type': 'Place',
        name: session.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kinshasa',
          addressCountry: 'CD'
        }
      },
      startDate: session.startDate,
      endDate: session.endDate,
      offers: {
        '@type': 'Offer',
        price: session.price || formation.price || 0,
        priceCurrency: 'USD',
        availability: session.availableSeats > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        url: formationUrl,
        validFrom: new Date().toISOString()
      }
    }))
  } else if (formation.price) {
    // Si pas de sessions mais un prix est défini
    structuredData.offers = {
      '@type': 'Offer',
      price: formation.price,
      priceCurrency: 'USD',
      url: formationUrl
    }
  }

  // Ajouter la durée si disponible
  if (formation.duree) {
    structuredData.timeRequired = formation.duree
  }

  // Ajouter les avis/évaluations
  if (formation.rating && formation.reviewCount) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: formation.rating,
      reviewCount: formation.reviewCount,
      bestRating: 5,
      worstRating: 1
    }
  }

  // Ajouter le nombre d'étudiants
  if (formation.enrollmentCount) {
    structuredData.numberOfStudents = formation.enrollmentCount
  }

  return structuredData
}

/**
 * Génère les données structurées JSON-LD pour la liste des formations (ItemList)
 */
export function generateFormationsListStructuredData(
  formations: Formation[],
  locale: string = 'fr'
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cjdevelopment.cd'

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catalogue de Formations CJ Development',
    description: 'Liste complète des formations professionnelles proposées par CJ Development Training Center',
    numberOfItems: formations.length,
    itemListElement: formations.map((formation, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        '@id': `${baseUrl}/${locale}/formations/${formation.slug}`,
        name: formation.title,
        description: formation.description,
        url: `${baseUrl}/${locale}/formations/${formation.slug}`,
        image: formation.imageUrl,
        provider: {
          '@type': 'Organization',
          name: 'CJ Development Training Center'
        }
      }
    }))
  }
}

/**
 * Génère les breadcrumbs structurés JSON-LD
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url?: string }>,
  locale: string = 'fr'
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cjdevelopment.cd'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${baseUrl}${item.url}` : undefined
    }))
  }
}

/**
 * Génère le XML pour le sitemap des formations
 */
export function generateFormationsSitemapXml(formations: Formation[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cjdevelopment.cd'
  const now = new Date().toISOString()

  const urls = formations
    .filter(f => f.statut === 'publie')
    .map(formation => `
    <url>
      <loc>${baseUrl}/fr/formations/${formation.slug}</loc>
      <lastmod>${formation.updatedAt || now}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
      <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr/formations/${formation.slug}" />
      <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/formations/${formation.slug}" />
    </url>
  `).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/fr/formations</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr/formations" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/formations" />
  </url>
  ${urls}
</urlset>`
}
