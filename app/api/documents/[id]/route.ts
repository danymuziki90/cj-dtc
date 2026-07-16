import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { deleteFromR2 } from '@/lib/r2'

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
      let r2Key = document.filePath
      if (r2Key.startsWith('http://') || r2Key.startsWith('https://')) {
        try {
          const urlObj = new URL(r2Key)
          r2Key = decodeURIComponent(urlObj.pathname.slice(1))
        } catch (e) {}
      } else if (r2Key.startsWith('/uploads/')) {
        r2Key = r2Key.replace(/^\/uploads\//, '')
      } else {
        r2Key = r2Key.replace(/^\//, '')
      }
      await deleteFromR2(r2Key)
    } catch (fileError) {
      console.warn('Erreur lors de la suppression du fichier sur R2:', fileError)
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
