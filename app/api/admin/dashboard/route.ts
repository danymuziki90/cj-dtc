import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Données mockées pour le dashboard admin
    const stats = {
      totalStudents: 8500,
      activeStudents: 7200,
      totalFormations: 15,
      totalInscriptions: 450,
      pendingInscriptions: 12,
      totalAssignments: 280,
      pendingCorrections: 8,
      totalExams: 45,
      scheduledExams: 3,
      totalCertificates: 3200,
      recentActivity: [
        {
          type: 'inscription',
          title: 'Nouvelle inscription - IOP',
          student: 'Marie Dupont',
          date: 'Il y a 2 heures',
          status: 'pending'
        },
        {
          type: 'assignment',
          title: 'TP Marketing Digital soumis',
          student: 'Jean Martin',
          date: 'Il y a 4 heures',
          status: 'completed'
        },
        {
          type: 'exam',
          title: 'Examen IOP programmé',
          student: 'Sophie Bernard',
          date: 'Il y a 6 heures',
          status: 'pending'
        },
        {
          type: 'certificate',
          title: 'Certificat généré',
          student: 'Pierre Dubois',
          date: 'Il y a 1 jour',
          status: 'completed'
        }
      ],
      monthlyStats: [
        {
          month: 'Janvier 2025',
          students: 8500,
          inscriptions: 120,
          certificates: 85
        },
        {
          month: 'Février 2025',
          students: 8200,
          inscriptions: 95,
          certificates: 78
        },
        {
          month: 'Mars 2025',
          students: 8800,
          inscriptions: 135,
          certificates: 92
        },
        {
          month: 'Avril 2025',
          students: 7200,
          inscriptions: 450,
          certificates: 120
        }
      ]
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur API dashboard admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
