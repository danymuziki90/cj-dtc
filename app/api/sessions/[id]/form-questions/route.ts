import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── helpers ────────────────────────────────────────────────────────────────
function parseId(raw: string, name = 'ID') {
  const n = parseInt(raw)
  if (isNaN(n)) throw new Error(`${name} invalide`)
  return n
}

// ── helper : désérialise les champs JSON stockés en string ─────────────────
function serializeQuestion(q: any) {
  return {
    ...q,
    options: q.options ? (() => { try { return JSON.parse(q.options) } catch { return [] } })() : [],
    fileTypes: q.fileTypes ? (() => { try { return JSON.parse(q.fileTypes) } catch { return [] } })() : [],
  }
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

    return NextResponse.json(questions.map(serializeQuestion))
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

// ── PUT /api/sessions/[id]/form-questions ──────────────────────────────────
// Enregistre en lot (batch) toutes les questions d'une session.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseId(id, 'Session ID')
    const body = await req.json()

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Format invalide : tableau attendu' }, { status: 400 })
    }

    // Sécurisation de l'opération en transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Récupérer les questions existantes de la session
      const existing = await tx.sessionFormQuestion.findMany({
        where: { sessionId },
        select: { id: true }
      })
      const existingIds = existing.map(q => q.id)
      const incomingIds = body.filter((q: any) => q.id).map((q: any) => q.id)

      // 2. Identifier et supprimer les questions qui ne sont plus présentes
      const toDelete = existingIds.filter(id => !incomingIds.includes(id))
      if (toDelete.length > 0) {
        await tx.sessionFormQuestion.deleteMany({
          where: { id: { in: toDelete }, sessionId }
        })
      }

      // 3. Upsert des questions entrantes
      const upserted = []
      for (let i = 0; i < body.length; i++) {
        const q = body[i]
        const optionsJson = Array.isArray(q.options) && q.options.length > 0 ? JSON.stringify(q.options) : null
        const fileTypesJson = Array.isArray(q.fileTypes) && q.fileTypes.length > 0 ? JSON.stringify(q.fileTypes) : null

        if (q.id) {
          // Mise à jour
          const updated = await tx.sessionFormQuestion.update({
            where: { id: q.id, sessionId },
            data: {
              label: q.label.trim(),
              type: q.type,
              helpText: q.helpText?.trim() || null,
              required: Boolean(q.required),
              order: i,
              options: optionsJson,
              fileTypes: fileTypesJson,
            }
          })
          upserted.push(updated)
        } else {
          // Création
          const created = await tx.sessionFormQuestion.create({
            data: {
              sessionId,
              label: q.label.trim(),
              type: q.type,
              helpText: q.helpText?.trim() || null,
              required: Boolean(q.required),
              order: i,
              options: optionsJson,
              fileTypes: fileTypesJson,
            }
          })
          upserted.push(created)
        }
      }
      return upserted
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('PUT batch form-questions error:', err)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde des questions' }, { status: 500 })
  }
}

