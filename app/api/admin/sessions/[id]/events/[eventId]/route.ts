import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id, eventId } = await params
    const sessionId = parseInt(id)
    const evId = parseInt(eventId)
    if (isNaN(sessionId) || isNaN(evId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, date, startTime, endTime, type, location } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (date !== undefined) updateData.date = new Date(date)
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (type !== undefined) updateData.type = type
    if (location !== undefined) updateData.location = location

    const updated = await prisma.sessionEvent.update({
      where: { id: evId },
      data: updateData
    })

    // Write audit log
    await writeAdminAuditLog({
      request,
      adminUsername: session.user.email || 'Admin',
      action: 'UPDATE_SESSION_EVENT',
      targetType: 'SessionEvent',
      targetId: String(updated.id),
      targetLabel: updated.title,
      summary: `Mise à jour de l'événement '${updated.title}' pour la session ID ${sessionId}`,
      metadata: { eventId: updated.id, sessionId }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error PUT /api/admin/sessions/[id]/events/[eventId]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id, eventId } = await params
    const sessionId = parseInt(id)
    const evId = parseInt(eventId)
    if (isNaN(sessionId) || isNaN(evId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const event = await prisma.sessionEvent.findUnique({
      where: { id: evId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    await prisma.sessionEvent.delete({
      where: { id: evId }
    })

    // Write audit log
    await writeAdminAuditLog({
      request,
      adminUsername: session.user.email || 'Admin',
      action: 'DELETE_SESSION_EVENT',
      targetType: 'SessionEvent',
      targetId: String(evId),
      targetLabel: event.title,
      summary: `Suppression de l'événement '${event.title}' pour la session ID ${sessionId}`,
      metadata: { eventId: evId, sessionId }
    })

    return NextResponse.json({ message: 'Événement supprimé avec succès' })
  } catch (error) {
    console.error('Error DELETE /api/admin/sessions/[id]/events/[eventId]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
