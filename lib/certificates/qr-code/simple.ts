// CJ DTC - QR Code Generation Services (Simplified)
// Version 1.0 - Production Ready

import QRCode from 'qrcode'

// Generate QR code for certificate
export async function generateCertificateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#002D72',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

// Generate QR code data for certificate
export function generateQRCodeData(certificateCode: string, verificationUrl: string): string {
  return JSON.stringify({
    certificateCode,
    verificationUrl,
    timestamp: new Date().toISOString(),
    issuer: 'CJ DEVELOPMENT TRAINING CENTER',
    version: '2.0'
  })
}

// Generate QR code for certificate display
export async function generateCertificateQRCodeDisplay(certificate: any): Promise<string> {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return await generateCertificateQRCode(qrData)
}

// Generate QR code for PDF embedding
export async function generateCertificateQRCodePDF(certificate: any): Promise<string> {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return await generateCertificateQRCode(qrData)
}

// Generate QR code for email templates
export async function generateCertificateQRCodeEmail(certificate: any): Promise<string> {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return await generateCertificateQRCode(qrData)
}

// Generate QR code for social sharing
export async function generateCertificateQRCodeSocial(certificate: any): Promise<string> {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return await generateCertificateQRCode(qrData)
}

// Generate QR code for print materials
export async function generateCertificateQRCodePrint(certificate: any): Promise<string> {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return await generateCertificateQRCode(qrData)
}

// Validate QR code data
export function validateQRCode(qrCodeData: string): boolean {
  try {
    const parsed = JSON.parse(qrCodeData)
    return (
      parsed.certificateCode &&
      parsed.verificationUrl &&
      parsed.issuer === 'CJ DEVELOPMENT TRAINING CENTER' &&
      parsed.version === '2.0'
    )
  } catch (error) {
    console.error('Invalid QR code data:', error)
    return false
  }
}

// Format QR code for display
export function formatQRCodeForDisplay(qrCodeData: string): any {
  try {
    const parsed = JSON.parse(qrCodeData)
    return {
      certificateNumber: parsed.certificateCode,
      verificationUrl: parsed.verificationUrl,
      timestamp: parsed.timestamp,
      issuer: parsed.issuer,
      version: parsed.version
    }
  } catch (error) {
    console.error('Error formatting QR code:', error)
    return null
  }
}

// Share certificate QR code
export function shareCertificateQRCode(certificateCode: string): string {
  const shareData = {
    title: `Certificat - ${certificateCode}`,
    text: 'Vérifiez mon certificat sur CJ DTC',
    url: `https://cjdtc.com/verification/${certificateCode}`
  }
  
  return JSON.stringify(shareData)
}

