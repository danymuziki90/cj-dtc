import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        Formation: { select: { title: true } },
        TrainingSession: { select: { title: true } },
        AssignmentFile: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Travail non trouvé' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('[API] Error fetching assignment:', error)
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    const payload = await req.json()
    const {
      title,
      description,
      type,
      formationId,
      sessionId,
      deadline,
      instructions,
      maxFileSize,
      allowedFileTypes,
      difficulty,
      objectives,
      published,
      allowResubmission,
      maxFiles
    } = payload

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description,
        type,
        formationId: formationId ? parseInt(formationId, 10) : undefined,
        sessionId: sessionId ? parseInt(sessionId, 10) : null,
        deadline: deadline ? new Date(deadline) : undefined,
        instructions,
        maxFileSize: maxFileSize ? parseInt(maxFileSize, 10) : undefined,
        allowedFileTypes,
        difficulty,
        objectives,
        published,
        allowResubmission,
        maxFiles: maxFiles ? parseInt(maxFiles, 10) : undefined,
        status: published !== undefined ? (published ? 'publie' : 'brouillon') : undefined
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('[API] Error updating assignment:', error)
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    await prisma.assignment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error deleting assignment:', error)
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
}
