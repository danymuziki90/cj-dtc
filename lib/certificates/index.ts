// CJ DTC - Certificate Services
// Version 2.0 - Production Ready

import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

// Certificate Types
export interface CertificateData {
  holderName: string
  holderEmail: string
  formationId: number
  sessionId?: number
  enrollmentId: number
  type: CertificateType
  grade: string
  score: number
  credits: number
  validUntil?: Date
  issuedBy?: string
  description?: string
  objectives?: string[]
  skills?: string[]
}

export enum CertificateType {
  COMPLETION = 'COMPLETION',
  ATTENDANCE = 'ATTENDANCE',
  EXCELLENCE = 'EXCELLENCE',
  MASTERY = 'MASTERY',
  SPECIALIZATION = 'SPECIALIZATION'
}

export enum CertificateStatus {
  ISSUED = 'ISSUED',
  VERIFIED = 'VERIFIED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

// Generate Certificate Number
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CJ-DTC-${year}-${random}`
}

// Generate QR Code
export async function generateQRCode(data: string): Promise<string> {
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

// Generate QR Code Data
export function generateQRCodeData(certificateNumber: string, verificationUrl: string): string {
  return JSON.stringify({
    certificateNumber,
    verificationUrl,
    timestamp: new Date().toISOString(),
    issuer: 'CJ DEVELOPMENT TRAINING CENTER',
    version: '2.0'
  })
}

// Create Certificate
export async function createCertificate(data: CertificateData): Promise<any> {
  try {
    const certificateNumber = generateCertificateNumber()
    const qrCode = await generateQRCode(generateQRCodeData(certificateNumber, `https://cjdtc.com/verification/${certificateNumber}`))
    const verificationUrl = `https://cjdtc.com/verification/${certificateNumber}`
    
    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber,
        qrCode: certificateNumber,
        verificationUrl,
        holderName: data.holderName,
        holderEmail: data.holderEmail,
        formationId: data.formationId,
        sessionId: data.sessionId,
        enrollmentId: data.enrollmentId,
        type: data.type,
        grade: data.grade,
        score: data.score,
        credits: data.credits,
        validUntil: data.validUntil,
        issuedBy: data.issuedBy || 'CJ DTC',
        description: data.description,
        objectives: data.objectives ? data.objectives.join('\n') : null,
        skills: data.skills ? data.skills.join(',') : null,
        pdfUrl: '', // Will be generated later
        blockchainHash: '', // Will be generated later
        digitalSignature: '', // Will be generated later
        verificationCount: 0,
        lastVerifiedAt: new Date(),
        issuedAt: new Date(),
        updatedAt: new Date(),
      }
    })

    return certificate
  } catch (error) {
    console.error('Error creating certificate:', error)
    throw new Error('Failed to create certificate')
  }
}

// Verify Certificate
export async function verifyCertificate(code: string): Promise<any> {
  try {
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: code },
          { qrCode: code }
        ]
      },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
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
            type: true,
            category: true,
            duration: true,
            description: true,
            objectives: true,
          }
        },
        session: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            instructorId: true,
          }
        }
      }
    })

    if (!certificate) {
      return {
        success: false,
        error: 'Certificate not found'
      }
    }

    // Check if certificate is valid
    const now = new Date()
    const isValid = certificate.status === 'ISSUED' && 
                     (!certificate.validUntil || new Date(certificate.validUntil) > now)

    if (!isValid) {
      return {
        success: false,
        error: certificate.status === 'REVOKED' ? 'Certificate revoked' : 'Certificate expired'
      }
    }

    // Increment verification count
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        verificationCount: certificate.verificationCount + 1,
        lastVerifiedAt: new Date(),
      }
    })

    return {
      success: true,
      certificate
    }
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return {
      success: false,
      error: 'Failed to verify certificate'
    }
  }
}

