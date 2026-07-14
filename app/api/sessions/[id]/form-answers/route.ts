import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── Helper : désérialise une réponse brute pour l'exposer proprement ────────
function serializeQuestion(q: any) {
  return {
    ...q,
    options: q.options ? JSON.parse(q.options) : [],
    fileTypes: q.fileTypes ? JSON.parse(q.fileTypes) : [],
  }
}

// ── GET /api/sessions/[id]/form-answers ────────────────────────────────────
// Admin uniquement — liste toutes les réponses pour la session
// ?enrollmentId=... pour filtrer par étudiant
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id)
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Session ID invalide' }, { status: 400 })
    }

    const url = new URL(req.url, 'http://localhost')
    const enrollmentIdParam = url.searchParams.get('enrollmentId')

    // Récupère les questions de la session
    const questions = await prisma.sessionFormQuestion.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' },
    })

    const answersWhere: any = {
      question: { sessionId },
    }
    if (enrollmentIdParam) {
      answersWhere.enrollmentId = parseInt(enrollmentIdParam)
    }

    const answers = await prisma.sessionFormAnswer.findMany({
      where: answersWhere,
      include: {
        question: true,
        enrollment: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ enrollmentId: 'asc' }, { question: { order: 'asc' } }],
    })

    return NextResponse.json({ questions: questions.map(serializeQuestion), answers })
  } catch (err: any) {
    console.error('GET form-answers error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── POST /api/sessions/[id]/form-answers ───────────────────────────────────
// Public — soumet les réponses après la création de l'enrollment
// body: { enrollmentId, answers: [{ questionId, textValue?, jsonValue?, fileUrl?, fileName? }] }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id)
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Session ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { enrollmentId, answers } = body

    if (!enrollmentId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'enrollmentId et answers sont requis' }, { status: 400 })
    }

    // Vérifie que l'enrollment existe et appartient bien à cette session
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: parseInt(enrollmentId), sessionId },
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Inscription introuvable pour cette session' }, { status: 404 })
    }

    // Charge les questions obligatoires de la session
    const questions = await prisma.sessionFormQuestion.findMany({
      where: { sessionId },
    })

    // Validation : toutes les questions obligatoires doivent avoir une réponse
    const requiredQuestions = questions.filter((q) => q.required)
    const answersMap = new Map(answers.map((a: any) => [a.questionId, a]))

    const missingRequired = requiredQuestions.filter((q) => {
      const answer = answersMap.get(q.id)
      if (!answer) return true
      const hasValue =
        answer.textValue?.trim() ||
        (Array.isArray(answer.jsonValue)
          ? answer.jsonValue.length > 0
          : answer.jsonValue?.trim()) ||
        answer.fileUrl
      return !hasValue
    })

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: 'Champs obligatoires manquants',
          missing: missingRequired.map((q) => ({ id: q.id, label: q.label })),
        },
        { status: 422 }
      )
    }

    // Upsert les réponses (si l'étudiant re-soumet)
    const saved = await prisma.$transaction(
      answers.map((a: any) =>
        prisma.sessionFormAnswer.upsert({
          where: { questionId_enrollmentId: { questionId: a.questionId, enrollmentId: parseInt(enrollmentId) } },
          create: {
            questionId: a.questionId,
            enrollmentId: parseInt(enrollmentId),
            textValue: a.textValue ?? null,
            jsonValue: Array.isArray(a.jsonValue) ? JSON.stringify(a.jsonValue) : a.jsonValue ?? null,
            fileUrl: a.fileUrl ?? null,
            fileName: a.fileName ?? null,
          },
          update: {
            textValue: a.textValue ?? null,
            jsonValue: Array.isArray(a.jsonValue) ? JSON.stringify(a.jsonValue) : a.jsonValue ?? null,
            fileUrl: a.fileUrl ?? null,
            fileName: a.fileName ?? null,
          },
        })
      )
    )

    return NextResponse.json({ success: true, count: saved.length }, { status: 201 })
  } catch (err: any) {
    console.error('POST form-answers error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement des réponses' }, { status: 500 })
  }
}
