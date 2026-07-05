import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const formData = await req.formData()
    
    // Extraire et convertir les données du formulaire
    const inscriptionData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      dateOfBirth: formData.get('dateOfBirth'),
      address: formData.get('address'),
      city: formData.get('city'),
      country: formData.get('country'),
      formationId: Number(formData.get('formationId')),
      niveau: formData.get('niveau'),
      motivation: formData.get('motivation'),
      documents: JSON.parse(formData.get('documents') as string),
      userId: session.user.id
    }

    // Validation basique
    if (!inscriptionData.firstName || !inscriptionData.lastName || !inscriptionData.email) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    // Créer l'inscription en base de données
    const inscription = await prisma.enrollment.create({
      data: {
        firstName: inscriptionData.firstName as string,
        lastName: inscriptionData.lastName as string,
        email: inscriptionData.email as string,
        phone: inscriptionData.phone as string,
        address: inscriptionData.address as string,
        motivationLetter: inscriptionData.motivation as string,
        status: 'pending',
        formationId: inscriptionData.formationId,
        startDate: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      inscription: inscription,
      message: 'Inscription soumise avec succès'
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les inscriptions de l'étudiant
    const inscriptions = await prisma.enrollment.findMany({
      where: { email: session.user.email },
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
