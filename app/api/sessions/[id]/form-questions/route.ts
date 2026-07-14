import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── helpers ────────────────────────────────────────────────────────────────
function parseId(raw: string, name = 'ID') {
  const n = parseInt(raw)
  if (isNaN(n)) throw new Error(`${name} invalide`)
  return n
}

// ── GET /api/sessions/[id]/form-questions ──────────────────────────────────
// Récupère toutes les questions d'une session, triées par ordre
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseId(id, 'Session ID')

    const questions = await prisma.sessionFormQuestion.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(questions)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

// ── POST /api/sessions/[id]/form-questions ─────────────────────────────────
// Crée une nouvelle question pour la session
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseId(id, 'Session ID')
    const body = await req.json()

    const { label, type, helpText, required, options, fileTypes } = body

    if (!label?.trim()) {
      return NextResponse.json({ error: 'Le libellé est requis' }, { status: 400 })
    }

    const validTypes = [
      'text_short', 'text_long', 'number', 'date',
      'select', 'radio', 'checkbox', 'yes_no', 'file_upload',
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Type de question invalide' }, { status: 400 })
    }

    // Calcul du prochain ordre
    const lastQuestion = await prisma.sessionFormQuestion.findFirst({
      where: { sessionId },
      orderBy: { order: 'desc' },
    })
    const nextOrder = (lastQuestion?.order ?? -1) + 1

    // Sérialisation des options/fileTypes en JSON string
    const optionsJson =
      Array.isArray(options) && options.length > 0 ? JSON.stringify(options) : null
    const fileTypesJson =
      Array.isArray(fileTypes) && fileTypes.length > 0 ? JSON.stringify(fileTypes) : null

    const question = await prisma.sessionFormQuestion.create({
      data: {
        sessionId,
        label: label.trim(),
        type,
        helpText: helpText?.trim() || null,
        required: Boolean(required),
        order: nextOrder,
        options: optionsJson,
        fileTypes: fileTypesJson,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (err: any) {
    console.error('POST form-question error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── PATCH /api/sessions/[id]/form-questions ────────────────────────────────
// Réordonne les questions (body: [{ id, order }])
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseId(id, 'Session ID')
    const body: { id: number; order: number }[] = await req.json()

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Format invalide : tableau attendu' }, { status: 400 })
    }

    // Mise à jour en transaction pour garantir l'atomicité
    await prisma.$transaction(
      body.map(({ id: qid, order }) =>
        prisma.sessionFormQuestion.update({
          where: { id: qid, sessionId },
          data: { order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('PATCH form-questions reorder error:', err)
    return NextResponse.json({ error: 'Erreur lors du réordonnancement' }, { status: 500 })
  }
}
