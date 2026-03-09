import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_CATEGORY = 'General'
const DEFAULT_PAGE_SIZE = 9
const MAX_PAGE_SIZE = 30
const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value || '', 10)
  if (Number.isNaN(parsed) || parsed < 1) return fallback
  return parsed
}

function parseTags(value?: string | null) {
  if (!value) return []
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function toPlainText(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function createNewsSlug(id: string, title: string) {
  const safeTitle = title
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return safeTitle ? `${id}-${safeTitle}` : id
}

function mapNewsItem(item: any) {
  const excerpt = toPlainText(item.content || '')
  return {
    id: item.id,
    slug: createNewsSlug(item.id, item.title || ''),
    title: item.title,
    content: item.content,
    excerpt: excerpt.length > 170 ? `${excerpt.slice(0, 170).trimEnd()}...` : excerpt,
    published: item.published,
    author: item.author || 'Admin',
    category: item.category || DEFAULT_CATEGORY,
    tags: parseTags(item.tags),
    imageDataUrl: item.imageData || null,
    publicationDate: item.publicationDate || item.createdAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        news: [],
        categories: [],
        pagination: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          total: 0,
          pageCount: 1,
        },
      })
    }

    const url = new URL(request.url)
    const page = parsePositiveInteger(url.searchParams.get('page'), 1)
    const pageSize = Math.min(parsePositiveInteger(url.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
    const limit = parsePositiveInteger(url.searchParams.get('limit'), 0)
    const search = (url.searchParams.get('search') || '').trim()
    const category = (url.searchParams.get('category') || '').trim()
    const date = (url.searchParams.get('date') || '').trim()
    const publishedOnly = url.searchParams.get('published') !== 'false'

    const shouldUseLimit = limit > 0

    const where: any = {}
    if (publishedOnly) where.published = true

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    if (category && category !== 'all') {
      where.category = {
        equals: category,
        mode: 'insensitive',
      }
    }

    if (date && DATE_INPUT_REGEX.test(date)) {
      const start = new Date(`${date}T00:00:00.000Z`)
      const end = new Date(start)
      end.setUTCDate(end.getUTCDate() + 1)
      where.publicationDate = { gte: start, lt: end }
    }

    const newsDelegate = (prisma as any).news
    const total = await newsDelegate.count({ where })

    const news = await newsDelegate.findMany({
      where,
      orderBy: [{ publicationDate: 'desc' }, { createdAt: 'desc' }],
      ...(shouldUseLimit
        ? {
            take: limit,
          }
        : {
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
    })

    const categoriesRows = await newsDelegate.findMany({
      where: {
        ...(publishedOnly ? { published: true } : {}),
        category: {
          not: '',
        },
      },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    const effectivePageSize = shouldUseLimit ? limit : pageSize

    return NextResponse.json({
      news: news.map(mapNewsItem),
      categories: categoriesRows
        .map((row: { category: string }) => row.category)
        .filter(Boolean),
      pagination: {
        page: shouldUseLimit ? 1 : page,
        pageSize: effectivePageSize,
        total,
        pageCount: shouldUseLimit ? 1 : Math.max(Math.ceil(total / pageSize), 1),
      },
    })
  } catch (error) {
    console.error('Public news fetch error:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors du chargement des actualites.',
        news: [],
        categories: [],
        pagination: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          total: 0,
          pageCount: 1,
        },
      },
      { status: 500 }
    )
  }
}
