'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Certificate {
  id: string
  userId: string
  userName: string
  userEmail: string
  formationId: number
  formationName: string
  sessionId?: number
  sessionName?: string
  instructorName: string
  issueDate: string
  expiryDate?: string
  certificateUrl: string
  qrCodeUrl: string
  verificationCode: string
  status: 'issued' | 'revoked' | 'expired'
  grade?: string
  hoursCompleted: number
  totalHours: number
  skills: string[]
  description: string
  template: string
  signatureUrl?: string
  watermarkUrl?: string
}

export const useCertificates = () => {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadUserCertificates = async () => {
    if (!session) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          userId: (session.user?.id as string) || 'anonymous',
          userName: (session.user?.name as string) || 'Anonymous',
          userEmail: session.user?.email || '',
          formationId: 1,
          formationName: 'Développement Web Full Stack',
          sessionId: 1,
          sessionName: 'Session Mars 2024',
          instructorName: 'Jean Dupont',
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          certificateUrl: '/certificates/cert-1.pdf',
          qrCodeUrl: '/certificates/qr-1.png',
          verificationCode: 'CERT-2024-001',
          status: 'issued',
          grade: 'A',
          hoursCompleted: 90,
          totalHours: 90,
          skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
          description: 'Certification complète en développement web full stack',
          template: 'modern',
          signatureUrl: '/signatures/instructor-1.png',
          watermarkUrl: '/watermarks/cj-dtc.png'
        }
      ]
      
      setCertificates(mockCertificates)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateCertificate = async (certificateData: Omit<Certificate, 'id' | 'certificateUrl' | 'qrCodeUrl' | 'verificationCode' | 'status'>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newCertificate: Certificate = {
        ...certificateData,
        id: Date.now().toString(),
        certificateUrl: `/certificates/cert-${Date.now()}.pdf`,
        qrCodeUrl: `/certificates/qr-${Date.now()}.png`,
        verificationCode: `CERT-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
        status: 'issued'
      }
      
      setCertificates(prev => [...prev, newCertificate])
      return newCertificate
    } catch (error) {
      console.error('Error generating certificate:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCertificate = async (verificationCode: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const certificate = certificates.find(cert => cert.verificationCode === verificationCode)
      
      if (!certificate) {
        return { valid: false, message: 'Certificat non trouvé' }
      }
      
      if (certificate.status === 'revoked') {
        return { valid: false, message: 'Certificat révoqué' }
      }
      
      if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) {
        return { valid: false, message: 'Certificat expiré' }
      }
      
      return { valid: true, certificate }
    } catch (error) {
      console.error('Error verifying certificate:', error)
      return { valid: false, message: 'Erreur lors de la vérification' }
    }
  }

  const revokeCertificate = async (id: string, reason: string) => {
    try {
      setCertificates(prev => 
        prev.map(cert => 
          cert.id === id 
            ? { ...cert, status: 'revoked' as const }
            : cert
        )
      )
      
      console.log(`Certificate ${id} revoked for reason: ${reason}`)
    } catch (error) {
      console.error('Error revoking certificate:', error)
      throw error
    }
  }

  const downloadCertificate = async (id: string) => {
    try {
      const certificate = certificates.find(cert => cert.id === id)
      if (!certificate) {
        throw new Error('Certificat non trouvé')
      }
      
      const link = document.createElement('a')
      link.href = certificate.certificateUrl
      link.download = `certificat-${certificate.verificationCode}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading certificate:', error)
      throw error
    }
  }

  const shareCertificate = async (id: string, platform: 'linkedin' | 'email' | 'whatsapp') => {
    try {
      const certificate = certificates.find(cert => cert.id === id)
      if (!certificate) {
        throw new Error('Certificat non trouvé')
      }
      
      const shareUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`
      const shareText = `J'ai obtenu ma certification en ${certificate.formationName} chez CJ DTC !`
      
      switch (platform) {
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
          break
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent('Certification CJ DTC')}&body=${encodeURIComponent(`${shareText}\n\nVérifiez mon certificat : ${shareUrl}`)}`
          break
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')
          break
      }
    } catch (error) {
      console.error('Error sharing certificate:', error)
      throw error
    }
  }

  const getCertificateStats = () => {
    const total = certificates.length
    const issued = certificates.filter(cert => cert.status === 'issued').length
    const revoked = certificates.filter(cert => cert.status === 'revoked').length
    const expired = certificates.filter(cert => cert.status === 'expired').length
    
    return {
      total,
      issued,
      revoked,
      expired,
      completionRate: total > 0 ? (issued / total) * 100 : 0
    }
  }

  return {
    certificates,
    isLoading,
    loadUserCertificates,
    generateCertificate,
    verifyCertificate,
    revokeCertificate,
    downloadCertificate,
    shareCertificate,
    getCertificateStats
  }
}
