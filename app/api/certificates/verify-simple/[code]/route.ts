import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
): Promise<NextResponse> {
  try {
    const { code } = await context.params
    const certificateCode = code

    // Validate certificate code format
    if (!certificateCode || certificateCode.length < 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code de certificat invalide' 
        },
        { status: 400 }
      )
    }

    // Search for certificate in database
    const certificate = await prisma.certificate.findFirst({
      where: {
        code: certificateCode
      },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        formation: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            location: true,
          }
        }
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Certificat non trouvé. Veuillez vérifier le code et réessayer.' 
        },
        { status: 404 }
      )
    }

    // Check if certificate is valid
    const isValid = certificate.verified

    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ce certificat n\'est pas valide',
          reason: 'Certificat non vérifié'
        },
        { status: 410 }
      )
    }

    // Prepare verification response
    const verificationData = {
      success: true,
      certificate: {
        id: certificate.id,
        code: certificate.code,
        holderName: certificate.holderName,
        formationId: certificate.formationId,
        sessionId: certificate.sessionId,
        enrollmentId: certificate.enrollmentId,
        type: certificate.type,
        issuedAt: certificate.issuedAt,
        issuedBy: certificate.issuedBy,
        verified: certificate.verified,
        userId: certificate.userId,
        // User information
        user: (certificate as any).enrollment?.student ? {
          id: (certificate as any).enrollment?.student.id,
          name: `${(certificate as any).enrollment?.student.firstName} ${(certificate as any).enrollment?.student.lastName}`.trim(),
          email: (certificate as any).enrollment?.student.email || '',
          firstName: (certificate as any).enrollment?.student.firstName || '',
          lastName: (certificate as any).enrollment?.student.lastName || '',
        } : null,
        // Formation information
        formation: (certificate as any).formation ? {
          id: (certificate as any).formation.id,
          title: (certificate as any).formation.title,
          description: (certificate as any).formation.description,
        } : null,
        // Session information
        session: (certificate as any).session ? {
          id: (certificate as any).session.id,
          title: (certificate as any).formation?.title || 'Session de formation',
          startDate: (certificate as any).session.startDate,
          endDate: (certificate as any).session.endDate,
          location: (certificate as any).session.location,
        } : null,
        // Enrollment information
        enrollment: (certificate as any).enrollment ? {
          enrollmentCode: (certificate as any).enrollment.enrollmentCode,
          startDate: (certificate as any).enrollment.startDate,
          endDate: (certificate as any).enrollment.endDate,
          progress: (certificate as any).enrollment.progress,
          status: (certificate as any).enrollment.status,
        } : null,
        // Verification URL
        verificationUrl: `https://cjdtc.com/verification/${certificate.code}`,
        // QR code data
        qrCodeData: JSON.stringify({
          certificateCode: certificate.code,
          verificationUrl: `https://cjdtc.com/verification/${certificate.code}`,
          timestamp: new Date().toISOString(),
          issuer: 'CJ DEVELOPMENT TRAINING CENTER',
          version: '2.0'
        })
      }
    }

    return NextResponse.json(verificationData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Certificate verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la vérification du certificat' 
      },
      { status: 500 }
    )
  }
}
