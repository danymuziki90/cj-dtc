import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── GET /api/sessions/form-templates ──────────────────────────────────────
// Liste tous les modèles de formulaire
export async function GET() {
  try {
    const templates = await prisma.sessionFormTemplate.findMany({
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Désérialise les options JSON
    const parsed = templates.map((t) => ({
      ...t,
      questions: t.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
        fileTypes: q.fileTypes ? JSON.parse(q.fileTypes) : [],
      })),
    }))

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('GET templates error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── POST /api/sessions/form-templates ─────────────────────────────────────
// Crée un template depuis les questions d'une session existante
// body: { name, description, sessionId }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, sessionId } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom du modèle est requis' }, { status: 400 })
    }

    // Crée d'abord le template vide
    const template = await prisma.sessionFormTemplate.create({
      data: { name: name.trim(), description: description?.trim() || null },
    })

    // Si un sessionId est fourni, copie les questions de la session vers le template
    if (sessionId) {
      const sourceQuestions = await prisma.sessionFormQuestion.findMany({
        where: { sessionId: parseInt(sessionId) },
        orderBy: { order: 'asc' },
      })

      if (sourceQuestions.length > 0) {
        await prisma.sessionFormQuestion.createMany({
          data: sourceQuestions.map((q, i) => ({
            sessionId: parseInt(sessionId), // liée à la session source (sera réutilisée via apply)
            templateId: template.id,
            label: q.label,
            type: q.type,
            helpText: q.helpText,
            required: q.required,
            order: i,
            options: q.options,
            fileTypes: q.fileTypes,
          })),
        })
      }
    }

    const full = await prisma.sessionFormTemplate.findUnique({
      where: { id: template.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json(full, { status: 201 })
  } catch (err: any) {
    console.error('POST template error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
