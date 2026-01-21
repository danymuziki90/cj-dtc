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

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month'

    // Calculer les dates selon la période
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Récupérer les statistiques
    const [
      totalStudents,
      totalFormations,
      totalInscriptions,
      pendingInscriptions,
      completedInscriptions,
      totalRevenue
    ] = await Promise.all([
      // Total des étudiants uniques
      prisma.enrollment.groupBy({
        by: ['email'],
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }).then(result => result.length),
      
      // Total des formations
      prisma.formation.count({
        where: {
          statut: 'publie'
        }
      }),
      
      // Total des inscriptions
      prisma.enrollment.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Inscriptions en attente
      prisma.enrollment.count({
        where: {
          status: 'pending',
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Inscriptions terminées
      prisma.enrollment.count({
        where: {
          status: 'completed',
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Revenu total (simulation)
      prisma.enrollment.aggregate({
        where: {
          status: 'completed',
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          totalAmount: true
        }
      })
    ])

    // Calculer les variations par rapport à la période précédente
    const previousStartDate = new Date(startDate)
    switch (period) {
      case 'day':
        previousStartDate.setDate(previousStartDate.getDate() - 1)
        break
      case 'week':
        previousStartDate.setDate(previousStartDate.getDate() - 7)
        break
      case 'month':
        previousStartDate.setMonth(previousStartDate.getMonth() - 1)
        break
      case 'quarter':
        previousStartDate.setMonth(previousStartDate.getMonth() - 3)
        break
      case 'year':
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1)
        break
    }

    const previousInscriptions = await prisma.enrollment.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      }
    })

    const inscriptionChange = totalInscriptions > 0 && previousInscriptions > 0 
      ? ((totalInscriptions - previousInscriptions) / previousInscriptions) * 100 
      : 0

    const stats = [
      {
        title: 'Nouveaux étudiants',
        value: totalStudents,
        change: inscriptionChange,
        changeType: inscriptionChange >= 0 ? 'increase' as const : 'decrease' as const,
        icon: '👥',
        color: 'bg-blue-100'
      },
      {
        title: 'Formations actives',
        value: totalFormations,
        icon: '📚',
        color: 'bg-green-100'
      },
      {
        title: 'Total inscriptions',
        value: totalInscriptions,
        change: inscriptionChange,
        changeType: inscriptionChange >= 0 ? 'increase' as const : 'decrease' as const,
        icon: '📝',
        color: 'bg-purple-100'
      },
      {
        title: 'Revenu total',
        value: `${totalRevenue._sum.totalAmount || 0}$`,
        icon: '💰',
        color: 'bg-orange-100'
      }
    ]

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
