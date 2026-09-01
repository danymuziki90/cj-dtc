import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  EMPLOIS_CATEGORY, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, DATE_INPUT_REGEX,
  parsePositiveInt, mapEmploi,
} from '@/lib/emplois/shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/emplois
 * Public endpoint — returns only published job offers.
 * Supports: page, pageSize, search, location, contractType, domain, remote, sort
 */
export async function GET(request: NextRequest) {
  const url        = new URL(request.url)
  const page       = parsePositiveInt(url.searchParams.get('page'), 1)
  const pageSize   = Math.min(parsePositiveInt(url.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
  const search     = url.searchParams.get('search')?.trim() || ''
  const date       = url.searchParams.get('date')?.trim() || ''
  const sort       = url.searchParams.get('sort') || 'recent' // recent | deadline | alpha

  // Filters that operate on metadata JSON (Prisma doesn't support JSON filtering natively on all DBs,
  // so we fetch and filter in memory for metadata fields)
  const locationFilter     = url.searchParams.get('location')?.trim().toLowerCase() || ''
  const contractFilter     = url.searchParams.get('contractType')?.trim().toLowerCase() || ''
  const domainFilter       = url.searchParams.get('domain')?.trim().toLowerCase() || ''
  const remoteFilter       = url.searchParams.get('remote')?.trim().toLowerCase() || ''

  const where: any = {
    category:  EMPLOIS_CATEGORY,
    published: true,
  }

  if (search) {
    where.OR = [
      { title:   { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { contentEn: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (date && DATE_INPUT_REGEX.test(date)) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end   = new Date(start)
    end.setUTCDate(end.getUTCDate() + 1)
    where.publicationDate = { gte: start, lt: end }
  }

  // Fetch all matching rows (metadata filters applied in-memory)
  const allRows = await prisma.news.findMany({
    where,
    orderBy: sort === 'alpha'
      ? [{ title: 'asc' }]
      : [{ publicationDate: 'desc' }, { createdAt: 'desc' }],
  })

  // Apply metadata filters in-memory
  let filtered = allRows.map(mapEmploi)

  if (locationFilter)
    filtered = filtered.filter((e) => e.metadata.location.toLowerCase().includes(locationFilter))
  if (contractFilter)
    filtered = filtered.filter((e) => e.metadata.contractType.toLowerCase().includes(contractFilter))
  if (domainFilter)
    filtered = filtered.filter((e) => e.metadata.domain.toLowerCase().includes(domainFilter))
  if (remoteFilter)
    filtered = filtered.filter((e) => e.metadata.remote.toLowerCase() === remoteFilter)

  // Sort by deadline if requested
  if (sort === 'deadline') {
    filtered.sort((a, b) => {
      if (!a.metadata.deadline) return 1
      if (!b.metadata.deadline) return -1
      return new Date(a.metadata.deadline).getTime() - new Date(b.metadata.deadline).getTime()
    })
  }

  // Exclude archived
  filtered = filtered.filter((e) => e.metadata.status !== 'archived')

  const total     = filtered.length
  const pageCount = Math.max(Math.ceil(total / pageSize), 1)
  const emplois   = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Collect distinct filter values for UI dropdowns
  const allMapped  = allRows.map(mapEmploi)
  const locations  = [...new Set(allMapped.map((e) => e.metadata.location).filter(Boolean))].sort()
  const contracts  = [...new Set(allMapped.map((e) => e.metadata.contractType).filter(Boolean))].sort()
  const domains    = [...new Set(allMapped.map((e) => e.metadata.domain).filter(Boolean))].sort()

  return NextResponse.json({
    emplois,
    filters: { locations, contracts, domains },
    pagination: { page, pageSize, total, pageCount },
  })
}
