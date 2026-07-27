import { prisma } from '@/lib/prisma'

/**
 * Single source of truth for fetching student assignments.
 * Used by both:
 *  - GET /api/student/assignments (Espace Étudiant -> Travaux page)
 *  - GET /api/student/system/dashboard (Espace Étudiant -> Dashboard)
 */
export async function fetchStudentAssignmentsData(studentId: string, studentEmail: string) {
  // 1. Get all active enrollments for this student (not rejected, cancelled, or refused)
  const activeEnrollments = await prisma.enrollment.findMany({
    where: {
      OR: [
        { studentId },
        { email: { equals: studentEmail, mode: 'insensitive' } },
      ],
      status: {
        notIn: ['rejected', 'cancelled', 'REJECTED', 'CANCELLED', 'annulee', 'rejete', 'refuse'],
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
    return []
  }

  // 2. Fetch published assignments for enrolled sessions or formation-level assignments
  const rawAssignments = await prisma.assignment.findMany({
    where: {
      published: true,
      status: { notIn: ['brouillon', 'archive', 'draft', 'archived'] },
      OR: [
        ...(sessionIdsList.length ? [{ sessionId: { in: sessionIdsList } }] : []),
        ...(formationIdsList.length ? [{ formationId: { in: formationIdsList }, sessionId: null }] : []),
      ],
    },
    orderBy: { deadline: 'asc' },
    include: {
      formation: { select: { id: true, title: true, slug: true } },
      session: { select: { id: true, startDate: true, endDate: true, location: true, format: true } },
      files: true,
      submissions: {
        where: { studentId },
        orderBy: { submittedAt: 'desc' },
        include: { files: true },
      },
    },
  })

  // 3. Standardize properties
  return rawAssignments.map((a) => {
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
      publishDate: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
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
        gradedBy: s.gradedBy || null,
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
}
