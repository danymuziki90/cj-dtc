import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

const updateAssignmentSchema = z.object({
  title: z.string().trim().min(3).max(180).optional(),
  description: z.string().trim().min(3).max(2000).optional(),
  type: z.enum(['tp', 'exam', 'project']).optional(),
  formationId: z.coerce.number().int().positive().optional(),
  sessionId: z.coerce.number().int().positive().optional(),
  deadline: z.string().min(10).optional(),
  maxFileSize: z.coerce.number().int().min(1).max(100).optional(),
  allowedFileTypes: z.array(z.string().trim().min(1).max(20)).max(12).optional(),
  instructions: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(['brouillon', 'publie', 'archive']).optional(),
  publishDate: z.string().optional(),
  files: z.array(z.object({
    name: z.string(),
    originalName: z.string(),
    size: z.number(),
    url: z.string()
  })).optional()
})

function parseAssignmentId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function parseAllowedFileTypes(value: string | null | undefined) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function mapAssignment(assignment: any) {
  return {
    ...assignment,
    allowedFileTypes: parseAllowedFileTypes(assignment.allowedFileTypes),
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id: rawId } = await context.params
    const id = parseAssignmentId(rawId)
    if (!id) return NextResponse.json({ error: 'ID invalide.' }, { status: 400 })

    const body = await request.json().catch(() => null)
    const parsed = updateAssignmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.assignment.findUnique({
      where: { id },
      select: { id: true, title: true, status: true },
    })
    if (!existing) return NextResponse.json({ error: 'Travail introuvable.' }, { status: 404 })

    const data = parsed.data
    const deadline = data.deadline ? new Date(data.deadline) : undefined
    if (deadline && Number.isNaN(deadline.getTime())) {
      return NextResponse.json({ error: 'Date limite invalide.' }, { status: 400 })
    }

    let pubDate = undefined
    if (data.publishDate !== undefined) {
      if (data.publishDate && data.publishDate.trim()) {
        const parsedPubDate = new Date(data.publishDate)
        if (Number.isNaN(parsedPubDate.getTime())) {
          return NextResponse.json({ error: "Date d'affichage invalide." }, { status: 400 })
        }
        pubDate = parsedPubDate
      } else {
        pubDate = new Date()
      }
    }

    if (data.formationId) {
      const formation = await prisma.formation.findUnique({
        where: { id: data.formationId },
        select: { id: true },
      })
      if (!formation) return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 })
    }

    if (data.sessionId) {
      const session = await prisma.trainingSession.findUnique({
        where: { id: data.sessionId },
        select: { id: true },
      })
      if (!session) return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 })
    }

    // Prepare update payload
    const updatePayload: any = {
      title: data.title,
      description: data.description,
      type: data.type,
      formationId: data.formationId,
      sessionId: data.sessionId === undefined ? undefined : data.sessionId,
      deadline,
      maxFileSize: data.maxFileSize,
      allowedFileTypes: data.allowedFileTypes ? data.allowedFileTypes.join(',') : undefined,
      instructions: data.instructions === undefined ? undefined : data.instructions,
      status: data.status,
      publishDate: pubDate
    }

    // Handle files update if provided
    if (data.files) {
      // Delete old files first
      await prisma.assignmentFile.deleteMany({
        where: { assignmentId: id }
      })
      // Connect new files
      updatePayload.files = {
        create: data.files.map(f => ({
          name: f.name,
          originalName: f.originalName,
          size: f.size,
          url: f.url
        }))
      }
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: updatePayload,
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
          }
        },
        files: true,
        submissions: {
          include: { files: true },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (assignment.status === 'publie' && existing.status !== 'publie') {
      try {
        await prisma.adminNotification.create({
          data: {
            title: '📚 Nouveau devoir disponible',
            message: `Le devoir "${assignment.title}" est disponible pour la formation "${assignment.formation.title}". Date limite de remise : ${assignment.deadline.toLocaleString('fr-FR')}.`,
            type: 'info',
            target: assignment.sessionId ? 'session' : 'all',
            sessionId: assignment.sessionId || null,
            createdBy: auth.admin.username,
          }
        })
      } catch (err) {
        console.error('Failed to create assignment notification:', err)
      }
    }

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'assignment.update',
      targetType: 'Assignment',
      targetId: String(id),
      targetLabel: assignment.title,
      summary: `Modification du travail "${assignment.title}".`,
      metadata: {
        previousTitle: existing.title,
      },
    })

    return NextResponse.json(mapAssignment(assignment))
  } catch (error) {
    console.error('Assignment admin update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id: rawId } = await context.params
    const id = parseAssignmentId(rawId)
    if (!id) return NextResponse.json({ error: 'ID invalide.' }, { status: 400 })

    const existing = await prisma.assignment.findUnique({
      where: { id },
      select: { id: true, title: true },
    })
    if (!existing) return NextResponse.json({ error: 'Travail introuvable.' }, { status: 404 })

    await prisma.assignment.delete({ where: { id } })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'assignment.delete',
      targetType: 'Assignment',
      targetId: String(id),
      targetLabel: existing.title,
      summary: `Suppression du travail "${existing.title}".`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Assignment admin delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
