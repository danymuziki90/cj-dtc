import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/travaux/submissions
 * Liste globale de toutes les remises avec filtres.
 * Ajouter ?debug=true pour obtenir un diagnostic.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) {
    console.error('[submissions global GET] Admin auth failed')
    return auth.error
  }

  const url = new URL(req.url)
  const page             = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const pageSize         = Math.min(50, parseInt(url.searchParams.get('pageSize') || '20', 10))
  const assignmentId     = url.searchParams.get('assignmentId')
  const formationId      = url.searchParams.get('formationId')
  const sessionId        = url.searchParams.get('sessionId')
  const studentSearch    = url.searchParams.get('student') || ''
  const correctionStatus = url.searchParams.get('correctionStatus') || ''
  const status           = url.searchParams.get('status') || ''
  const debug            = url.searchParams.get('debug') === 'true'

  const where: any = {}
  if (assignmentId)     where.assignmentId = parseInt(assignmentId, 10)
  if (sessionId)        where.sessionId    = parseInt(sessionId, 10)
  if (correctionStatus) where.correctionStatus = correctionStatus
  if (status)           where.status       = status
  if (formationId) {
    where.Assignment = { formationId: parseInt(formationId, 10) }
  }
  if (studentSearch) {
    where.Student = {
      OR: [
        { firstName: { contains: studentSearch, mode: 'insensitive' } },
        { lastName:  { contains: studentSearch, mode: 'insensitive' } },
        { email:     { contains: studentSearch, mode: 'insensitive' } },
      ],
    }
  }

  try {
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          Student:       { select: { id: true, firstName: true, lastName: true, email: true } },
          SubmissionFile: true,
          Assignment: {
            select: {
              id: true, title: true, maxGrade: true, type: true,
              Formation:       { select: { id: true, title: true } },
              TrainingSession: { select: { id: true, startDate: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
      prisma.submission.count({ where }),
    ])

    // Fetch filter options
    const [formations, assignments] = await Promise.all([
      prisma.formation.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      prisma.assignment.findMany({
        select: { id: true, title: true },
        where: formationId ? { formationId: parseInt(formationId, 10) } : undefined,
        orderBy: { title: 'asc' },
      }),
    ])

    // Diagnostic info
    let diagnostics = undefined
    if (debug) {
      const [totalSubmissions, totalAssignments, totalStudents, submissionsWithoutSession, recentSubmissions] = await Promise.all([
        prisma.submission.count(),
        prisma.assignment.count(),
        prisma.student.count(),
        prisma.submission.count({ where: { sessionId: null } }),
        prisma.submission.findMany({
          take: 5,
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            assignmentId: true,
            studentId: true,
            status: true,
            correctionStatus: true,
            submittedAt: true,
            Student: { select: { firstName: true, lastName: true, email: true } },
            Assignment: { select: { title: true } },
            SubmissionFile: { select: { id: true, originalName: true, url: true } },
          },
        }),
      ])

      // Check for orphaned submissions (student or assignment no longer exists)
      const orphanedCount = await prisma.submission.count({
        where: {
          OR: [
            { Assignment: { is: undefined as any } },
            { Student: { is: undefined as any } },
          ],
        },
      }).catch(() => -1)

      diagnostics = {
        totalSubmissionsInDb: totalSubmissions,
        totalAssignmentsInDb: totalAssignments,
        totalStudentsInDb: totalStudents,
        submissionsWithoutSession,
        orphanedSubmissions: orphanedCount,
        filterApplied: where,
        filteredCount: total,
        recentSubmissions: recentSubmissions.map(s => ({
          id: s.id,
          assignmentId: s.assignmentId,
          assignmentTitle: s.Assignment?.title,
          studentId: s.studentId,
          studentName: s.Student ? `${s.Student.firstName} ${s.Student.lastName}` : 'Inconnu',
          studentEmail: s.Student?.email,
          status: s.status,
          correctionStatus: s.correctionStatus,
          submittedAt: s.submittedAt,
          fileCount: s.SubmissionFile.length,
          files: s.SubmissionFile.map(f => ({ id: f.id, name: f.originalName, hasUrl: Boolean(f.url) })),
        })),
      }
      console.log('[submissions diagnostic]', JSON.stringify(diagnostics, null, 2))
    }

    console.log(`[submissions global GET] Found ${total} submissions (page ${page}, filters: ${JSON.stringify(where)})`)

    return NextResponse.json({
      submissions,
      formations,
      assignments,
      pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
      ...(diagnostics ? { diagnostics } : {}),
    })
  } catch (error) {
    console.error('[submissions global GET] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
  }
}
