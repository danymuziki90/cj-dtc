import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignmentId = parseInt(params.id, 10)
    if (isNaN(assignmentId)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        Student: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        SubmissionFile: true,
      },
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('[API] Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
