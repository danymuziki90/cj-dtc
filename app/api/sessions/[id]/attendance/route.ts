import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = "nodejs"

// POST /api/sessions/[id]/attendance - Enregistrer les présences
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)
    const { date, attendance } = await req.json()

    if (!date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: 'Date et liste de présences requises' },
        { status: 400 }
      )
    }

    // Enregistrer les présences
    const attendanceRecords = []
    for (const item of attendance) {
      const attendanceRecord = await prisma.attendance.upsert({
        where: {
          sessionId_enrollmentId_date: {
            sessionId,
            enrollmentId: item.participantId,
            date: new Date(date)
          }
        },
        update: {
          status: item.status,
          notes: item.notes || null
        },
        create: {
          sessionId,
          enrollmentId: item.participantId,
          date: new Date(date),
          status: item.status,
          notes: item.notes || null
        }
      })
      attendanceRecords.push(attendanceRecord)
    }

    return NextResponse.json({
      message: 'Présences enregistrées',
      sessionId,
      date,
      attendanceCount: attendanceRecords.length,
      records: attendanceRecords
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement des présences:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement des présences' },
      { status: 500 }
    )
  }
}

// GET /api/sessions/[id]/attendance - Récupérer les présences
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)
    const { searchParams } = req.nextUrl
    const date = searchParams.get('date')

    const where: any = {
      sessionId
    }
    if (date) {
      where.date = new Date(date)
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        enrollment: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(attendances)
  } catch (error: any) {
    console.error('Erreur lors de la récupération des présences:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des présences' },
      { status: 500 }
    )
  }
}