// Download certificate QR code
export function downloadCertificateQRCode(qrCode: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = qrCode
  link.download = filename || `certificate-qr-code.png`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Print certificate QR code
export function printCertificateQRCode(qrCode: string): void {
  const printWindow = window.open('', '', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate Verification - CJ DTC</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .qr-code {
              width: 256px;
              height: 256px;
              background: white;
              padding: 10px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              margin-bottom: 10px;
            }
            .verification-info {
              text-align: center;
              font-size: 14px;
              color: #333;
            }
            .certificate-number {
              font-size: 18px;
              font-weight: bold;
              color: #002D72;
              margin-bottom: 5px;
            }
            .verification-url {
              font-size: 12px;
              color: #666;
              word-break: break-all;
              max-width: 200px;
            }
            .instructions {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">
              <img src="${qrCode}" alt="Certificate QR Code" />
            </div>
            <div class="verification-info">
              <p>Scannez ce code QR avec votre smartphone</p>
              <p class="certificate-number">CJ-DTC-2024-XXXX</p>
              <p class="verification-url">https://cjdtc.com/verification/</p>
              <p class="instructions">
                1. Ouvrir l'appareil QR code
                2. Scanner avec votre smartphone
                3. Accédez à la page de vérification
              </p>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.print()
    printWindow.close()
  }
}

// Generate verification URL
export function generateVerificationUrl(certificateCode: string): string {
  return `https://cjdtc.com/verification/${certificateCode}`
}

// Validate certificate code format
export function validateCertificateCode(certificateCode: string): boolean {
  if (!certificateCode || certificateCode.length < 5) {
    return false
  }
  
  return /^[A-Z0-9-]+$/.test(certificateCode)
}

// Certificate type helpers
export function getCertificateTypeColor(type: string): string {
  switch (type) {
    case 'COMPLETION': return 'bg-blue-100 text-blue-800'
    case 'EXCELLENCE': return 'bg-purple-100 text-purple-800'
    case 'MASTERCLASS': return 'bg-indigo-100 text-indigo-800'
    case 'WORKSHOP': return 'bg-yellow-100 text-yellow-800'
    case 'SPECIALIZATION': return 'bg-pink-100 text-pink-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Certificate status helpers
export function isCertificateValid(certificate: any): boolean {
  if (!certificate) return false
  
  return certificate.verified
}

// Format certificate date
export function formatCertificateDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).format(dateObj)
}

// Clean up QR code data
export function cleanupQRCodeData(qrCodeData: string): string {
  try {
    const parsed = JSON.parse(qrCodeData)
    return JSON.stringify({
      ...parsed,
      timestamp: new Date().toISOString(),
      issuer: 'CJ DEVELOPMENT TRAINING CENTER',
      version: '2.0'
    })
  } catch (error) {
    return qrCodeData
  }
}

// Check if QR code is expired
export function isQRCodeExpired(qrCodeData: string): boolean {
  try {
    const parsed = JSON.parse(qrCodeData)
    if (parsed.expiresAt) {
      const expiresAt = new Date(parsed.expiresAt)
      return new Date() > expiresAt
    }
    return false
  } catch (error) {
    return false
  }
}

// Generate QR code for different formats
export async function generateCertificateQRCodeImage(
  certificate: any, 
  format: 'display' | 'email' | 'print' | 'mobile' | 'social'
): Promise<string> {
  switch (format) {
    case 'display':
      return await generateCertificateQRCodeDisplay(certificate)
    case 'email':
      return await generateCertificateQRCodeEmail(certificate)
    case 'print':
      return await generateCertificateQRCodePrint(certificate)
    case 'mobile':
      return await generateCertificateQRCodeDisplay(certificate)
    case 'social':
      return await generateCertificateQRCodeSocial(certificate)
    default:
      return await generateCertificateQRCodeDisplay(certificate)
  }
}

// Batch generate QR codes for all certificates
export async function generateAllCertificateQRCodes(certificates: any[]): Promise<void> {
  try {
    for (const certificate of certificates) {
      try {
        const qrCode = await generateCertificateQRCodeDisplay(certificate)
        console.log(`Generated QR code for certificate ${certificate.id}`)
      } catch (error) {
        console.error(`Error generating QR code for certificate ${certificate.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Error generating QR codes:', error)
  }
}

// Verify certificate QR code
export function verifyCertificateQRCode(qrCodeData: string): boolean {
  try {
    const parsed = JSON.parse(qrCodeData)
    return (
      parsed.certificateCode &&
      parsed.verificationUrl &&
      parsed.issuer === 'CJ DEVELOPMENT TRAINING CENTER' &&
      parsed.version === '2.0'
    )
  } catch (error) {
    return false
  }
}

// Certificate validation utilities
export function validateCertificateRequest(data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!data.holderName || data.holderName.trim().length < 2) {
    errors.push('Le nom du titulaire est requis')
  }
  
  if (!data.formationId) {
    errors.push('L\'ID de la formation est requis')
  }
  
  if (!data.enrollmentId) {
    errors.push('L\'ID de l\'inscription est requis')
  }
  
  if (!data.type) {
    errors.push('Le type de certificat est requis')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Certificate grade helpers
export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100'
    case 'B': return 'text-blue-600 bg-blue-100'
    case 'C': return 'text-yellow-600 bg-yellow-100'
    case 'D': return 'text-orange-600 bg-orange-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

// Format verification URL
export function formatVerificationUrl(certificateCode: string): string {
  return `https://cjdtc.com/verification/${certificateCode}`
}

// Certificate QR code analytics
export function getQRCodeAnalytics(certificate: any): any {
  return {
    certificateCode: certificate.code,
    verificationUrl: `https://cjdtc.com/verification/${certificate.code}`,
    issuedAt: certificate.issuedAt,
    verified: certificate.verified,
    type: certificate.type
  }
}

// Export certificate data
export function exportCertificateData(certificate: any): any {
  return {
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
    verificationUrl: `https://cjdtc.com/verification/${certificate.code}`
  }
}

// Certificate search and filtering
export function searchCertificates(
  certificates: any[], 
  query?: string, 
  filters?: {
    type?: string,
    verified?: boolean,
    dateFrom?: string,
    dateTo?: string
  }
): any[] {
  return certificates.filter(cert => {
    // Search query
    if (query) {
      const searchLower = query.toLowerCase()
      const matchesQuery = 
        cert.holderName.toLowerCase().includes(searchLower) ||
        cert.code.toLowerCase().includes(searchLower)
      if (!matchesQuery) return false
    }
    
    // Type filter
    if (filters?.type && cert.type !== filters.type) return false
    
    // Verified filter
    if (filters?.verified !== undefined && cert.verified !== filters.verified) return false
    
    // Date range filter
    if (filters?.dateFrom || filters?.dateTo) {
      const certDate = new Date(cert.issuedAt)
      if (filters.dateFrom && certDate < new Date(filters.dateFrom)) return false
      if (filters.dateTo && certDate > new Date(filters.dateTo)) return false
    }
    
    return true
  })
}

// Certificate statistics
export function getCertificateStats(certificates: any[]): any {
  const total = certificates.length
  const verified = certificates.filter(c => c.verified).length
  const issuedThisMonth = certificates.filter(c => {
    const certDate = new Date(c.issuedAt)
    const now = new Date()
    return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear()
  }).length

  return {
    total,
    verified,
    issuedThisMonth,
    verificationRate: total > 0 ? (verified / total) * 100 : 0
  }
}

// Certificate type distribution
export function getCertificateTypeDistribution(certificates: any[]): any {
  const distribution: Record<string, number> = {}
  
  certificates.forEach(cert => {
    distribution[cert.type] = (distribution[cert.type] || 0) + 1
  })
  
  return distribution
}

// Certificate validation for API endpoints
export function validateQRCodeRequest(certificateCode: string): boolean {
  if (!certificateCode || certificateCode.length < 5) {
    return false
  }
  
  return /^[A-Z0-9-]+$/.test(certificateCode)
}

// Certificate QR code generation for different use cases
export function generateQRCodeForUseCase(
  certificate: any,
  useCase: 'display' | 'email' | 'print' | 'mobile' | 'social' | 'pdf'
): Promise<string> {
  switch (useCase) {
    case 'display':
      return generateCertificateQRCodeDisplay(certificate)
    case 'email':
      return generateCertificateQRCodeEmail(certificate)
    case 'print':
      return generateCertificateQRCodePrint(certificate)
    case 'mobile':
      return generateCertificateQRCodeDisplay(certificate)
    case 'social':
      return generateCertificateQRCodeSocial(certificate)
    case 'pdf':
      return generateCertificateQRCodePDF(certificate)
    default:
      return generateCertificateQRCodeDisplay(certificate)
  }
}
