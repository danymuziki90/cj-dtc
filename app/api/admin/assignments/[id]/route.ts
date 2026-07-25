import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { uploadToR2, deleteFromR2 } from '@/lib/r2'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const assignmentId = parseInt(id, 10)
  if (isNaN(assignmentId)) {
    return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 })
  }

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        formation: { select: { id: true, title: true, slug: true } },
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
          orderBy: { submittedAt: 'desc' },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                studentNumber: true,
                phone: true,
              },
            },
            files: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Travail introuvable' }, { status: 404 })
    }

    return NextResponse.json({ success: true, assignment })
  } catch (error: any) {
    console.error('[Admin Assignment GET ID Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la récupération du travail' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const assignmentId = parseInt(id, 10)
  if (isNaN(assignmentId)) {
    return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 })
  }

  try {
    const existing = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Travail introuvable' }, { status: 404 })
    }

    const contentType = request.headers.get('content-type') || ''
    let title: string | undefined
    let description: string | undefined
    let objectives: string | undefined
    let instructions: string | undefined
    let type: string | undefined
    let difficulty: string | undefined
    let status: string | undefined
    let deadlineStr: string | undefined
    let sessionIdVal: number | undefined
    let maxFileSize: number | undefined
    let maxFiles: number | undefined
    let allowResubmission: boolean | undefined
    let allowedFileTypes: string | undefined
    let published: boolean | undefined
    const attachedFilesToUpload: { name: string; buffer: Buffer; mimeType: string; size: number }[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      if (formData.has('title')) title = String(formData.get('title')).trim()
      if (formData.has('description')) description = String(formData.get('description')).trim()
      if (formData.has('objectives')) objectives = String(formData.get('objectives')).trim()
      if (formData.has('instructions')) instructions = String(formData.get('instructions')).trim()
      if (formData.has('type')) type = String(formData.get('type')).trim()
      if (formData.has('difficulty')) difficulty = String(formData.get('difficulty')).trim()
      if (formData.has('status')) status = String(formData.get('status')).trim()
      if (formData.has('deadline')) deadlineStr = String(formData.get('deadline')).trim()
      if (formData.has('sessionId')) sessionIdVal = parseInt(String(formData.get('sessionId')), 10)
      if (formData.has('maxFileSize')) maxFileSize = parseInt(String(formData.get('maxFileSize')), 10)
      if (formData.has('maxFiles')) maxFiles = parseInt(String(formData.get('maxFiles')), 10)
      if (formData.has('allowResubmission')) {
        const rawResub = formData.get('allowResubmission')
        allowResubmission = rawResub === 'true' || rawResub === '1'
      }
      if (formData.has('allowedFileTypes')) allowedFileTypes = String(formData.get('allowedFileTypes')).trim()
      if (formData.has('published')) published = formData.get('published') === 'true' || formData.get('published') === '1'

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
      if (body.title !== undefined) title = body.title
      if (body.description !== undefined) description = body.description
      if (body.objectives !== undefined) objectives = body.objectives
      if (body.instructions !== undefined) instructions = body.instructions
      if (body.type !== undefined) type = body.type
      if (body.difficulty !== undefined) difficulty = body.difficulty
      if (body.status !== undefined) status = body.status
      if (body.deadline !== undefined) deadlineStr = body.deadline
      if (body.sessionId !== undefined) sessionIdVal = parseInt(String(body.sessionId), 10)
      if (body.maxFileSize !== undefined) maxFileSize = Number(body.maxFileSize)
      if (body.maxFiles !== undefined) maxFiles = Number(body.maxFiles)
      if (body.allowResubmission !== undefined) allowResubmission = Boolean(body.allowResubmission)
      if (body.allowedFileTypes !== undefined) allowedFileTypes = body.allowedFileTypes
      if (body.published !== undefined) published = Boolean(body.published)
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (objectives !== undefined) updateData.objectives = objectives
    if (instructions !== undefined) updateData.instructions = instructions
    if (type !== undefined) updateData.type = type
    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (status !== undefined) {
      updateData.status = status
      if (published === undefined) {
        updateData.published = status === 'publie'
      }
    }
    if (published !== undefined) {
      updateData.published = published
      if (status === undefined) {
        updateData.status = published ? 'publie' : 'brouillon'
      }
    }
    if (maxFileSize !== undefined) updateData.maxFileSize = maxFileSize
    if (maxFiles !== undefined) updateData.maxFiles = maxFiles
    if (allowResubmission !== undefined) updateData.allowResubmission = allowResubmission
    if (allowedFileTypes !== undefined) updateData.allowedFileTypes = allowedFileTypes

    if (sessionIdVal !== undefined && !isNaN(sessionIdVal)) {
      updateData.sessionId = sessionIdVal
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionIdVal },
        select: { formationId: true },
      })
      if (session) {
        updateData.formationId = session.formationId
      }
    }

    if (deadlineStr) {
      const d = new Date(deadlineStr)
      if (!isNaN(d.getTime())) {
        updateData.deadline = d
      }
    }

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
    })

    // Upload any new consigne files
    for (const fileItem of attachedFilesToUpload) {
      const timestamp = Date.now()
      const sanitizedFilename = fileItem.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storageKeyName = `${assignmentId}_${timestamp}_${sanitizedFilename}`

      const fileUrl = await uploadToR2(
        fileItem.buffer,
        storageKeyName,
        'travaux/consignes',
        fileItem.mimeType
      )

      await prisma.assignmentFile.create({
        data: {
          assignmentId,
          name: storageKeyName,
          originalName: fileItem.name,
          size: fileItem.size,
          mimeType: fileItem.mimeType,
          url: fileUrl,
          key: `travaux/consignes/${storageKeyName}`,
        },
      })
    }

    const updated = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        formation: { select: { id: true, title: true, slug: true } },
        session: { select: { id: true, startDate: true, endDate: true, location: true, format: true } },
        files: true,
        submissions: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true } },
            files: true,
          },
        },
      },
    })

    // Notify via Supabase Realtime
    try {
      if (supabase) {
        await supabase.channel('assignments_channel').send({
          type: 'broadcast',
          event: 'assignment_updated',
          payload: { assignmentId, sessionId: updated?.sessionId },
        })
      }
    } catch (rErr) {
      console.warn('[Realtime Notification Warning]:', rErr)
    }

    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, assignment: updated })
  } catch (error: any) {
    console.error('[Admin Assignment PUT Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la mise à jour du travail' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const assignmentId = parseInt(id, 10)
  if (isNaN(assignmentId)) {
    return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 })
  }

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        files: true,
        submissions: {
          include: {
            files: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Travail introuvable' }, { status: 404 })
    }

    // Delete consigne files from R2
    for (const f of assignment.files) {
      if (f.key) {
        await deleteFromR2(f.key)
      }
    }

    // Delete student submission files from R2
    for (const sub of assignment.submissions) {
      for (const sf of sub.files) {
        if (sf.key) {
          await deleteFromR2(sf.key)
        }
      }
    }

    // Delete assignment record from DB (cascades AssignmentFile and Submission)
    await prisma.assignment.delete({
      where: { id: assignmentId },
    })

    // Realtime notification
    try {
      if (supabase) {
        await supabase.channel('assignments_channel').send({
          type: 'broadcast',
          event: 'assignment_deleted',
          payload: { assignmentId, sessionId: assignment.sessionId },
        })
      }
    } catch (rErr) {
      console.warn('[Realtime Notification Warning]:', rErr)
    }

    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true, message: 'Travail supprimé avec succès' })
  } catch (error: any) {
    console.error('[Admin Assignment DELETE Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la suppression du travail' },
      { status: 500 }
    )
  }
}
