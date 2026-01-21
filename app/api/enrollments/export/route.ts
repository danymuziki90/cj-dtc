import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const formationId = searchParams.get('formationId')
    const paymentStatus = searchParams.get('paymentStatus')
    const startDateFrom = searchParams.get('startDateFrom')
    const startDateTo = searchParams.get('startDateTo')
    const search = searchParams.get('search')

    const where: any = {}
    if (status) where.status = status
    if (formationId) where.formationId = parseInt(formationId)
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (startDateFrom || startDateTo) {
      where.startDate = {}
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom)
      if (startDateTo) where.startDate.lte = new Date(startDateTo)
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        formation: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filtrer par recherche si fourni
    let filteredEnrollments = enrollments
    if (search) {
      const searchLower = search.toLowerCase()
      filteredEnrollments = enrollments.filter(e =>
        e.firstName.toLowerCase().includes(searchLower) ||
        e.lastName.toLowerCase().includes(searchLower) ||
        e.email.toLowerCase().includes(searchLower) ||
        e.formation.title.toLowerCase().includes(searchLower)
      )
    }

    if (format === 'csv') {
      // Générer CSV
      const headers = [
        'ID',
        'Prénom',
        'Nom',
        'Email',
        'Téléphone',
        'Adresse',
        'Formation',
        'Date de début',
        'Statut',
        'Statut paiement',
        'Montant total',
        'Montant payé',
        'Date inscription'
      ]

      const rows = filteredEnrollments.map(e => [
        e.id.toString(),
        e.firstName,
        e.lastName,
        e.email,
        e.phone || '',
        e.address || '',
        e.formation.title,
        new Date(e.startDate).toLocaleDateString('fr-FR'),
        e.status,
        e.paymentStatus,
        e.totalAmount.toString(),
        e.paidAmount.toString(),
        new Date(e.createdAt).toLocaleDateString('fr-FR')
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscriptions_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Générer Excel (format simple CSV avec extension .xlsx pour compatibilité)
      // Pour une vraie génération Excel, utiliser une bibliothèque comme exceljs
      const headers = [
        'ID',
        'Prénom',
        'Nom',
        'Email',
        'Téléphone',
        'Adresse',
        'Formation',
        'Date de début',
        'Statut',
        'Statut paiement',
        'Montant total',
        'Montant payé',
        'Date inscription'
      ]

      const rows = filteredEnrollments.map(e => [
        e.id.toString(),
        e.firstName,
        e.lastName,
        e.email,
        e.phone || '',
        e.address || '',
        e.formation.title,
        new Date(e.startDate).toLocaleDateString('fr-FR'),
        e.status,
        e.paymentStatus,
        e.totalAmount.toString(),
        e.paidAmount.toString(),
        new Date(e.createdAt).toLocaleDateString('fr-FR')
      ])

      // Format TSV pour Excel
      const tsvContent = [
        headers.join('\t'),
        ...rows.map(row => row.join('\t'))
      ].join('\n')

      return new NextResponse(tsvContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="inscriptions_${new Date().toISOString().split('T')[0]}.xls"`
        }
      })
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'export:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    )
  }
}
