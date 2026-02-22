import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCertificateQRCodeDisplay, generateQRCodeData } from '@/lib/certificates/qr-code/simple'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const certificateId = parseInt(context.params.id)

    // Validate certificate ID
    if (isNaN(certificateId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de certificat invalide' 
        },
        { status: 400 }
      )
    }

    // Find certificate in database
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
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

    // Check if certificate is verified
    if (!certificate.verified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le certificat doit être vérifié pour générer un QR code' 
        },
        { status: 400 }
      )
    }

    // Generate QR code data
    const qrCodeData = generateQRCodeData(
      certificate.code,
      `https://cjdtc.com/verification/${certificate.code}`
    )

    // Generate QR code image (mock implementation)
    const qrCodeImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`

    // Prepare response
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
        userId: certificate.userId
      },
      qrCode: {
        data: qrCodeData,
        image: qrCodeImage,
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
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération du QR code' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const certificateId = parseInt(context.params.id)

    // Validate certificate ID
    if (isNaN(certificateId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de certificat invalide' 
        },
        { status: 400 }
      )
    }

    // Find certificate in database
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
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

    // Generate QR code data
    const qrCodeData = generateQRCodeData(
      certificate.code,
      `https://cjdtc.com/verification/${certificate.code}`
    )

    // Generate QR code image (mock implementation)
    const qrCodeImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`

    // Prepare response
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
        userId: certificate.userId
      },
      qrCode: {
        data: qrCodeData,
        image: qrCodeImage,
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
    console.error('Error getting QR code:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération du QR code' 
      },
      { status: 500 }
    )
  }
}
