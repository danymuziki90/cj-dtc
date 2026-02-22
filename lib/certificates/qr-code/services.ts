// CJ DTC - QR Code Generation Services
// Version 1.0 - Production Ready

import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

// QR code generation utilities
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
    version: '2.0',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 1000).toISOString()
  })
}

// Generate QR code for certificate display
export function generateCertificateQRCodeDisplay(certificate: any): string {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return generateCertificateQRCode(qrData)
}

// Generate QR code for PDF embedding
export async function generateCertificateQRCodePDF(certificateId: number): Promise<string> {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
    })

    if (!certificate) {
      throw new Error('Certificate not found')
    }

    const qrCodeData = generateQRCodeData(
      certificate.code,
      `https://cjdtc.com/verification/${certificate.code}`
    )
    
    const qrCode = await generateCertificateQRCode(qrCodeData)
    
    return qrCode
  } catch (error) {
    console.error('Error generating QR code PDF:', error)
    throw new Error('Failed to generate QR code PDF')
  }
}

// Generate QR code for email templates
export function generateCertificateQRCodeEmail(certificate: any): string {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return generateCertificateQRCode(qrData)
}

// Generate QR code for social sharing
export function generateCertificateQRCodeSocial(certificate: any): string {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return generateCertificateQRCode(qrData)
}

// Generate QR code for print materials
export function generateCertificateQRCodePrint(certificate: any): string {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return generateCertificateQRCode(qrData)
}

// QR code validation utilities
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

// QR code formatting utilities
export function formatQRCodeForDisplay(qrCode: string): string {
  const parsed = JSON.parse(qrCode)
  return {
    certificateNumber: parsed.certificateCode,
    verificationUrl: parsed.verificationUrl,
    timestamp: parsed.timestamp,
    issuer: parsed.issuer,
    version: parsed.version
  }
}

// QR code sharing utilities
export function shareCertificateQRCode(certificateCode: string): string {
  const shareData = {
    title: `Certificat - ${certificateCode}`,
    text: 'Vérifiez mon certificat sur CJ DTC',
    url: `https://cjdtc.com/verification/${certificateCode}`
  }
  
  return JSON.stringify(shareData)
}

