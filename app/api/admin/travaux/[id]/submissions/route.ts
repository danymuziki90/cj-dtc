import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) return auth.error

    const assignmentId = parseInt((await params).id, 10)
    if (isNaN(assignmentId)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        SubmissionFile: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('[API] Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
