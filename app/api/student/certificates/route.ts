import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const studentEmail = session.user.email

    if (!studentEmail) {
      return NextResponse.json({ error: 'Email de l\'étudiant non configuré dans la session' }, { status: 400 })
    }

    const dbCertificates = await prisma.certificate.findMany({
      where: {
        enrollment: {
          email: studentEmail
        }
      },
      include: {
        formation: {
          select: {
            title: true,
            categorie: true
          }
        },
        session: {
          select: {
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })

    const mapped = dbCertificates.map((cert) => ({
      id: cert.id,
      code: cert.code,
      holderName: cert.holderName,
      formationId: cert.formationId,
      sessionId: cert.sessionId,
      enrollmentId: cert.enrollmentId,
      type: cert.type,
      issuedAt: cert.issuedAt.toISOString(),
      issuedBy: cert.issuedBy || 'CJ DTC',
      verified: cert.verified,
      userId: cert.userId,
      formationTitle: cert.formation?.title || 'Formation Générale',
      formationCategorie: cert.formation?.categorie || 'Autres',
      completionDate: cert.session ? new Date(cert.session.endDate).toISOString().split('T')[0] : cert.issuedAt.toISOString().split('T')[0]
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Erreur lors du chargement des certificats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
