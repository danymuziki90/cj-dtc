import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Exclure les routes d'administration, API, et authentification de l'indexation
        disallow: ['/admin/', '/api/', '/auth/', '/fr/auth/', '/en/auth/'],
      },
    ],
    sitemap: 'https://www.cjdevelopmenttc.org/sitemap.xml',
  }
}
