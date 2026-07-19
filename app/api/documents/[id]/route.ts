import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireStudent } from '@/lib/auth-portal/guards'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { deleteFromR2, downloadFromR2 } from '@/lib/r2'

export const runtime = 'nodejs'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const documentId = Number((await params).id)
  if (!Number.isFinite(documentId)) return NextResponse.json({ error: 'ID de document invalide' }, { status: 400 })

  const document = await prisma.document.findUnique({ where: { id: documentId } })
  if (!document) return NextResponse.json({ error: 'Document non trouve' }, { status: 404 })

  const adminAuth = await requireAdmin(request)
  if (adminAuth.error) {
    const studentAuth = await requireStudent(request)
    if (studentAuth.error) return studentAuth.error
    if (!document.isPublic || !document.sessionId) return NextResponse.json({ error: 'Acces refuse' }, { status: 403 })
    const enrollment = await prisma.enrollment.findFirst({
      where: { email: studentAuth.student.email, sessionId: document.sessionId, status: { in: ['accepted', 'confirmed', 'completed'] } },
      select: { id: true },
    })
    if (!enrollment) return NextResponse.json({ error: 'Acces refuse' }, { status: 403 })
  }

  try {
    const key = document.filePath.replace(/^\//, '')
    const bytes = await downloadFromR2(key)
    const disposition = request.nextUrl.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment'
    const safeName = document.fileName.replace(/["\\]/g, '_')
    return new NextResponse(new Uint8Array(bytes), { headers: {
      'Content-Type': document.mimeType || 'application/octet-stream',
      'Content-Length': String(bytes.length),
      'Content-Disposition': `${disposition}; filename="${safeName}"`,
      'Cache-Control': 'private, no-store',
    } })
  } catch (error) {
    console.error('Erreur de telechargement du document:', error)
    return NextResponse.json({ error: 'Fichier indisponible' }, { status: 404 })
  }
}

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

export async function PATCH(
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
    })

    if (!document) {
      return NextResponse.json({ error: 'Document non trouve' }, { status: 404 })
    }

    const body = await request.json()
    const title = String(body.title || '').trim()
    const description = body.description !== undefined ? (String(body.description || '').trim() || null) : undefined
    const category = body.category ? String(body.category).trim() : undefined
    const isPublic = body.isPublic !== undefined ? Boolean(body.isPublic) : undefined

    if (body.title && !title) {
      return NextResponse.json({ error: 'Le titre ne peut pas etre vide.' }, { status: 400 })
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category ? { category } : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
      },
    })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'document.update',
      targetType: 'document',
      targetId: String(updatedDocument.id),
      targetLabel: updatedDocument.title,
      summary: `Document mis a jour: ${updatedDocument.title}`,
      metadata: {
        title,
        category,
        isPublic,
      },
    })

    return NextResponse.json(updatedDocument)
  } catch (error: any) {
    console.error('Erreur lors de la mise a jour du document:', error)
    return NextResponse.json({ error: `Erreur interne du serveur : ${error.message || error}` }, { status: 500 })
  }
}
