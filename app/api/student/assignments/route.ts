import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const student = auth.student

  try {
    // 1. Get all active enrollments for this student (not rejected or cancelled)
    const activeEnrollments = await prisma.enrollment.findMany({
      where: {
        OR: [
          { studentId: student.id },
          { email: { equals: student.email, mode: 'insensitive' } },
        ],
        status: {
          notIn: ['rejected', 'cancelled', 'REJECTED', 'CANCELLED', 'annulee', 'rejete'],
        },
      },
      select: { sessionId: true, formationId: true },
    })

    const enrolledSessionIds = new Set<number>()
    const enrolledFormationIds = new Set<number>()
    for (const e of activeEnrollments) {
      if (e.sessionId) enrolledSessionIds.add(e.sessionId)
      if (e.formationId) enrolledFormationIds.add(e.formationId)
    }

    const sessionIdsList = Array.from(enrolledSessionIds)
    const formationIdsList = Array.from(enrolledFormationIds)

    if (sessionIdsList.length === 0 && formationIdsList.length === 0) {
      return NextResponse.json([])
    }

    // 2. Fetch published assignments for those sessions or formation-level assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        published: true,
        status: { notIn: ['brouillon', 'archive', 'draft'] },
        OR: [
          ...(sessionIdsList.length ? [{ sessionId: { in: sessionIdsList } }] : []),
          ...(formationIdsList.length ? [{ formationId: { in: formationIdsList } }] : []),
        ],
      },
      orderBy: { deadline: 'asc' },
      include: {
        formation: { select: { title: true, slug: true } },
        session: { select: { id: true, startDate: true, endDate: true, location: true, format: true } },
        files: true,
        submissions: {
          where: { studentId: student.id },
          orderBy: { submittedAt: 'desc' },
          include: { files: true },
        },
      },
    })

    const formatted = assignments.map((a) => {
      const allowedTypesArray = a.allowedFileTypes
        ? a.allowedFileTypes.split(',').map((t) => t.trim())
        : ['pdf', 'doc', 'docx', 'zip', 'rar', 'png', 'jpg', 'jpeg']

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        objectives: a.objectives,
        instructions: a.instructions,
        type: a.type,
        difficulty: a.difficulty,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
        deadline: a.deadline.toISOString(),
        maxFileSize: a.maxFileSize,
        maxFiles: a.maxFiles || 5,
        allowResubmission: a.allowResubmission !== false,
        allowedFileTypes: allowedTypesArray,
        formation: a.formation,
        session: a.session,
        files: a.files.map((f) => ({
          id: f.id,
          name: f.name,
          originalName: f.originalName,
          size: f.size,
          mimeType: f.mimeType,
          url: f.url,
        })),
        submissions: a.submissions.map((s) => ({
          id: s.id,
          status: s.status,
          grade: s.grade,
          feedback: s.feedback,
          submittedAt: s.submittedAt.toISOString(),
          gradedAt: s.gradedAt ? s.gradedAt.toISOString() : null,
          files: s.files.map((sf) => ({
            id: sf.id,
            name: sf.name,
            originalName: sf.originalName,
            size: sf.size,
            mimeType: sf.mimeType,
            url: sf.url,
          })),
        })),
      }
    })

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error('[Student Assignments GET Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la récupération des travaux' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const student = auth.student

  try {
    const formData = await request.formData()
    const assignmentIdVal = formData.get('assignmentId')

    if (!assignmentIdVal) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du travail manquant' },
        { status: 400 }
      )
    }

    const assignmentId = parseInt(String(assignmentIdVal), 10)
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du travail invalide' },
        { status: 400 }
      )
    }

    // Verify assignment exists and is published
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        session: true,
      },
    })

    if (!assignment || !assignment.published || assignment.status === 'brouillon' || assignment.status === 'archive') {
      return NextResponse.json(
        { success: false, error: 'Le devoir sélectionné est introuvable ou non disponible.' },
        { status: 404 }
      )
    }

    // Verify student enrollment in assignment session
    if (assignment.sessionId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          sessionId: assignment.sessionId,
          OR: [
            { studentId: student.id },
            { email: student.email },
          ],
          status: {
            in: ['accepted', 'confirmed', 'completed', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'ACTIVE', 'active'],
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: 'Vous n’êtes pas inscrit ou votre inscription n’a pas encore été acceptée pour cette session.' },
          { status: 403 }
        )
      }
    }

    // Check existing submission and replacement policy
    let existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: student.id,
      },
      include: { files: true },
    })

    if (existingSubmission && assignment.allowResubmission === false && existingSubmission.status !== 'returned') {
      return NextResponse.json(
        { success: false, error: 'Le remplacement des fichiers pour ce travail n’est pas autorisé.' },
        { status: 400 }
      )
    }

    // Extract files from formData
    const filesToUpload: { file: File; buffer: Buffer }[] = []
    const entries = Array.from(formData.entries())

    for (const [key, value] of entries) {
      if ((key.startsWith('file_') || key === 'files' || key === 'file') && value instanceof File) {
        if (value.size > 0) {
          const arrayBuffer = await value.arrayBuffer()
          filesToUpload.push({
            file: value,
            buffer: Buffer.from(arrayBuffer),
          })
        }
      }
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Veuillez sélectionner au moins un fichier à téléverser.' },
        { status: 400 }
      )
    }

    const maxAllowedFiles = assignment.maxFiles || 5
    if (filesToUpload.length > maxAllowedFiles) {
      return NextResponse.json(
        { success: false, error: `Vous ne pouvez pas téléverser plus de ${maxAllowedFiles} fichier(s).` },
        { status: 400 }
      )
    }

    // Client-specified & Assignment max file size check
    const maxBytes = assignment.maxFileSize * 1024 * 1024
    const allowedTypesArray = assignment.allowedFileTypes
      ? assignment.allowedFileTypes.split(',').map((t) => t.trim().toLowerCase().replace(/^\./, ''))
      : ['pdf', 'doc', 'docx', 'zip', 'rar', 'png', 'jpg', 'jpeg']

    for (const item of filesToUpload) {
      if (item.file.size > maxBytes) {
        return NextResponse.json(
          {
            success: false,
            error: `Le fichier "${item.file.name}" (${(item.file.size / 1024 / 1024).toFixed(
              1
            )} MB) dépasse la taille maximale autorisée de ${assignment.maxFileSize} MB.`,
          },
          { status: 400 }
        )
      }

      const ext = item.file.name.split('.').pop()?.toLowerCase() || ''
      if (allowedTypesArray.length > 0 && !allowedTypesArray.includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: `Le format de fichier .${ext} n'est pas autorisé pour "${item.file.name}". Formats acceptés : ${allowedTypesArray.join(', ')}.`,
          },
          { status: 400 }
        )
      }
    }

    let submissionId: number

    if (existingSubmission) {
      // Update submission timestamp and reset status to 'submitted'
      const updatedSub = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          status: 'submitted',
          submittedAt: new Date(),
          grade: null,
          feedback: null,
        },
      })
      submissionId = updatedSub.id

      // Clean up previous submission files from R2 and DB if replacing
      for (const oldFile of existingSubmission.files) {
        if (oldFile.key) {
          try {
            await import('@/lib/r2').then((m) => m.deleteFromR2(oldFile.key!))
          } catch (e) {
            console.warn('[R2 Delete Old File Warning]:', e)
          }
        }
      }
      await prisma.submissionFile.deleteMany({
        where: { submissionId: existingSubmission.id },
      })
    } else {
      const newSub = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: student.id,
          sessionId: assignment.sessionId,
          status: 'submitted',
          submittedAt: new Date(),
        },
      })
      submissionId = newSub.id
    }

    // Upload files to Cloudflare R2 and save in SubmissionFile table
    for (const item of filesToUpload) {
      const timestamp = Date.now()
      const sanitizedFilename = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storageKeyName = `${student.id}_${assignmentId}_${timestamp}_${sanitizedFilename}`

      const fileUrl = await uploadToR2(
        item.buffer,
        storageKeyName,
        'travaux/remises',
        item.file.type || 'application/octet-stream'
      )

      await prisma.submissionFile.create({
        data: {
          submissionId,
          name: storageKeyName,
          originalName: item.file.name,
          size: item.file.size,
          mimeType: item.file.type || 'application/octet-stream',
          url: fileUrl,
          key: `travaux/remises/${storageKeyName}`,
        },
      })
    }

    // Retrieve final submission
    const finalSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        files: true,
        student: { select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true } },
      },
    })

    // Realtime notification via Supabase for immediate Admin dashboard refresh
    try {
      if (supabase) {
        await supabase.channel('submissions_channel').send({
          type: 'broadcast',
          event: 'submission_created',
          payload: {
            submissionId,
            assignmentId,
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            sessionId: assignment.sessionId,
          },
        })
      }
    } catch (rErr) {
      console.warn('[Realtime Notification Warning]:', rErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Votre travail a été téléversé avec succès.',
      submission: {
        id: finalSubmission?.id,
        status: finalSubmission?.status,
        grade: finalSubmission?.grade,
        feedback: finalSubmission?.feedback,
        submittedAt: finalSubmission?.submittedAt.toISOString(),
        files: finalSubmission?.files.map((f) => ({
          id: f.id,
          name: f.name,
          originalName: f.originalName,
          size: f.size,
          mimeType: f.mimeType,
          url: f.url,
        })),
      },
    })
  } catch (error: any) {
    console.error('[Student Assignment Submit POST Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Une erreur est survenue lors du téléversement.' },
      { status: 500 }
    )
  }
}
