import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'

// ── GET — Liste admin de tous les témoignages (tous statuts) ──────────────────

export async function GET(request: NextRequest) {
  // Authentification admin obligatoire
  const auth = await verifyAdminToken(request)
  if (auth.error) return auth.error

  if (!process.env.DATABASE_URL) {
    console.warn('[API admin/testimonials GET] DATABASE_URL manquante')
    return NextResponse.json(
      { error: 'DATABASE_URL non configurée.' },
      { status: 503 }
    )
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Formation: {
          select: {
            id: true,
            title: true,
          },
        },
        TrainingSession: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    })

    // Sérialisation compatible avec l'interface admin Testimonial
    const result = testimonials.map((t) => ({
      id: t.id,
      studentId: t.studentId,
      student: t.Student
        ? {
            id: t.Student.id,
            firstName: t.Student.firstName,
            lastName: t.Student.lastName,
            email: t.Student.email,
          }
        : null,
      formationId: t.formationId ?? null,
      formation: t.Formation
        ? { id: t.Formation.id, title: t.Formation.title }
        : null,
      sessionId: t.sessionId ?? null,
      session: t.TrainingSession
        ? {
            id: t.TrainingSession.id,
            startDate: t.TrainingSession.startDate.toISOString(),
            endDate: t.TrainingSession.endDate
              ? t.TrainingSession.endDate.toISOString()
              : null,
          }
        : null,
      rating: t.rating,
      title: t.title ?? null,
      content: t.content,
      status: t.status,
      adminReply: t.adminReply ?? null,
      adminNote: t.adminNote ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[API admin/testimonials GET] Erreur Prisma :', message)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des témoignages.' },
      { status: 500 }
    )
  }
}
