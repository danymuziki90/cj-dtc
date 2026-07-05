import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import * as path from 'path'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { writeAdminAuditLog } from '@/lib/admin/audit'

export const runtime = 'nodejs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const resolvedParams = await params
    const documentId = Number(resolvedParams.id)

    if (!Number.isFinite(documentId)) {
      return NextResponse.json({ error: 'ID de document invalide' }, { status: 400 })
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        filePath: true,
        category: true,
        formationId: true,
        sessionId: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document non trouve' }, { status: 404 })
    }

    try {
      const filePath = path.join(process.cwd(), 'public', document.filePath)
      await fs.unlink(filePath)
    } catch (fileError) {
      console.warn('Erreur lors de la suppression du fichier:', fileError)
    }

    await prisma.document.delete({
      where: { id: documentId },
    })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'document.delete',
      targetType: 'document',
      targetId: String(document.id),
      targetLabel: document.title,
      summary: `Document supprime: ${document.title}`,
      metadata: {
        category: document.category,
        formationId: document.formationId,
        sessionId: document.sessionId,
      },
    })

    return NextResponse.json({ message: 'Document supprime avec succes' })
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
