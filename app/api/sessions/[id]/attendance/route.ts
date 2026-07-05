import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { writeAdminAuditLog } from '@/lib/admin/audit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const resolvedParams = await params
    const sessionId = Number(resolvedParams.id)
    const { date, attendance } = await req.json()

    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 400 })
    }

    if (!date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json({ error: 'Date et liste de presences requises' }, { status: 400 })
    }

    const attendanceRecords = []
    for (const item of attendance) {
      const attendanceRecord = await prisma.attendance.upsert({
        where: {
          sessionId_enrollmentId_date: {
            sessionId,
            enrollmentId: item.participantId,
            date: new Date(date),
          },
        },
        update: {
          status: item.status,
          notes: item.notes || null,
          recordedBy: auth.admin.id,
        },
        create: {
          sessionId,
          enrollmentId: item.participantId,
          date: new Date(date),
          status: item.status,
          notes: item.notes || null,
          recordedBy: auth.admin.id,
        },
      })
      attendanceRecords.push(attendanceRecord)
    }

    await writeAdminAuditLog({
      request: req,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'attendance.upsert',
      targetType: 'session',
      targetId: String(sessionId),
      targetLabel: `Session ${sessionId}`,
      summary: `Feuille de presence enregistree pour la session ${sessionId}.`,
      metadata: {
        attendanceDate: date,
        attendanceCount: attendanceRecords.length,
      },
    })

    return NextResponse.json(
      {
        message: 'Presences enregistrees',
        sessionId,
        date,
        attendanceCount: attendanceRecords.length,
        records: attendanceRecords,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des presences:", error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement des presences" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const resolvedParams = await params
    const sessionId = Number(resolvedParams.id)
    const { searchParams } = req.nextUrl
    const date = searchParams.get('date')

    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 400 })
    }

    const where: { sessionId: number; date?: Date } = { sessionId }
    if (date) {
      where.date = new Date(date)
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        enrollment: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { enrollmentId: 'asc' }],
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Erreur lors de la recuperation des presences:', error)
    return NextResponse.json({ error: 'Erreur lors de la recuperation des presences' }, { status: 500 })
  }
}
