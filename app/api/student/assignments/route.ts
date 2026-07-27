export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

import { fetchStudentAssignmentsData } from '@/lib/student/assignments'

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const student = auth.student

  try {
    const formatted = await fetchStudentAssignmentsData(student.id, student.email)
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
    let assignmentId: number
    let preUploadedFiles: Array<{ name: string; originalName: string; size: number; mimeType?: string; url: string; key?: string }> = []
    let filesToUpload: { file: File; buffer: Buffer }[] = []

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await request.json()
      assignmentId = parseInt(String(body.assignmentId), 10)
      if (Array.isArray(body.files)) {
        preUploadedFiles = body.files
      }
    } else {
      const formData = await request.formData()
      const assignmentIdVal = formData.get('assignmentId')
      assignmentId = parseInt(String(assignmentIdVal), 10)

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
    }

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

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Le devoir sélectionné est introuvable. Veuillez actualiser la page et réessayer.' },
        { status: 404 }
      )
    }

    // A devoir is available if published=true AND status is not draft/archived
    const BLOCKED_STATUSES = ['brouillon', 'archive', 'draft', 'archived']
    if (!assignment.published || BLOCKED_STATUSES.includes(assignment.status?.toLowerCase() || '')) {
      return NextResponse.json(
        { success: false, error: 'Ce devoir n\'est plus disponible au dépôt (brouillon ou archivé).' },
        { status: 403 }
      )
    }

    // Verify student enrollment in assignment session (if session-scoped)
    if (assignment.sessionId) {
      const REJECTED_STATUSES = ['rejected', 'cancelled', 'REJECTED', 'CANCELLED', 'annulee', 'rejete', 'refuse']
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          sessionId: assignment.sessionId,
          OR: [
            { studentId: student.id },
            { email: { equals: student.email, mode: 'insensitive' } },
          ],
          status: {
            notIn: REJECTED_STATUSES,
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: 'Vous n\'êtes pas inscrit à la session associée à ce devoir. Veuillez contacter l\'administration.' },
          { status: 403 }
        )
      }
    } else if (assignment.formationId) {
      const REJECTED_STATUSES = ['rejected', 'cancelled', 'REJECTED', 'CANCELLED', 'annulee', 'rejete', 'refuse']
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          formationId: assignment.formationId,
          OR: [
            { studentId: student.id },
            { email: { equals: student.email, mode: 'insensitive' } },
          ],
          status: {
            notIn: REJECTED_STATUSES,
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: 'Vous n\'êtes pas inscrit à la formation associée à ce devoir. Veuillez contacter l\'administration.' },
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

    const totalFilesCount = preUploadedFiles.length + filesToUpload.length
    if (totalFilesCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Veuillez sélectionner au moins un fichier téléversé à transmettre.' },
        { status: 400 }
      )
    }

    // Validate that each pre-uploaded file has a valid URL
    for (const f of preUploadedFiles) {
      if (!f.url || typeof f.url !== 'string' || f.url.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: `Le fichier "${f.originalName || f.name || 'sélectionné'}" n'a pas d'URL de stockage valide. Veuillez le téléverser à nouveau.`,
          },
          { status: 400 }
        )
      }
    }

    const maxAllowedFiles = assignment.maxFiles || 5
    if (totalFilesCount > maxAllowedFiles) {
      return NextResponse.json(
        { success: false, error: `Vous ne pouvez pas transmettre plus de ${maxAllowedFiles} fichier(s).` },
        { status: 400 }
      )
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

    // Save pre-uploaded files metadata in SubmissionFile table
    for (const f of preUploadedFiles) {
      await prisma.submissionFile.create({
        data: {
          submissionId,
          name: f.name || f.originalName,
          originalName: f.originalName,
          size: f.size || 0,
          mimeType: f.mimeType || 'application/octet-stream',
          url: f.url,
          key: f.key || null,
        },
      })
    }

    // Process direct FormData uploads (legacy / fallback)
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

    revalidatePath('/', 'layout')

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
