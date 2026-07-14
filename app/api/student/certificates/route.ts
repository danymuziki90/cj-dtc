import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export const runtime = "nodejs"

// GET /api/student/certificates - Liste des certificats actifs de l'étudiant connecté
export async function GET(req: NextRequest) {
  try {
    const auth = await requireStudent(req)
    if (auth.error) return auth.error

    const studentId = auth.student.id
    const studentEmail = auth.student.email

    // Récupérer les certificats de l'étudiant (par ID ou par e-mail d'inscription)
    const dbCertificates = await prisma.certificate.findMany({
      where: {
        status: 'actif',
        OR: [
          { studentId },
          {
            enrollment: {
              email: studentEmail
            }
          }
        ]
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
      status: cert.status,
      fileUrl: cert.fileUrl,
      formationTitle: cert.formation?.title || 'Formation Générale',
      formationCategorie: cert.formation?.categorie || 'Autres',
      completionDate: cert.session ? new Date(cert.session.endDate).toISOString().split('T')[0] : cert.issuedAt.toISOString().split('T')[0]
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Erreur lors du chargement des certificats de l\'étudiant:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
