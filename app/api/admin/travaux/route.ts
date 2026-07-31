import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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
      maxFiles,
      files
    } = payload
    
    if (!title || !description || !formationId || !deadline) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type: type || 'tp',
        formationId: parseInt(formationId, 10),
        sessionId: sessionId ? parseInt(sessionId, 10) : null,
        deadline: new Date(deadline),
        instructions: instructions || '',
        maxFileSize: maxFileSize ? parseInt(maxFileSize, 10) : 10,
        allowedFileTypes: allowedFileTypes || 'pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx',
        difficulty: difficulty || 'intermediaire',
        objectives: objectives || '',
        published: published !== undefined ? published : true,
        allowResubmission: allowResubmission !== undefined ? allowResubmission : true,
        maxFiles: maxFiles ? parseInt(maxFiles, 10) : 5,
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

