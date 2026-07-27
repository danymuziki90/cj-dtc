import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const formationId = searchParams.get('formationId')

    const where: any = {}
    if (startDate) where.startDate = { gte: new Date(startDate) }
    if (endDate) where.endDate = { lte: new Date(endDate) }
    if (formationId) where.formationId = parseInt(formationId)

    const sessions = await prisma.trainingSession.findMany({
      where,
      include: {
        formation: {
          select: {
            title: true
          }
        },
        enrollments: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    const headers = [
      'ID',
      'Formation',
      'Date début',
      'Date fin',
      'Heure début',
      'Heure fin',
      'Lieu',
      'Format',
      'Participants actuels',
      'Capacité max',
      'Prix',
      'Statut',
      'Participants',
    ]

    const rows = sessions.map((session) => [
      session.id ? String(session.id) : '',
      session.formation?.title || 'Formation',
      session.startDate ? new Date(session.startDate).toLocaleDateString('fr-FR') : '',
      session.endDate ? new Date(session.endDate).toLocaleDateString('fr-FR') : '',
      session.startTime || '',
      session.endTime || '',
      session.location || '',
      session.format || '',
      session.currentParticipants != null ? String(session.currentParticipants) : '0',
      session.maxParticipants != null ? String(session.maxParticipants) : '0',
      '0',
      session.status || '',
      (session.enrollments || []).map((e) => `${e.firstName || ''} ${e.lastName || ''} (${e.email || ''})`).join('; '),
    ])

    const BOM = '\uFEFF'

    if (format === 'csv') {
      const csvContent = BOM + [
        headers.join(';'),
        ...rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(';')),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="planning_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      const tsvContent = BOM + [
        headers.join('\t'),
        ...rows.map((row) => row.map((cell) => String(cell || '').replace(/[\t\r\n]/g, ' ')).join('\t')),
      ].join('\n')

      return new NextResponse(tsvContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="planning_${new Date().toISOString().split('T')[0]}.xls"`,
        },
      })
    }
  } catch (error: any) {
    console.error("Erreur lors de l'export du planning:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    )
  }
}
