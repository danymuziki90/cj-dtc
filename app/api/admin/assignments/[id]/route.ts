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
  deadline: z.string().min(10).optional(),
  maxFileSize: z.coerce.number().int().min(1).max(100).optional(),
  allowedFileTypes: z.array(z.string().trim().min(1).max(20)).max(12).optional(),
  instructions: z.string().trim().max(5000).nullable().optional(),
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
        { error: 'Donnees invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.assignment.findUnique({
      where: { id },
      select: { id: true, title: true },
    })
    if (!existing) return NextResponse.json({ error: 'Travail introuvable.' }, { status: 404 })

    const data = parsed.data
    const deadline = data.deadline ? new Date(data.deadline) : undefined
    if (deadline && Number.isNaN(deadline.getTime())) {
      return NextResponse.json({ error: 'Date limite invalide.' }, { status: 400 })
    }

    if (data.formationId) {
      const formation = await prisma.formation.findUnique({
        where: { id: data.formationId },
        select: { id: true },
      })
      if (!formation) return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 })
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        formationId: data.formationId,
        deadline,
        maxFileSize: data.maxFileSize,
        allowedFileTypes: data.allowedFileTypes ? data.allowedFileTypes.join(',') : undefined,
        instructions: data.instructions === undefined ? undefined : data.instructions || null,
      },
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        submissions: {
          include: { files: true },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

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
