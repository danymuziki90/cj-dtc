export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { deleteFromR2 } from '@/lib/r2'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const assignmentId = parseInt(id, 10)
  const fileIdNum = parseInt(fileId, 10)

  if (isNaN(assignmentId) || isNaN(fileIdNum)) {
    return NextResponse.json({ success: false, error: 'Identifiants invalides' }, { status: 400 })
  }

  try {
    const file = await prisma.assignmentFile.findFirst({
      where: {
        id: fileIdNum,
        assignmentId,
      },
    })

    if (!file) {
      return NextResponse.json({ success: false, error: 'Fichier consigne introuvable' }, { status: 404 })
    }

    // Delete file from Cloudflare R2
    if (file.key || file.url) {
      await deleteFromR2(file.key || file.url)
    }

    // Delete file record from DB
    await prisma.assignmentFile.delete({
      where: { id: fileIdNum },
    })

    return NextResponse.json({ success: true, message: 'Fichier consigne supprimé' })
  } catch (error: any) {
    console.error('[Delete Assignment File Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    )
  }
}
