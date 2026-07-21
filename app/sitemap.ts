import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://cjdevelopmenttc.com'

  // Récupérer les formations publiées depuis la DB
  let formationUrls: MetadataRoute.Sitemap = []
  let articleUrls: MetadataRoute.Sitemap = []

  try {
    const formations = await prisma.formation.findMany({
      where: { statut: 'publie' },
      select: { slug: true, updatedAt: true },
    })
    formationUrls = formations.map(f => ({
      url: `${baseUrl}/fr/formations/${f.slug}`,
      lastModified: f.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  } catch {
    // Si la DB est indisponible au build, on continue avec les URLs statiques
  }

  try {
    const newsDelegate = (prisma as any).news
    const news = await newsDelegate.findMany({
      where: { published: true },
      select: { id: true, title: true, updatedAt: true },
    })

    const createNewsSlug = (id: string, title: string) => {
      const safeTitle = (title || '')
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      return safeTitle ? `${id}-${safeTitle}` : id
    }

    articleUrls = news.map((item: any) => ({
      url: `${baseUrl}/fr/actualites/${createNewsSlug(item.id, item.title)}`,
      lastModified: item.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
  } catch {
    // Si la DB est indisponible au build, on continue avec les URLs statiques
  }

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/fr`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/fr/formations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/fr/programmes`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/fr/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/fr/actualites`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fr/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/fr/partenaires`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/fr/entreprises`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  return [...staticUrls, ...formationUrls, ...articleUrls]
}
