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
  formationId: z.coerce.number().int().positive().optional(),
  sessionId: z.coerce.number().int().positive(),
  deadline: z.string().min(10),
  maxFileSize: z.coerce.number().int().min(1).max(100).default(10),
  allowedFileTypes: z.array(z.string().trim().min(1).max(20)).max(12).optional(),
  instructions: z.string().trim().max(5000).optional(),
  objectives: z.string().trim().max(5000).optional(),
  difficulty: z.enum(['debutant', 'intermediaire', 'avance']).optional().default('debutant'),
  status: z.enum(['brouillon', 'publie', 'archive']).optional().default('publie'),
  publishDate: z.string().optional(),
  files: z.array(z.object({
    name: z.string(),
    originalName: z.string(),
    size: z.number(),
    url: z.string()
  })).optional()
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
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            location: true,
            format: true,
          }
        },
        files: true,
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
        { error: 'Données invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const deadline = new Date(data.deadline)
    if (Number.isNaN(deadline.getTime())) {
      return NextResponse.json({ error: 'Date limite invalide.' }, { status: 400 })
    }

    let pubDate = new Date()
    if (data.publishDate && data.publishDate.trim()) {
      const parsedPubDate = new Date(data.publishDate)
      if (Number.isNaN(parsedPubDate.getTime())) {
        return NextResponse.json({ error: "Date d'affichage invalide." }, { status: 400 })
      }
      pubDate = parsedPubDate
    }

    let targetFormationId = data.formationId
    if (data.sessionId) {
      const sessionExists = await prisma.trainingSession.findUnique({
        where: { id: data.sessionId },
        select: { id: true, formationId: true }
      })
      if (!sessionExists) {
        return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 })
      }
      targetFormationId = sessionExists.formationId
    }

    if (!targetFormationId) {
      return NextResponse.json({ error: 'Veuillez sélectionner une session.' }, { status: 400 })
    }

    const formation = await prisma.formation.findUnique({
      where: { id: targetFormationId },
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
        formationId: targetFormationId,
        sessionId: data.sessionId,
        deadline,
        maxFileSize: data.maxFileSize,
        allowedFileTypes: (data.allowedFileTypes?.length ? data.allowedFileTypes : ['pdf', 'doc', 'docx', 'zip']).join(','),
        instructions: data.instructions || null,
        objectives: data.objectives || null,
        difficulty: data.difficulty || 'debutant',
        createdBy: auth.admin.username || auth.admin.email || 'Admin',
        status: data.status,
        publishDate: pubDate,
        files: {
          create: data.files?.map(f => ({
            name: f.name,
            originalName: f.originalName,
            size: f.size,
            url: f.url
          })) || []
        }
      },
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
        },
      },
    })

    if (assignment.status === 'publie') {
      try {
        await prisma.adminNotification.create({
          data: {
            title: '📚 Nouveau devoir disponible',
            message: `Le devoir "${assignment.title}" est disponible pour la formation "${formation.title}". Date limite de remise : ${deadline.toLocaleString('fr-FR')}.`,
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
      action: 'assignment.create',
      targetType: 'Assignment',
      targetId: String(assignment.id),
      targetLabel: assignment.title,
      summary: `Création du travail "${assignment.title}" pour ${formation.title}.`,
      metadata: {
        formationId: formation.id,
        sessionId: assignment.sessionId,
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
