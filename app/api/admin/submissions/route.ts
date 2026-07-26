export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

/**
 * GET /api/admin/submissions
 * Récupère toutes les remises d'étudiants avec filtres optionnels.
 *
 * Query params:
 *   - status: 'all' | 'submitted' | 'graded' | 'returned'
 *   - sessionId: number | 'all'
 *   - assignmentId: number | 'all'
 *   - search: string (nom, email, matricule, titre du devoir)
 *   - page: number (défaut 1)
 *   - limit: number (défaut 50)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get('status') || 'all'
  const sessionIdParam = searchParams.get('sessionId') || 'all'
  const assignmentIdParam = searchParams.get('assignmentId') || 'all'
  const search = searchParams.get('search')?.trim() || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  try {
    const whereClause: any = {}

    // Filter by status
    if (statusParam !== 'all') {
      whereClause.status = statusParam
    }

    // Filter by sessionId (via assignment)
    if (sessionIdParam !== 'all') {
      const sid = parseInt(sessionIdParam, 10)
      if (!isNaN(sid)) {
        whereClause.sessionId = sid
      }
    }

    // Filter by specific assignmentId
    if (assignmentIdParam !== 'all') {
      const aid = parseInt(assignmentIdParam, 10)
      if (!isNaN(aid)) {
        whereClause.assignmentId = aid
      }
    }

    // Search filter — applied via OR on student + assignment
    if (search) {
      whereClause.OR = [
        {
          student: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { studentNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          assignment: {
            title: { contains: search, mode: 'insensitive' },
          },
        },
      ]
    }

    const [total, submissions] = await Promise.all([
      prisma.submission.count({ where: whereClause }),
      prisma.submission.findMany({
        where: whereClause,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentNumber: true,
              phone: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              type: true,
              deadline: true,
              formationId: true,
              sessionId: true,
              formation: {
                select: { id: true, title: true, slug: true },
              },
              session: {
                select: {
                  id: true,
                  startDate: true,
                  endDate: true,
                  location: true,
                  format: true,
                  status: true,
                },
              },
            },
          },
          files: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error: any) {
    console.error('[Admin Submissions GET Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors du chargement des remises' },
      { status: 500 }
    )
  }
}