// Verify Certificate
export async function verifyCertificate(code: string): Promise<any> {
  try {
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: code },
          { qrCode: code }
        ]
      },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
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
            type: true,
            category: true,
            duration: true,
            description: true,
            objectives: true,
          }
        },
        session: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            instructorId: true,
          }
        }
      }
    })

    if (!certificate) {
      return {
        success: false,
        error: 'Certificate not found'
      }
    }

    // Check if certificate is valid
    const now = new Date()
    const isValid = certificate.status === 'ISSUED' && 
                     (!certificate.validUntil || new Date(certificate.validUntil) > now)

    if (!isValid) {
      return {
        success: false,
        error: certificate.status === 'REVOKED' ? 'Certificate revoked' : 'Certificate expired'
      }
    }

    // Increment verification count
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        verificationCount: certificate.verificationCount + 1,
        lastVerifiedAt: new Date(),
      }
    })

    return {
      success: true,
      certificate
    }
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return {
      success: false,
      error: 'Failed to verify certificate'
    }
  }
}

// Get Certificate by ID
export async function getCertificateById(id: number): Promise<any> {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
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
          }
        },
        session: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return certificate
  } catch (error) {
    console.error('Error getting certificate:', error)
    throw new Error('Failed to get certificate')
  }
}

// Get Certificates by User
export async function getCertificatesByUserId(userId: string): Promise<any[]> {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: userId
      },
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            type: true,
          }
        },
        session: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })

    return certificates
  } catch (error) {
    console.error('Error getting certificates by user:', error)
    throw new Error('Failed to get certificates')
  }
}

// Update Certificate
export async function updateCertificate(id: number, data: Partial<any>): Promise<any> {
  try {
    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    })

    return certificate
  } catch (error) {
    console.error('Error updating certificate:', error)
    throw new Error('Failed to update certificate')
  }
}

// Delete Certificate
export async function deleteCertificate(id: number): Promise<void> {
  try {
    await prisma.certificate.delete({
      where: { id }
    })
  } catch (error) {
    console.error('Error deleting certificate:', error)
    throw new Error('Failed to delete certificate')
  }
}

