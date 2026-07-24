import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const submissionId = parseInt(params.id, 10)
  if (isNaN(submissionId)) {
    return NextResponse.json({ success: false, error: 'ID de remise invalide' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { grade, feedback, status } = body

    const existing = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        assignment: {
          select: { id: true, title: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Remise introuvable' }, { status: 404 })
    }

    const updateData: any = {
      gradedAt: new Date(),
      gradedBy: auth.admin.username,
    }

    if (grade !== undefined && grade !== null && grade !== '') {
      const numGrade = parseFloat(String(grade))
      if (isNaN(numGrade) || numGrade < 0 || numGrade > 20) {
        return NextResponse.json(
          { success: false, error: 'La note doit être un nombre valide entre 0 et 20.' },
          { status: 400 }
        )
      }
      updateData.grade = numGrade
    }

    if (feedback !== undefined) {
      updateData.feedback = String(feedback).trim() || null
    }

    if (status) {
      const validStatuses = ['submitted', 'graded', 'returned']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ success: false, error: 'Statut de remise invalide.' }, { status: 400 })
      }
      updateData.status = status
    } else {
      updateData.status = 'graded'
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentNumber: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
          },
        },
        files: true,
      },
    })

    // Create AdminNotification for the student
    try {
      if (existing.student?.email) {
        const notifTitle = updatedSubmission.status === 'returned'
          ? `Demande de reprise : ${existing.assignment.title}`
          : `Travail corrigé : ${existing.assignment.title}`
        const notifMsg = updatedSubmission.status === 'returned'
          ? `Votre formateur a demandé une modification pour "${existing.assignment.title}". Commentaire : ${updatedSubmission.feedback || 'Aucun'}`
          : `Votre travail "${existing.assignment.title}" a été noté ${updatedSubmission.grade}/20.`

        await prisma.adminNotification.create({
          data: {
            title: notifTitle,
            message: notifMsg,
            type: updatedSubmission.status === 'returned' ? 'warning' : 'success',
            target: 'student',
            studentEmail: existing.student.email,
            createdBy: auth.admin.username,
          },
        })
      }
    } catch (notifErr) {
      console.warn('[Notification Creation Warning]:', notifErr)
    }

    // Realtime notification via Supabase
    try {
      if (supabase) {
        await supabase.channel('submissions_channel').send({
          type: 'broadcast',
          event: 'submission_graded',
          payload: {
            submissionId,
            studentId: existing.studentId,
            assignmentId: existing.assignmentId,
            status: updatedSubmission.status,
            grade: updatedSubmission.grade,
            feedback: updatedSubmission.feedback,
          },
        })
      }
    } catch (rErr) {
      console.warn('[Realtime Notification Warning]:', rErr)
    }

    return NextResponse.json({ success: true, submission: updatedSubmission })
  } catch (error: any) {
    console.error('[Admin Submission PUT Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de l’enregistrement de la correction' },
      { status: 500 }
    )
  }
}
