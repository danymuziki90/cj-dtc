import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── PUT /api/sessions/[id]/form-questions/[qid] ────────────────────────────
// Met à jour une question existante
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const { id, qid } = await params
    const sessionId = parseInt(id)
    const questionId = parseInt(qid)

    if (isNaN(sessionId) || isNaN(questionId)) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 })
    }

    const body = await req.json()
    const { label, type, helpText, required, options, fileTypes } = body

    if (label !== undefined && !label?.trim()) {
      return NextResponse.json({ error: 'Le libellé ne peut pas être vide' }, { status: 400 })
    }

    const validTypes = [
      'text_short', 'text_long', 'number', 'date',
      'select', 'radio', 'checkbox', 'yes_no', 'file_upload',
    ]
    if (type !== undefined && !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Type de question invalide' }, { status: 400 })
    }

    const optionsJson =
      options !== undefined
        ? (Array.isArray(options) && options.length > 0 ? JSON.stringify(options) : null)
        : undefined
    const fileTypesJson =
      fileTypes !== undefined
        ? (Array.isArray(fileTypes) && fileTypes.length > 0 ? JSON.stringify(fileTypes) : null)
        : undefined

    const updated = await prisma.sessionFormQuestion.update({
      where: { id: questionId, sessionId },
      data: {
        ...(label !== undefined && { label: label.trim() }),
        ...(type !== undefined && { type }),
        ...(helpText !== undefined && { helpText: helpText?.trim() || null }),
        ...(required !== undefined && { required: Boolean(required) }),
        ...(optionsJson !== undefined && { options: optionsJson }),
        ...(fileTypesJson !== undefined && { fileTypes: fileTypesJson }),
      },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('PUT form-question error:', err)
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Question introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── DELETE /api/sessions/[id]/form-questions/[qid] ─────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const { id, qid } = await params
    const sessionId = parseInt(id)
    const questionId = parseInt(qid)

    if (isNaN(sessionId) || isNaN(questionId)) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 })
    }

    await prisma.sessionFormQuestion.delete({
      where: { id: questionId, sessionId },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE form-question error:', err)
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Question introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
