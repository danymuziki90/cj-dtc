import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

const assignmentSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(3).max(2000),
  type: z.enum(['tp', 'exam', 'project']),
  formationId: z.coerce.number().int().positive(),
  deadline: z.string().min(10),
  maxFileSize: z.coerce.number().int().min(1).max(100).default(10),
  allowedFileTypes: z.array(z.string().trim().min(1).max(20)).max(12).optional(),
  instructions: z.string().trim().max(5000).optional(),
})

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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const assignments = await prisma.assignment.findMany({
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        submissions: {
          include: {
            files: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(assignments.map(mapAssignment))
  } catch (error) {
    console.error('Assignments admin list error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const body = await request.json().catch(() => null)
    const parsed = assignmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Donnees invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const deadline = new Date(data.deadline)
    if (Number.isNaN(deadline.getTime())) {
      return NextResponse.json({ error: 'Date limite invalide.' }, { status: 400 })
    }

    const formation = await prisma.formation.findUnique({
      where: { id: data.formationId },
      select: { id: true, title: true },
    })
    if (!formation) {
      return NextResponse.json({ error: 'Formation introuvable.' }, { status: 404 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        formationId: data.formationId,
        deadline,
        maxFileSize: data.maxFileSize,
        allowedFileTypes: (data.allowedFileTypes?.length ? data.allowedFileTypes : ['pdf', 'doc', 'docx', 'zip']).join(','),
        instructions: data.instructions || null,
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
        },
      },
    })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'assignment.create',
      targetType: 'Assignment',
      targetId: String(assignment.id),
      targetLabel: assignment.title,
      summary: `Creation du travail "${assignment.title}" pour ${formation.title}.`,
      metadata: {
        formationId: formation.id,
        deadline: assignment.deadline.toISOString(),
        type: assignment.type,
      },
    })

    return NextResponse.json(mapAssignment(assignment), { status: 201 })
  } catch (error) {
    console.error('Assignment admin create error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
