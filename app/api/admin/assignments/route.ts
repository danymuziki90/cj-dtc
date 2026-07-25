import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const sessionIdParam = searchParams.get('sessionId')
  const statusParam = searchParams.get('status')
  const search = searchParams.get('search')?.trim() || ''
  const publishedOnly = searchParams.get('published') === 'true'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '500', 10)

  const whereClause: any = {}

  if (sessionIdParam && sessionIdParam !== 'all') {
    whereClause.sessionId = parseInt(sessionIdParam, 10)
  }

  if (statusParam && statusParam !== 'all') {
    if (statusParam === 'published') {
      whereClause.published = true
    } else if (statusParam === 'draft') {
      whereClause.published = false
    } else if (['brouillon', 'publie', 'archive'].includes(statusParam)) {
      whereClause.status = statusParam
    }
  }

  if (publishedOnly) {
    whereClause.published = true
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { formation: { title: { contains: search, mode: 'insensitive' } } },
    ]
  }

  try {
    const total = await prisma.assignment.count({ where: whereClause })

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        formation: {
          select: { id: true, title: true, slug: true },
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            location: true,
            format: true,
            status: true,
          },
        },
        files: true,
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                studentNumber: true,
              },
            },
            files: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('[Admin Assignments GET Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur de chargement des travaux' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const contentType = request.headers.get('content-type') || ''
    let title = ''
    let description = ''
    let objectives = ''
    let instructions = ''
    let type = 'tp'
    let difficulty = 'intermediaire'
    let status = 'publie'
    let deadlineStr = ''
    let sessionIdVal: number | null = null
    let formationIdVal: number | null = null
    let maxFileSize = 10
    let maxFiles = 5
    let allowResubmission = true
    let allowedFileTypes = 'pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx'
    let published = true
    const attachedFilesToUpload: { name: string; buffer: Buffer; mimeType: string; size: number }[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      title = String(formData.get('title') || '').trim()
      description = String(formData.get('description') || '').trim()
      objectives = String(formData.get('objectives') || '').trim()
      instructions = String(formData.get('instructions') || '').trim()
      type = String(formData.get('type') || 'tp').trim()
      difficulty = String(formData.get('difficulty') || 'intermediaire').trim()
      status = String(formData.get('status') || 'publie').trim()
      deadlineStr = String(formData.get('deadline') || '').trim()

      const rawSessionId = formData.get('sessionId')
      if (rawSessionId) sessionIdVal = parseInt(String(rawSessionId), 10)

      const rawFormationId = formData.get('formationId')
      if (rawFormationId) formationIdVal = parseInt(String(rawFormationId), 10)

      const rawMaxFileSize = formData.get('maxFileSize')
      if (rawMaxFileSize) maxFileSize = parseInt(String(rawMaxFileSize), 10) || 10

      const rawMaxFiles = formData.get('maxFiles')
      if (rawMaxFiles) maxFiles = parseInt(String(rawMaxFiles), 10) || 5

      const rawAllowResub = formData.get('allowResubmission')
      if (rawAllowResub !== null) allowResubmission = rawAllowResub === 'true' || rawAllowResub === '1'

      const rawAllowedTypes = formData.get('allowedFileTypes')
      if (rawAllowedTypes) allowedFileTypes = String(rawAllowedTypes).trim()

      if (formData.has('published')) {
        published = formData.get('published') === 'true' || formData.get('published') === '1'
      } else {
        published = status === 'publie'
      }

      // Read uploaded consigne files
      const entries = Array.from(formData.entries())
      for (const [key, value] of entries) {
        if ((key.startsWith('file_') || key === 'files') && value instanceof File) {
          if (value.size > 0) {
            const arrayBuffer = await value.arrayBuffer()
            attachedFilesToUpload.push({
              name: value.name,
              buffer: Buffer.from(arrayBuffer),
              mimeType: value.type || 'application/octet-stream',
              size: value.size,
            })
          }
        }
      }
    } else {
      const body = await request.json()
      title = body.title || ''
      description = body.description || ''
      objectives = body.objectives || ''
      instructions = body.instructions || ''
      type = body.type || 'tp'
      difficulty = body.difficulty || 'intermediaire'
      status = body.status || (body.published === false ? 'brouillon' : 'publie')
      deadlineStr = body.deadline || ''
      if (body.sessionId) sessionIdVal = parseInt(String(body.sessionId), 10)
      if (body.formationId) formationIdVal = parseInt(String(body.formationId), 10)
      if (body.maxFileSize) maxFileSize = Number(body.maxFileSize) || 10
      if (body.maxFiles) maxFiles = Number(body.maxFiles) || 5
      if (typeof body.allowResubmission === 'boolean') allowResubmission = body.allowResubmission
      if (body.allowedFileTypes) allowedFileTypes = String(body.allowedFileTypes)
      if (typeof body.published === 'boolean') {
        published = body.published
      } else {
        published = status === 'publie'
      }
    }

    if (!title || !description || !deadlineStr || !sessionIdVal) {
      return NextResponse.json(
        { success: false, error: 'Veuillez remplir le titre, la description, la session et la date limite.' },
        { status: 400 }
      )
    }

    // Resolve formationId from session
    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionIdVal },
      select: { id: true, formationId: true, status: true },
    })

    if (!session) {
      return NextResponse.json({ success: false, error: 'La session sélectionnée est introuvable.' }, { status: 404 })
    }

    const resolvedFormationId = formationIdVal || session.formationId

    const deadline = new Date(deadlineStr)
    if (isNaN(deadline.getTime())) {
      return NextResponse.json({ success: false, error: 'La date limite fournie est invalide.' }, { status: 400 })
    }

    // Create assignment in Prisma
    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        objectives: objectives || null,
        instructions: instructions || null,
        type,
        difficulty,
        status,
        deadline,
        published,
        maxFileSize,
        maxFiles,
        allowResubmission,
        allowedFileTypes,
        sessionId: sessionIdVal,
        formationId: resolvedFormationId,
      },
    })

    // Upload consigne files to Cloudflare R2
    for (const fileItem of attachedFilesToUpload) {
      const timestamp = Date.now()
      const sanitizedFilename = fileItem.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storageKeyName = `${newAssignment.id}_${timestamp}_${sanitizedFilename}`

      const fileUrl = await uploadToR2(
        fileItem.buffer,
        storageKeyName,
        'travaux/consignes',
        fileItem.mimeType
      )

      await prisma.assignmentFile.create({
        data: {
          assignmentId: newAssignment.id,
          name: storageKeyName,
          originalName: fileItem.name,
          size: fileItem.size,
          mimeType: fileItem.mimeType,
          url: fileUrl,
          key: `travaux/consignes/${storageKeyName}`,
        },
      })
    }

    // Retrieve created assignment with relations
    const result = await prisma.assignment.findUnique({
      where: { id: newAssignment.id },
      include: {
        formation: { select: { id: true, title: true, slug: true } },
        session: { select: { id: true, startDate: true, endDate: true, location: true, format: true } },
        files: true,
        submissions: true,
      },
    })

    // Notify via Supabase Realtime broadcast channel
    try {
      if (supabase) {
        await supabase.channel('assignments_channel').send({
          type: 'broadcast',
          event: 'assignment_created',
          payload: { assignmentId: newAssignment.id, sessionId: sessionIdVal },
        })
      }
    } catch (realtimeErr) {
      console.warn('[Realtime Notification Warning]:', realtimeErr)
    }

    return NextResponse.json({ success: true, assignment: result }, { status: 201 })
  } catch (error: any) {
    console.error('[Admin Assignments POST Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la création du travail' },
      { status: 500 }
    )
  }
}
