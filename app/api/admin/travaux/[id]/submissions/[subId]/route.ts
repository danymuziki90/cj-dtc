import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { sendAssignmentGradedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, subId: string }> }) {
  try {
    const submissionId = parseInt((await params).subId, 10)
    if (isNaN(submissionId)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    const payload = await req.json()
    const { grade, feedback, status } = payload

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade !== undefined ? parseFloat(grade) : undefined,
        feedback,
        status: status || 'graded',
        gradedAt: new Date(),
        // gradedBy: session.user.id
      },
      include: {
        Student: true,
        Assignment: true
      }
    })

    if (supabase) {
      const channel = supabase.channel('submissions_travaux_channel')
      channel.send({
        type: 'broadcast',
        event: 'submission_graded',
        payload: { submissionId: submission.id, assignmentId: submission.assignmentId, studentId: submission.studentId }
      })
    }

    // Send email asynchronously so it doesn't block the API response
    if (submission.Student?.email && submission.Assignment?.title) {
      sendAssignmentGradedEmail(
        submission.Student.email,
        submission.Assignment.title,
        submission.grade || 0,
        submission.feedback
      ).catch(err => console.error('[Email Error] Failed to send graded email:', err))
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('[API] Error updating submission:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}

