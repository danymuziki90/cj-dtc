import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'STUDENT' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Données mockées pour le dashboard étudiant (totalFormations, completedFormations, certificates, upcomingSessions utilisés par la page espace-etudiants)
    const stats = {
      totalFormations: 5,
      completedFormations: 3,
      certificates: 0,
      upcomingSessions: 0,
      activeFormations: 2,
      pendingAssignments: 5,
      unreadMessages: 2,
      averageGrade: 85,
      nextExam: {
        title: 'Examen Final - IOP',
        date: '25 Janvier 2025',
        timeLeft: '2 jours'
      },
      recentActivity: [
        {
          type: 'assignment',
          title: 'TP Marketing Digital',
          date: 'Il y a 2 jours',
          status: 'completed'
        },
        {
          type: 'grade',
          title: 'Note: 18/20 - TP RH',
          date: 'Il y a 3 jours',
          status: 'completed'
        },
        {
          type: 'message',
          title: 'Nouveau cours disponible',
          date: 'Il y a 1 jour',
          status: 'new'
        },
        {
          type: 'exam',
          title: 'Examen IOP programmé',
          date: 'Il y a 2 heures',
          status: 'pending'
        }
      ]
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur API dashboard étudiant:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
