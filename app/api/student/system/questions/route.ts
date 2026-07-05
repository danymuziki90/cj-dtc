import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import {
  getStudentQuestions,
  parseEnrollmentNotes,
  serializeEnrollmentNotes,
  type StudentQuestionEntry,
} from '@/lib/student/enrollment-notes'

const createQuestionSchema = z.object({
  enrollmentId: z.number().int().positive().optional(),
  message: z.string().min(5).max(2000),
})

function mapQuestion(
  question: StudentQuestionEntry,
  enrollment: { id: number; formation: { title: string }; sessionId: number | null }
) {
  return {
    ...question,
    enrollmentId: enrollment.id,
    formationTitle: enrollment.formation.title,
    sessionId: enrollment.sessionId,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const enrollments = await prisma.enrollment.findMany({
    where: { email: auth.student.email },
    orderBy: { createdAt: 'desc' },
    include: {
      formation: {
        select: { title: true },
      },
    },
  })

  const questions = enrollments
    .flatMap((enrollment) => {
      const notes = parseEnrollmentNotes(enrollment.notes)
      return getStudentQuestions(notes).map((item) => mapQuestion(item, enrollment))
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({ questions })
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const parsed = createQuestionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Donnees invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const enrollment = parsed.data.enrollmentId
      ? await prisma.enrollment.findFirst({
          where: {
            id: parsed.data.enrollmentId,
            email: auth.student.email,
          },
          include: {
            formation: { select: { title: true } },
          },
        })
      : await prisma.enrollment.findFirst({
          where: { email: auth.student.email },
          orderBy: { createdAt: 'desc' },
          include: {
            formation: { select: { title: true } },
          },
        })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Aucune inscription n'est associee a ce compte." },
        { status: 404 }
      )
    }

    const notes = parseEnrollmentNotes(enrollment.notes)
    const currentQuestions = getStudentQuestions(notes)
    const newQuestion: StudentQuestionEntry = {
      id: randomUUID(),
      message: parsed.data.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'open',
      adminReply: null,
      adminReplyAt: null,
    }

    const nextNotes = {
      ...notes,
      studentQuestions: [newQuestion, ...currentQuestions].slice(0, 100),
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        notes: serializeEnrollmentNotes(nextNotes),
      },
    })

    return NextResponse.json(
      {
        success: true,
        question: mapQuestion(newQuestion, enrollment),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Student question creation error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
