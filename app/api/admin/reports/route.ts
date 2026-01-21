import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Simuler des rapports précédents (en réalité, ils viendraient d'une base de données)
    const reports = [
      {
        id: '1',
        title: 'Rapport mensuel - Juin 2025',
        description: 'Analyse complète des inscriptions et performances',
        type: 'inscriptions' as const,
        generatedAt: new Date('2025-06-30').toISOString()
      },
      {
        id: '2',
        title: 'Rapport trimestriel - Q2 2025',
        description: 'Statistiques trimestrielles et tendances',
        type: 'students' as const,
        generatedAt: new Date('2025-06-30').toISOString()
      }
    ]

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Erreur lors du chargement des rapports:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { type, period } = await req.json()

    // Générer le rapport selon le type
    let reportData = {}
    let title = ''
    let description = ''

    switch (type) {
      case 'students':
        title = `Rapport étudiants - ${period}`
        description = 'Liste complète des étudiants et leurs inscriptions'
        reportData = {
          totalStudents: 150,
          activeStudents: 120,
          newStudents: 30,
          averageAge: 25
        }
        break
      case 'formations':
        title = `Rapport formations - ${period}`
        description = 'Performance et popularité des formations'
        reportData = {
          totalFormations: 15,
          activeFormations: 12,
          averageEnrollment: 10,
          topFormations: ['IOP', 'MRH', 'Leadership']
        }
        break
      case 'inscriptions':
        title = `Rapport inscriptions - ${period}`
        description = 'Tendances des inscriptions et conversions'
        reportData = {
          totalInscriptions: 45,
          conversionRate: 75,
          pendingInscriptions: 5,
          completionRate: 85
        }
        break
      case 'revenue':
        title = `Rapport financier - ${period}`
        description = 'Revenus et analyse financière'
        reportData = {
          totalRevenue: 45000,
          averageRevenuePerStudent: 300,
          paymentMethods: ['card', 'bank_transfer', 'cash'],
          growthRate: 15
        }
        break
    }

    const report = {
      id: Date.now().toString(),
      title,
      description,
      type,
      data: reportData,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