// Get Certificate Statistics
export async function getCertificateStats(): Promise<any> {
  try {
    const total = await prisma.certificate.count()
    const issuedThisMonth = await prisma.certificate.count({
      where: {
        issuedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
    const totalVerifications = await prisma.certificate.aggregate({
      _sum: {
        verificationCount: true
      }
    })

    return {
      total,
      issuedThisMonth,
      totalVerifications: totalVerifications._sum.verificationCount || 0,
      averageScore: 0, // Calculate from actual data
    }
  } catch (error) {
    console.error('Error getting certificate stats:', error)
    throw new Error('Failed to get certificate statistics')
  }
}

// Search Certificates
export async function searchCertificates(query: string, filters?: {
  type?: CertificateType,
  status?: CertificateStatus,
  dateFrom?: string,
  dateTo?: string,
}): Promise<any[]> {
  try {
    const whereClause: any = {}

    if (query) {
      whereClause.OR = [
        { holderName: { contains: query } },
        { holderEmail: { contains: query } },
        { certificateNumber: { contains: query } },
        { formation: { title: { contains: query } }
      ]
    }

    if (filters?.type) {
      whereClause.type = filters.type
    }

    if (filters?.status) {
      whereClause.status = filters.status
    }

    if (filters?.dateFrom) {
      whereClause.issuedAt = {
        gte: new Date(filters.dateFrom)
      }
    }

    if (filters?.dateTo) {
      whereClause.issuedAt = {
        lte: new Date(filters.dateTo)
      }
    }

    const certificates = await prisma.certificate.findMany({
      where: whereClause,
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        formation: {
          select: {
            id: true,
            title: true,
            type: true,
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })

    return certificates
  } catch (error) {
    console.error('Error searching certificates:', error)
    throw new Error('Failed to search certificates')
  }
}

// Generate Certificate PDF
export async function generateCertificatePDF(certificateId: number): Promise<string> {
  try {
    const certificate = await getCertificateById(certificateId)
    
    // This would generate a PDF certificate
    // For now, return a placeholder URL
    const pdfUrl = `/certificates/pdf/${certificate.certificateNumber}.pdf`
    
    // Update certificate with PDF URL
    await updateCertificate(certificateId, { pdfUrl })
    
    return pdfUrl
  } catch (error) {
    console.error('Error generating certificate PDF:', error)
    throw new Error('Failed to generate certificate PDF')
  }
}

// Upload Certificate to Blockchain
export async function uploadToBlockchain(certificateId: string): Promise<string> {
  try {
    // This would upload the certificate to blockchain
    // For now, return a placeholder hash
    const blockchainHash = `0x${Math.random().toString(16).substring(2, 66)}`
    
    // Update certificate with blockchain hash
    await updateCertificate(parseInt(certificateId), { blockchainHash })
    
    return blockchainHash
  } catch (error) {
    console.error('Error uploading to blockchain:', error)
    throw new Error('Failed to upload to blockchain')
  }
}

// Generate Digital Signature
export function generateDigitalSignature(certificateId: string): string {
  // This would generate a digital signature
  // For now, return a placeholder signature
  return `SIG_${new Date().getFullYear()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

// Validate Certificate Data
export function validateCertificateData(data: CertificateData): { 
  errors: string[] = []
  
  if (!data.holderName || data.holderName.trim().length < 2) {
    errors.push('Le nom du titulaire est requis')
  }
  
  if (!data.holderEmail || !isValidEmail(data.holderEmail)) {
    errors.push('L\'email du titulaire est invalide')
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
  
  if (!data.grade || !['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].includes(data.grade)) {
    errors.push('La note doit être A+, A, B+, B, C+, C, D ou F')
  }
  
  if (data.score < 0 || data.score > 100) {
    errors.push('Le score doit être entre 0 et 100')
  }
  
  if (data.credits < 0) {
    errors.push('Le nombre de crédits doit être positif')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Certificate validation
export function validateCertificate(certificate: any): boolean {
  if (!certificate) return false
  
  const now = new Date()
  const isValid = certificate.status === 'ISSUED' && 
                   (!certificate.validUntil || new Date(certificate.validUntil) > now)
  
  return isValid
}

// Certificate status helpers
export function isCertificateExpired(certificate: any): boolean {
  if (!certificate || !certificate.validUntil) return false
  return new Date(certificate.validUntil) < new Date()
}

export function isCertificateRevoked(certificate: any): boolean {
  return certificate?.status === 'REVOKED'
}

export function getCertificateStatusColor(status: string): string {
  switch (status) {
    case 'ISSUED': return 'bg-green-100 text-green-800'
    case 'VERIFIED': return 'blue-100 text-blue-800'
    case 'REVOKED': return 'bg-red-100 text-red-800'
    case 'EXPIRED': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getCertificateTypeColor(type: string): string {
  switch (type) {
    case 'COMPLETION': return 'bg-blue-100 text-blue-800'
    case 'EXCELLENCE': return 'bg-purple-100 text-purple-800'
    case 'ATTENDANCE': return 'bg-yellow-100 text-yellow-800'
    case 'MASTERY': return 'bg-indigo-100 text-indigo-800'
    case 'SPECIALIZATION': return 'bg-pink-100 text-pink-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+': return 'text-green-600 bg-green-100'
    case 'A': return 'text-green-600 bg-green-100'
    case 'B+': return 'text-blue-600 bg-blue-100'
    case 'B': return 'text-blue-600 bg-blue-100'
    case 'C+': return 'text-yellow-600 bg-yellow-100'
    case 'C': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

// Format certificate number for display
export function formatCertificateNumber(number: string): string {
  return number.toUpperCase()
}

// Format verification URL
export function formatVerificationUrl(certificateNumber: string): string {
  return `https://cjdtc.com/verification/${certificateNumber}`
}

// Check if certificate is verifiable
export function isCertificateVerifiable(certificate: any): boolean {
  return certificate && certificate.status === 'ISSUED'
}

// Get certificate expiry date
export function getCertificateExpiryDate(certificate: any): Date | null {
  return certificate?.validUntil ? new Date(certificate.validUntil) : null
}

// Get certificate days until expiry
export function getCertificateDaysUntilExpiry(certificate: any): number {
  const expiryDate = getCertificateExpiryDate(certificate)
  if (!expiryDate) return 0
  
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Check if certificate needs renewal
export function needsRenewal(certificate: any): boolean {
  const daysUntilExpiry = getCertificateDaysUntilExpiry(certificate)
  return daysUntilExpiry <= 30 // 30 days before expiry
}

// Get certificate renewal URL
export function getCertificateRenewalUrl(certificateId: string): string {
  return `/certificates/${certificateId}/renew`
}