// QR code printing utilities
export function printCertificateQRCode(qrCode: string): void {
  const link = document.createElement('a')
  link.href = qrCode
  link.download = `certificate-qr-code.png`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// QR code cleanup
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

// Certificate validation utilities
export function validateCertificateRequest(data: any): {
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

// Certificate status helpers
export function isCertificateValid(certificate: any): boolean {
  if (!certificate) return false
  
  const now = new Date()
  return certificate.verified && (!certificate.validUntil || new Date(certificate.validUntil) > now)
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

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100'
    case 'B': return 'text-blue-600 bg-blue-100'
    case 'C': return 'text-yellow-600 bg-yellow-100'
    case 'D': return 'text-orange-600 bg-orange-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

// Certificate verification URL generation
export function formatVerificationUrl(certificateCode: string): string {
  return `https://cjdtc.com/verification/${certificateCode}`
}

// Certificate QR code validation
export function validateCertificateCode(qrCodeData: string): boolean {
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

// Certificate QR code analytics
export function getQRCodeStats(certificateId: number): Promise<any> {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
    })

    return {
      qrCode: certificate.qrCode || null,
      verificationCount: certificate.verificationCount || 0,
      lastVerifiedAt: certificate.lastVerifiedAt || certificate.createdAt,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt
    }
  } catch (error) {
    console.error('Error getting QR code stats:', error)
    return {
      qrCode: null,
      verificationCount: 0,
      lastVerifiedAt: null,
      createdAt: null,
      updatedAt: null
    }
  }
}

// Certificate QR code generation for different formats
export function generateCertificateQRCodeImage(certificate: any, format: 'display' | 'email' | 'print' | 'mobile' | 'social'): Promise<string> {
  switch (format) {
    case 'display':
      return generateCertificateQRCodeDisplay(certificate)
    case 'email':
      return generateCertificateQRCodeEmail(certificate)
    case 'print':
      return generateCertificateQRCodePrint(certificate)
    case 'mobile':
      return generateCertificateQRCodeMobile(certificate)
    case 'social':
      return generateCertificateQRCodeSocial(certificate)
    default:
      return generateCertificateQRCodeDisplay(certificate)
  }
}

// Certificate QR code generation for mobile apps
export function generateCertificateQRCodeMobile(certificate: any): string {
  const qrData = generateQRCodeData(
    certificate.code,
    `https://cjdtc.com/verification/${certificate.code}`
  )
  
  return generateCertificateQRCode(qrData)
}

// Certificate QR code batch generation
export async function generateAllCertificateQRCodes(): Promise<void> {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        verified: true
      }
    })

    for (const certificate of certificates) {
      try {
        const qrCode = await generateCertificateQRCodePDF(certificate.id)
        console.log(`Generated QR code for certificate ${certificate.id}`)
      } catch (error) {
        console.error(`Error generating QR code for certificate ${certificate.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Error generating QR codes:', error)
  }
}

// Certificate QR code verification for mobile apps
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

// Certificate QR code download utilities
export function downloadCertificateQRCode(qrCode: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = qrCode
  link.download = filename || `certificate-qr-code.png`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Certificate QR code expiration
export function isQRCodeExpired(qrCodeData: string): boolean {
  try {
    const parsed = JSON.parse(qrCodeData)
    const expiresAt = new Date(parsed.expiresAt)
    return new Date() > expiresAt
  } catch (error) {
    return false
  }
}

// Certificate QR code cleanup
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

// Certificate QR code validation for API endpoints
export function validateQRCodeRequest(certificateCode: string): boolean {
  if (!certificateCode || certificateCode.length < 5) {
    return false
  }
  
  // Add more validation as needed
  return /^[A-Z0-9]+$/.test(certificateCode)
}

// Certificate QR code analytics
export function trackQRCodeScans(certificateId: number): Promise<void> {
  try {
    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        verificationCount: {
          increment: 1
        }
      }
    })
  } catch (error) {
    console.error('Error tracking QR code scans:', error)
  }
}

// Certificate QR code sharing utilities
export function shareCertificateQRCode(certificateCode: string): string {
  const shareData = {
    title: `Certificat - ${certificateCode}`,
    text: 'Vérifiez mon certificat sur CJ DTC',
    url: `https://cjdtc.com/verification/${certificateCode}`
  }
  
  return JSON.stringify(shareData)
}

// Certificate QR code printing utilities
export function printCertificateQRCode(qrCode: string): void {
  const printWindow = window.open('', '', '_blank')
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
          }
          .verification-info {
            text-align: center;
            margin-top: 10px;
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
            <!-- QR code will be generated here -->
          </div>
        </div>
        <div class="verification-info">
          <p>Scannez ce code QR avec votre smartphone</p>
          <p class="certificate-number">${qrCodeData.certificateNumber}</p>
          <p class="verification-url">${qrData.verificationUrl}</p>
          <p class="instructions">
            1. Ouvrir l'appareil QR code
            2. Scanner avec votre smartphone
            3. Accédez à la page de vérification
          </p>
        </div>
      </body>
    </html>
  `)
  printWindow.print()
  printWindow.close()
}

// Certificate QR code download utilities
export function downloadCertificateQRCode(qrCode: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = qrCode
  link.download = filename || `certificate-qr-code.png`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Certificate QR code analytics
export function getQRCodeStats(certificateId: number): Promise<any> {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
    })

    return {
      qrCode: certificate.qrCode || null,
      verificationCount: certificate.verificationCount || 0,
      lastVerifiedAt: certificate.lastVerifiedAt || certificate.createdAt,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt
    }
  } catch (error) {
    console.error('Error getting QR code stats:', error)
    return {
      qrCode: null,
      verificationCount: 0,
      lastVerifiedAt: null,
      createdAt: null,
      updatedAt: null
    }
  }
}

// Certificate QR code validation for API endpoints
export function validateQRCodeRequest(certificateCode: string): boolean {
  if (!certificateCode || certificateCode.length < 5) {
    return false
  }
  
  // Add more validation as needed
  return /^[A-Z0-9]+$/.test(certificateCode)
}

// Certificate QR code expiration
export function isQRCodeExpired(qrCodeData: string): boolean {
  try {
    const parsed = JSON.parse(qrCodeData)
    const expiresAt = new Date(parsed.expiresAt)
    return new Date() > expiresAt
  } catch (error) {
    return false
  }
}

// Certificate QR code cleanup
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
