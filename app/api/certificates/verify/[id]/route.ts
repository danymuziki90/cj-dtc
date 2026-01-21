import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simuler la vérification (en réalité, viendra de la base de données)
    const certificates = [
      {
        id: 'CJ-2025-001-ABC123',
        studentName: 'Étudiant Test',
        studentEmail: 'student@example.com',
        formationTitle: 'Développement Web',
        formationCategorie: 'Programmation',
        completionDate: '2025-06-15',
        grade: 18,
        uniqueId: 'CJ-2025-001-ABC123',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CJ-2025-001-ABC123',
        certificateUrl: 'https://example.com/certificates/CJ-2025-001-ABC123.pdf',
        status: 'verified',
        createdAt: '2025-06-15T10:00:00Z'
      }
    ]

    const certificate = certificates.find(cert => cert.id === id)

    if (!certificate) {
      return NextResponse.json({ error: 'Certificat non trouvé' }, { status: 404 })
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
