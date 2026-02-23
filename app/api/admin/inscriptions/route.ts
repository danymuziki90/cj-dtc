import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const inscriptions = await prisma.enrollment.findMany({
      include: {
        formation: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(inscriptions)
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id, status, notes, matricule } = await req.json()

    const updateData: any = { 
      status,
      notes
    }

    // Ajouter le matricule si fourni
    if (matricule) {
      updateData.matricule = matricule
    }

    const updatedInscription = await prisma.enrollment.update({
      where: { id },
      data: updateData,
      include: {
        formation: true
      }
    })

    return NextResponse.json(updatedInscription)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inscription:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
