import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const assignmentSchema = z.object({
  title: z.string().trim().min(1, 'Titre requis'),
  description: z.string().trim().min(1, 'Description requise'),
  type: z.string().optional().nullable(),
  formationId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  sessionId: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : undefined),
  deadline: z.string().min(1, 'Date limite requise'),
  instructions: z.string().optional().nullable(),
  maxFileSize: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : undefined),
  allowedFileTypes: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  published: z.boolean().optional().nullable(),
  allowResubmission: z.boolean().optional().nullable(),
  maxFiles: z.union([z.number(), z.string()]).optional().nullable().transform(val => val ? Number(val) : undefined),
  files: z.array(z.any()).optional().nullable(),
})

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const search = searchParams.get('search') || ''

    const where: Prisma.AssignmentWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    const skip = (page - 1) * pageSize
    
    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          Formation: { select: { title: true } },
          TrainingSession: { select: { id: true, startDate: true } }
        }
      }),
      prisma.assignment.count({ where }),
    ])
    
    // Also fetch formations and sessions for the dropdowns
    const formations = await prisma.formation.findMany({
      select: { id: true, title: true }
    })
    const sessions = await prisma.trainingSession.findMany({
      select: { id: true, startDate: true, formationId: true }
    })

    return NextResponse.json({
      assignments,
      formations,
      sessions,
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('[API] Error fetching assignments:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = assignmentSchema.safeParse(await req.json())
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

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
      maxFiles,
      files
    } = parsed.data

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type: type || 'tp',
        formationId: formationId,
        sessionId: sessionId || null,
        deadline: new Date(deadline),
        instructions: instructions || '',
        maxFileSize: maxFileSize || 10,
        allowedFileTypes: allowedFileTypes || 'pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx',
        difficulty: difficulty || 'intermediaire',
        objectives: objectives || '',
        published: published !== undefined && published !== null ? published : true,
        allowResubmission: allowResubmission !== undefined && allowResubmission !== null ? allowResubmission : true,
        maxFiles: maxFiles || 5,
        status: published ? 'publie' : 'brouillon',
        AssignmentFile: files && Array.isArray(files) ? {
          create: files.map((f: any) => ({
            name: f.name,
            originalName: f.originalName,
            size: f.size,
            mimeType: f.mimeType,
            url: f.url,
            key: f.key
          }))
        } : undefined
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('[API] Error creating assignment:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}

