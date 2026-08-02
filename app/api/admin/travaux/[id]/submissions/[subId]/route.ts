import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { supabase } from '@/lib/supabase'
import { sendAssignmentGradedEmail } from '@/lib/email'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const gradeSchema = z.object({
  grade:            z.number().min(0).max(10000).optional().nullable(),
  maxGrade:         z.number().min(1).max(10000).optional().nullable(),
  feedback:         z.string().max(2000).optional().nullable(),
  internalNote:     z.string().max(2000).optional().nullable(),
  correctionStatus: z.enum(['pending', 'in_review', 'graded', 'returned', 'validated']).optional(),
  status:           z.string().optional(),
})

/**
 * GET /api/admin/travaux/[id]/submissions/[subId]
 * Détail d'une remise.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const { subId } = await params
  const id = parseInt(subId, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      Student: { select: { id: true, firstName: true, lastName: true, email: true } },
      SubmissionFile: true,
      Assignment: {
        select: {
          title: true, maxGrade: true,
          Formation: { select: { title: true } },
          TrainingSession: { select: { id: true, startDate: true } },
        },
      },
    },
  })

  if (!submission) return NextResponse.json({ error: 'Remise introuvable' }, { status: 404 })
  return NextResponse.json(submission)
}

/**
 * PUT /api/admin/travaux/[id]/submissions/[subId]
 * Corriger/noter une remise.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const { subId } = await params
  const submissionId = parseInt(subId, 10)
  if (isNaN(submissionId)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const body = await req.json()
  const parsed = gradeSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })

  const { grade, maxGrade, feedback, internalNote, correctionStatus, status } = parsed.data

  // Auto-calculate percentage
  const effectiveMaxGrade = maxGrade ?? 100
  const percentage = grade != null && effectiveMaxGrade > 0
    ? Math.round((grade / effectiveMaxGrade) * 100 * 10) / 10
    : null

  const isGraded = correctionStatus === 'graded' || correctionStatus === 'validated'

  try {
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        ...(grade != null        ? { grade }                               : {}),
        ...(maxGrade != null     ? { maxGrade }                            : {}),
        ...(percentage != null   ? { percentage }                          : {}),
        ...(feedback !== undefined ? { feedback }                          : {}),
        ...(internalNote !== undefined ? { internalNote }                  : {}),
        ...(correctionStatus     ? { correctionStatus }                    : {}),
        ...(status               ? { status }                              : {}),
        ...(isGraded             ? { gradedAt: new Date(), gradedBy: (auth.admin as any).username || 'Admin' } : {}),
      },
      include: {
        Student: true,
        Assignment: { select: { title: true, maxGrade: true } },
        SubmissionFile: true,
      },
    })

    // Broadcast via Supabase Realtime
    if (supabase) {
      supabase.channel('submissions_travaux_channel').send({
        type: 'broadcast',
        event: 'submission_graded',
        payload: { submissionId: submission.id, assignmentId: submission.assignmentId, studentId: submission.studentId },
      })
    }

    // Email notification when validated or graded
    if (isGraded && submission.Student?.email && submission.Assignment?.title && grade != null) {
      sendAssignmentGradedEmail(
        submission.Student.email,
        submission.Assignment.title,
        grade,
        feedback ?? null
      ).catch(err => console.error('[Email graded]', err))
    }

    return NextResponse.json(submission)
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Remise introuvable' }, { status: 404 })
    console.error('[submission PUT]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/travaux/[id]/submissions/[subId]
 * Actions rapides : validate, return, mark_in_review
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const { subId } = await params
  const submissionId = parseInt(subId, 10)
  if (isNaN(submissionId)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

  const { action } = await req.json()
  const validActions = ['validate', 'return', 'mark_in_review', 'mark_pending']
  if (!validActions.includes(action))
    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  const statusMap: Record<string, { correctionStatus: string; status: string }> = {
    validate:       { correctionStatus: 'validated', status: 'graded'    },
    return:         { correctionStatus: 'returned',  status: 'returned'  },
    mark_in_review: { correctionStatus: 'in_review', status: 'submitted' },
    mark_pending:   { correctionStatus: 'pending',   status: 'submitted' },
  }

  const update = statusMap[action]
  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      correctionStatus: update.correctionStatus,
      status: update.status,
      ...(action === 'validate' ? { gradedBy: (auth.admin as any).username || 'Admin', gradedAt: new Date() } : {}),
    },
    include: {
      Student: { select: { id: true, firstName: true, lastName: true, email: true } },
      SubmissionFile: true,
    },
  })

  return NextResponse.json(submission)
}
