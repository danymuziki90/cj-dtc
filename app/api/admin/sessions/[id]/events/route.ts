import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeAdminAuditLog } from '@/lib/admin/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const sessionId = parseInt(id)
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 })
    }

    const events = await prisma.sessionEvent.findMany({
      where: { sessionId },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error GET /api/admin/sessions/[id]/events:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const sessionId = parseInt(id)
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, date, startTime, endTime, type, location } = body

    if (!title || !date || !startTime || !endTime || !type) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const event = await prisma.sessionEvent.create({
      data: {
        sessionId,
        title,
        description: description || null,
        date: new Date(date),
        startTime,
        endTime,
        type,
        location: location || null,
      }
    })

    // Write audit log
    await writeAdminAuditLog({
      request,
      adminUsername: session.user.email || 'Admin',
      action: 'CREATE_SESSION_EVENT',
      targetType: 'SessionEvent',
      targetId: String(event.id),
      targetLabel: event.title,
      summary: `Création de l'événement '${event.title}' pour la session ID ${sessionId}`,
      metadata: { eventId: event.id, sessionId }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error POST /api/admin/sessions/[id]/events:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
