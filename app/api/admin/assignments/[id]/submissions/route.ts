import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

const gradeSchema = z.object({
  submissionId: z.coerce.number().int().positive(),
  status: z.enum(['submitted', 'graded', 'returned']),
  grade: z.coerce.number().min(0).max(20).nullable().optional(),
  feedback: z.string().trim().max(2000).nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id: rawId } = await params
    const assignmentId = parseInt(rawId)
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: 'ID de devoir invalide.' }, { status: 400 })
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        files: true,
      },
      orderBy: { submittedAt: 'desc' },
    })

    // Get all students for matching enrollment details
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { formationId: true, sessionId: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Devoir introuvable.' }, { status: 404 })
    }

    // Query enrollments to match student emails with names
    const enrollments = await prisma.enrollment.findMany({
      where: {
        formationId: assignment.formationId,
        sessionId: assignment.sessionId || undefined,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      }
    })

    const studentMap = new Map(enrollments.map(e => [e.email.toLowerCase(), `${e.firstName} ${e.lastName}`]))

    const mappedSubmissions = submissions.map(sub => {
      const studentName = studentMap.get(sub.studentEmail.toLowerCase()) || 'Étudiant'
      return {
        ...sub,
        studentName
      }
    })

    return NextResponse.json({
      submissions: mappedSubmissions,
      enrollments: enrollments.map(e => ({
        email: e.email,
        name: `${e.firstName} ${e.lastName}`
      }))
    })
  } catch (error) {
    console.error('GET /api/admin/assignments/[id]/submissions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id: rawId } = await params
    const assignmentId = parseInt(rawId)
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: 'ID de devoir invalide.' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const parsed = gradeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    const existingSubmission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
      include: { assignment: true }
    })

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Soumission introuvable.' }, { status: 404 })
    }

    const updated = await prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        status: data.status,
        grade: data.grade === undefined ? undefined : data.grade,
        feedback: data.feedback === undefined ? undefined : data.feedback,
        gradedAt: new Date(),
        gradedBy: auth.admin.email
      },
      include: {
        files: true
      }
    })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'submission.grade',
      targetType: 'Submission',
      targetId: String(updated.id),
      targetLabel: `Submission student: ${updated.studentEmail}`,
      summary: `Correction du devoir "${existingSubmission.assignment.title}" soumis par ${updated.studentEmail}. Note: ${updated.grade ?? 'Non noté'}/20`,
      metadata: {
        assignmentId,
        submissionId: updated.id,
        grade: updated.grade,
        status: updated.status
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/admin/assignments/[id]/submissions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
