import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { parseSessionMetadata } from '@/lib/sessions/metadata'

function getSessionHours(startDate?: Date | null, endDate?: Date | null, metadata?: string | null) {
  if (!startDate || !endDate) return 0

  const parsed = parseSessionMetadata(metadata)
  const durationLabel = parsed.metadata.durationLabel || ''
  const durationMatch = durationLabel.match(/(\d+(?:[.,]\d+)?)\s*(h|heure|heures)/i)
  if (durationMatch) {
    const value = Number(durationMatch[1].replace(',', '.'))
    if (!Number.isNaN(value) && value > 0) return value
  }

  const raw = (endDate.getTime() - startDate.getTime()) / 3600000
  return raw > 0 ? Math.round(raw * 10) / 10 : 0
}

function resolveCourseType(format?: string | null, hasExerciseResource = false) {
  if (hasExerciseResource) return 'assignment'
  if (format === 'distanciel' || format === 'hybride') return 'video'
  return 'text'
}

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: auth.student.email,
      status: {
        notIn: ['rejected', 'cancelled'],
      },
    },
    orderBy: { startDate: 'asc' },
    include: {
      formation: {
        select: {
          id: true,
          title: true,
          description: true,
          categorie: true,
          objectifs: true,
          modules: true,
        },
      },
      session: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          location: true,
          format: true,
          description: true,
          prerequisites: true,
        },
      },
    },
  })

  const formationIds = Array.from(new Set(enrollments.map((item) => item.formationId)))
  const sessionIds = Array.from(new Set(enrollments.map((item) => item.sessionId).filter((value): value is number => Boolean(value))))

  const documents = formationIds.length || sessionIds.length
    ? await prisma.document.findMany({
        where: {
          category: {
            not: 'certificate_template',
          },
          OR: [
            ...(formationIds.length ? [{ formationId: { in: formationIds } }] : []),
            ...(sessionIds.length ? [{ sessionId: { in: sessionIds } }] : []),
          ],
        },
        select: {
          id: true,
          formationId: true,
          sessionId: true,
          category: true,
        },
      })
    : []

  const courses = enrollments.map((enrollment, index) => {
    const relatedDocuments = documents.filter(
      (document) => document.formationId === enrollment.formationId || document.sessionId === enrollment.sessionId,
    )
    const hasExerciseResource = relatedDocuments.some((document) => document.category === 'exercise')
    const hours = getSessionHours(enrollment.session?.startDate, enrollment.session?.endDate, enrollment.session?.prerequisites)
    const contentParts = [
      enrollment.formation.description,
      enrollment.formation.objectifs,
      enrollment.formation.modules,
      enrollment.session?.description,
    ].filter(Boolean)

    return {
      id: enrollment.id,
      title: enrollment.formation.title,
      description: enrollment.session?.description || enrollment.formation.description,
      content: contentParts.join('\n\n') || `Programme ${enrollment.formation.title}`,
      type: resolveCourseType(enrollment.session?.format, hasExerciseResource),
      formationId: enrollment.formation.id,
      formation: {
        title: enrollment.formation.title,
        categorie: enrollment.formation.categorie,
      },
      order: index + 1,
      duration: hours,
      videoUrl: null,
      createdAt: enrollment.createdAt.toISOString(),
      updatedAt: enrollment.updatedAt.toISOString(),
      sessionId: enrollment.session?.id || null,
      startDate: enrollment.session?.startDate?.toISOString() || null,
      endDate: enrollment.session?.endDate?.toISOString() || null,
      startTime: enrollment.session?.startTime || null,
      endTime: enrollment.session?.endTime || null,
      location: enrollment.session?.location || null,
      format: enrollment.session?.format || null,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      resourcesCount: relatedDocuments.length,
    }
  })

  return NextResponse.json(courses)
}
