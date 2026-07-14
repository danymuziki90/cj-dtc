import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── POST /api/sessions/form-templates/[id]/apply ──────────────────────────
// Applique un template à une session : copie toutes ses questions vers la session cible
// body: { targetSessionId }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = parseInt(id)
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Template ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { targetSessionId, replaceExisting } = body

    if (!targetSessionId) {
      return NextResponse.json({ error: 'targetSessionId est requis' }, { status: 400 })
    }

    const sid = parseInt(targetSessionId)

    // Récupère les questions source du template
    const templateQuestions = await prisma.sessionFormQuestion.findMany({
      where: { templateId },
      orderBy: { order: 'asc' },
    })

    if (templateQuestions.length === 0) {
      return NextResponse.json({ error: 'Ce modèle ne contient aucune question' }, { status: 400 })
    }

    if (replaceExisting) {
      // Supprime les questions existantes de la session cible
      await prisma.sessionFormQuestion.deleteMany({ where: { sessionId: sid } })
    }

    // Récupère le dernier ordre de la session cible pour concaténer
    const lastQ = await prisma.sessionFormQuestion.findFirst({
      where: { sessionId: sid },
      orderBy: { order: 'desc' },
    })
    const baseOrder = (lastQ?.order ?? -1) + 1

    // Crée les nouvelles questions dans la session cible
    await prisma.sessionFormQuestion.createMany({
      data: templateQuestions.map((q, i) => ({
        sessionId: sid,
        templateId,
        label: q.label,
        type: q.type,
        helpText: q.helpText,
        required: q.required,
        order: baseOrder + i,
        options: q.options,
        fileTypes: q.fileTypes,
      })),
    })

    const created = await prisma.sessionFormQuestion.findMany({
      where: { sessionId: sid },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, questions: created }, { status: 201 })
  } catch (err: any) {
    console.error('POST apply template error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'application du modèle' }, { status: 500 })
  }
}
