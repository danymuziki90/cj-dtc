import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/travaux/[id]/submissions
 * Liste des remises pour un travail donné, avec filtres optionnels.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const assignmentId = parseInt((await params).id, 10)
  if (isNaN(assignmentId)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const url = new URL(req.url)
  const statusFilter      = url.searchParams.get('status') || ''
  const studentFilter     = url.searchParams.get('student') || ''
  const correctionFilter  = url.searchParams.get('correctionStatus') || ''

  const where: any = { assignmentId }
  if (statusFilter)     where.status = statusFilter
  if (correctionFilter) where.correctionStatus = correctionFilter
  if (studentFilter) {
    where.Student = {
      OR: [
        { firstName: { contains: studentFilter, mode: 'insensitive' } },
        { lastName:  { contains: studentFilter, mode: 'insensitive' } },
        { email:     { contains: studentFilter, mode: 'insensitive' } },
      ],
    }
  }

  try {
    const submissions = await prisma.submission.findMany({
      where,
      include: {
        Student: { select: { id: true, firstName: true, lastName: true, email: true } },
        SubmissionFile: true,
        Assignment: { select: { title: true, maxGrade: true, Formation: { select: { title: true } }, TrainingSession: { select: { id: true, startDate: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
    })
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('[submissions GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
