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

    // Simuler les certificats (en réalité, viendraient de la base de données)
    const certificates = [
      {
        id: 1,
        studentName: 'Alice Dupont',
        studentEmail: 'alice.dupont@example.com',
        formationTitle: 'Développement Web',
        formationCategorie: 'Programmation',
        completionDate: '2025-06-15',
        grade: 18,
        uniqueId: 'CJ-2025-001-ABC123',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CJ-2025-001-ABC123',
        certificateUrl: 'https://example.com/certificates/CJ-2025-001-ABC123.pdf',
        status: 'generated',
        createdAt: '2025-06-15T10:00:00Z',
        issuedBy: session.user.email
      },
      {
        id: 2,
        studentName: 'Bob Martin',
        studentEmail: 'bob.martin@example.com',
        formationTitle: 'Marketing Digital',
        formationCategorie: 'Marketing',
        completionDate: '2025-07-01',
        grade: 16,
        uniqueId: 'CJ-2025-002-DEF456',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CJ-2025-002-DEF456',
        certificateUrl: 'https://example.com/certificates/CJ-2025-002-DEF456.pdf',
        status: 'downloaded',
        createdAt: '2025-07-01T14:00:00Z',
        issuedBy: session.user.email
      },
      {
        id: 3,
        studentName: 'Carol Johnson',
        studentEmail: 'carol.johnson@example.com',
        formationTitle: 'Gestion de Projet',
        formationCategorie: 'Management',
        completionDate: '2025-06-20',
        grade: 15,
        uniqueId: 'CJ-2025-003-GHI789',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CJ-2025-003-GHI789',
        certificateUrl: 'https://example.com/certificates/CJ-2025-003-GHI789.pdf',
        status: 'verified',
        createdAt: '2025-06-20T09:00:00Z',
        issuedBy: session.user.email
      }
    ]

    return NextResponse.json(certificates)
  } catch (error) {
    console.error('Erreur lors du chargement des certificats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { studentEmail, formationId, grade, completionDate } = await req.json()

    // Validation basique
    if (!studentEmail || !formationId || !grade || !completionDate) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    // Générer un ID unique
    const uniqueId = `CJ-2025-${Date.now().toString().slice(-3)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // Créer le certificat (simulation)
    const certificate = {
      id: Date.now(),
      studentName: studentEmail.split('@')[0],
      studentEmail,
      formationTitle: 'Formation test',
      formationCategorie: 'Test',
      completionDate,
      grade,
      uniqueId,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${uniqueId}`,
      certificateUrl: `https://example.com/certificates/${uniqueId}.pdf`,
      status: 'generated',
      createdAt: new Date().toISOString(),
      issuedBy: session.user.email
    }

    return NextResponse.json(certificate, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la génération du certificat:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { certificateId, status } = await req.json()

    if (!certificateId || !status) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    // Simuler la mise à jour du statut (en réalité, viendra de la base de données)
    const updatedCertificate = {
      id: certificateId,
      status,
      updatedAt: new Date().toISOString(),
      revokedAt: status === 'revoked' ? new Date().toISOString() : undefined
    }

    return NextResponse.json(updatedCertificate)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du certificat:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
