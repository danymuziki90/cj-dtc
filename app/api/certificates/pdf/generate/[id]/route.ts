import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  generateCertificatePDF, 
  generateCertificateWithTemplate,
  validateCertificatePDFData,
  trackCertificatePDFGeneration
} from '@/lib/certificates/pdf/services'

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

    // Validate certificate data
    const validation = validateCertificatePDFData(certificate)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données de certificat invalides',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Get request body for template selection
    const body = await request.json().catch(() => ({}))
    const template = body.template || 'classic'
    const includeQRCode = body.includeQRCode !== false

    // Get formation data
    let formation = null
    if (certificate.formationId) {
      formation = await prisma.formation.findUnique({
        where: { id: certificate.formationId }
      })
    }

    // Generate QR code if requested
    let qrCodeImage = null
    if (includeQRCode) {
      try {
        // Import QR code generation
        const { generateCertificateQRCodeDisplay } = await import('@/lib/certificates/qr-code/simple')
        qrCodeImage = await generateCertificateQRCodeDisplay(certificate)
      } catch (error) {
        console.error('Error generating QR code for PDF:', error)
        // Continue without QR code if generation fails
      }
    }

    // Generate PDF
    let pdfBase64: string
    try {
      if (template !== 'classic') {
        pdfBase64 = await generateCertificateWithTemplate(
          certificate,
          formation,
          template as 'classic' | 'modern' | 'elegant',
          qrCodeImage || undefined
        )
      } else {
        pdfBase64 = await generateCertificatePDF(
          certificate,
          formation,
          qrCodeImage || undefined
        )
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la génération du PDF' 
        },
        { status: 500 }
      )
    }

    // Track PDF generation
    trackCertificatePDFGeneration(certificateId)

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
      pdf: {
        data: pdfBase64,
        filename: `certificat-${certificate.code}.pdf`,
        template: template,
        size: Math.round(pdfBase64.length * 0.75 / 1024) // Approximate size in KB
      },
      formation: formation ? {
        id: formation.id,
        title: formation.title,
        description: formation.description
      } : null
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
    console.error('Error generating certificate PDF:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération du PDF' 
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

    // Get formation data
    let formation = null
    if (certificate.formationId) {
      formation = await prisma.formation.findUnique({
        where: { id: certificate.formationId }
      })
    }

    // Generate QR code
    let qrCodeImage = null
    try {
      const { generateCertificateQRCodeDisplay } = await import('@/lib/certificates/qr-code/simple')
      qrCodeImage = await generateCertificateQRCodeDisplay(certificate)
    } catch (error) {
      console.error('Error generating QR code for PDF:', error)
    }

    // Generate PDF with default template
    let pdfBase64: string
    try {
      pdfBase64 = await generateCertificatePDF(
        certificate,
        formation,
        qrCodeImage || undefined
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la génération du PDF' 
        },
        { status: 500 }
      )
    }

    // Track PDF generation
    trackCertificatePDFGeneration(certificateId)

    // Return PDF as base64
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `certificat-${certificate.code}.pdf`
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error generating certificate PDF:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération du PDF' 
      },
      { status: 500 }
    )
  }
}
