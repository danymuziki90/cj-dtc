import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('[API] Error updating submission:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}
