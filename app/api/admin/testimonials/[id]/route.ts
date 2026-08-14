import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'

const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const
type TestimonialStatus = (typeof VALID_STATUSES)[number]

function parseId(idParam: string): number | null {
  const id = parseInt(idParam, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

// ── PATCH — Modifier statut et/ou réponse admin ───────────────────────────────

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Authentification admin
  const auth = await verifyAdminToken(request)
  if (auth.error) return auth.error

  const { id: idParam } = await context.params
  const id = parseId(idParam)
  if (!id) {
    return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 })
  }

  let body: { status?: unknown; adminReply?: unknown; adminNote?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  // Construire les champs à mettre à jour
  const updateData: {
    status?: TestimonialStatus
    adminReply?: string | null
    adminNote?: string | null
    contentEn?: string | null
  } = {}

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as TestimonialStatus)) {
      return NextResponse.json(
        {
          error: `Statut invalide. Valeurs acceptées : ${VALID_STATUSES.join(', ')}.`,
        },
        { status: 422 }
      )
    }
    updateData.status = body.status as TestimonialStatus
  }

  if (body.adminReply !== undefined) {
    updateData.adminReply =
      typeof body.adminReply === 'string' ? body.adminReply.trim() || null : null
  }

  if (body.adminNote !== undefined) {
    updateData.adminNote =
      typeof body.adminNote === 'string' ? body.adminNote.trim() || null : null
  }

  if ((body as any).contentEn !== undefined) {
    updateData.contentEn =
      typeof (body as any).contentEn === 'string' ? (body as any).contentEn.trim() || null : null
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'Aucun champ à mettre à jour fourni.' },
      { status: 422 }
    )
  }

  try {
    const updated = await prisma.testimonial.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        status: true,
        adminReply: true,
        adminNote: true,
        contentEn: true,
        updatedAt: true,
      },
    })

    console.info(
      `[API admin/testimonials PATCH] Témoignage #${id} mis à jour :`,
      updateData,
      `par admin=${auth.admin?.username ?? 'inconnu'}`
    )

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      adminReply: updated.adminReply ?? null,
      adminNote: updated.adminNote ?? null,
      contentEn: updated.contentEn ?? null,
      updatedAt: updated.updatedAt.toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    // Prisma P2025 = record not found
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: `Témoignage #${id} introuvable.` },
        { status: 404 }
      )
    }
    console.error(`[API admin/testimonials PATCH] Erreur Prisma sur #${id} :`, message)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du témoignage.' },
      { status: 500 }
    )
  }
}

// ── DELETE — Supprimer définitivement un témoignage ───────────────────────────

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Authentification admin
  const auth = await verifyAdminToken(request)
  if (auth.error) return auth.error

  const { id: idParam } = await context.params
  const id = parseId(idParam)
  if (!id) {
    return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 })
  }

  try {
    await prisma.testimonial.delete({
      where: { id },
    })

    console.info(
      `[API admin/testimonials DELETE] Témoignage #${id} supprimé par admin=${auth.admin?.username ?? 'inconnu'}`
    )

    return NextResponse.json({ success: true, deletedId: id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: `Témoignage #${id} introuvable.` },
        { status: 404 }
      )
    }
    console.error(`[API admin/testimonials DELETE] Erreur Prisma sur #${id} :`, message)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du témoignage.' },
      { status: 500 }
    )
  }
}
