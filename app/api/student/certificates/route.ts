import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Simuler les certificats de l'étudiant (en réalité, viendraient de la base de données)
    const certificates = [
      {
        id: 1,
        studentName: session.user.name || 'Étudiant Test',
        studentEmail: session.user.email,
        formationTitle: 'Développement Web',
        formationCategorie: 'Programmation',
        completionDate: '2025-06-15',
        grade: 18,
        uniqueId: 'CJ-2025-001-ABC123',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CJ-2025-001-ABC123',
        certificateUrl: 'https://example.com/certificates/CJ-2025-001-ABC123.pdf',
        status: 'generated',
        createdAt: new Date('2025-06-15').toISOString()
      }
    ]

    return NextResponse.json(certificates)
  } catch (error) {
    console.error('Erreur lors du chargement des certificats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
