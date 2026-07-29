import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = await requireStudent(req)
  if (auth.error) return auth.error

  try {
    const payload = await req.json()
    const { assignmentId, files } = payload
    
    if (!assignmentId || !files || files.length === 0) {
      return NextResponse.json({ error: 'Fichiers manquants' }, { status: 400 })
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId, 10) }
    })
    
    if (!assignment) {
      return NextResponse.json({ error: 'Travail introuvable' }, { status: 404 })
    }

    // Upsert submission
    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: auth.student.id
        }
      },
      update: {
        status: 'submitted',
        submittedAt: new Date()
      },
      create: {
        assignmentId: assignment.id,
        studentId: auth.student.id,
        status: 'submitted',
        submittedAt: new Date()
      }
    })

    // Create file records
    for (const file of files) {
      await prisma.submissionFile.create({
        data: {
          submissionId: submission.id,
          name: file.name,
          url: file.url,
          size: file.size,
          type: file.type || 'application/octet-stream'
        }
      })
    }

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('[API] Error submitting assignment:', error)
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 })
  }
}
