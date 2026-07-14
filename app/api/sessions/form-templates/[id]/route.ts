import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── DELETE /api/sessions/form-templates/[id] ──────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const templateId = parseInt(id)
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    await prisma.sessionFormTemplate.delete({ where: { id: templateId } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Modèle introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
