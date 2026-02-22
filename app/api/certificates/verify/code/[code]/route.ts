import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: { code: string } }
): Promise<NextResponse> {
  try {
    const certificateCode = context.params.code

    // Validate certificate code
    if (!certificateCode || certificateCode.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code de certificat invalide' 
        },
        { status: 400 }
      )
    }

    // Find certificate in database
    const certificate = await prisma.certificate.findUnique({
      where: { code: certificateCode }
    })

    // Get formation data if exists
    let formation = null
    if (certificate?.formationId) {
      formation = await prisma.formation.findUnique({
        where: { id: certificate.formationId },
        select: {
          id: true,
          title: true,
          description: true,
          categorie: true
        }
      })
    }

    // Get enrollment data if exists
    let enrollment = null
    if (certificate?.enrollmentId) {
      enrollment = await prisma.enrollment.findUnique({
        where: { id: certificate.enrollmentId }
      })
    }

    if (!certificate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Certificat non trouvé' 
        },
        { status: 404 }
      )
    }

    // Prepare response with all certificate details
    const response = {
      success: true,
      certificate: {
        id: certificate.id,
        code: certificate.code,
        holderName: certificate.holderName,
        type: certificate.type,
        issuedAt: certificate.issuedAt,
        issuedBy: certificate.issuedBy,
        verified: certificate.verified,
        userId: certificate.userId,
        formationId: certificate.formationId,
        sessionId: certificate.sessionId,
        enrollmentId: certificate.enrollmentId
      },
      formation: formation,
      enrollment: enrollment,
      verification: {
        isValid: true,
        verifiedAt: new Date().toISOString(),
        verificationUrl: `https://cjdtc.com/verification/${certificate.code}`
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la vérification du certificat' 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { code: string } }
): Promise<NextResponse> {
  try {
    const certificateCode = context.params.code

    // Validate certificate code
    if (!certificateCode || certificateCode.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code de certificat invalide' 
        },
        { status: 400 }
      )
    }

    // Find certificate in database
    const certificate = await prisma.certificate.findUnique({
      where: { code: certificateCode }
    })

    if (!certificate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Certificat non trouvé' 
        },
        { status: 404 }
      )
    }

    // Update verification status
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificate.id },
      data: { verified: true }
    })

    // Get formation data if exists
    let formation = null
    if (updatedCertificate?.formationId) {
      formation = await prisma.formation.findUnique({
        where: { id: updatedCertificate.formationId },
        select: {
          id: true,
          title: true,
          description: true,
          categorie: true
        }
      })
    }

    // Prepare response
    const response = {
      success: true,
      certificate: {
        id: updatedCertificate.id,
        code: updatedCertificate.code,
        holderName: updatedCertificate.holderName,
        type: updatedCertificate.type,
        issuedAt: updatedCertificate.issuedAt,
        issuedBy: updatedCertificate.issuedBy,
        verified: updatedCertificate.verified,
        userId: updatedCertificate.userId,
        formationId: updatedCertificate.formationId,
        sessionId: updatedCertificate.sessionId,
        enrollmentId: updatedCertificate.enrollmentId
      },
      formation: formation,
      verification: {
        isValid: true,
        verifiedAt: new Date().toISOString(),
        verificationUrl: `https://cjdtc.com/verification/${certificateCode}`
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la vérification du certificat' 
      },
      { status: 500 }
    )
  }
}
