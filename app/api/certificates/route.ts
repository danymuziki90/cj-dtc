import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ valid: false })
    }

    const url = new URL(req.url, 'http://localhost')
    const code = url.searchParams.get('code')
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Code requis' }, { status: 400 })
    }
    const cert = await prisma.certificate.findUnique({
      where: { code },
      include: { formation: true, user: true }
    })
    if (!cert) {
      return NextResponse.json({ valid: false })
    }
    return NextResponse.json({
      valid: true,
      code: cert.code,
      holderName: cert.holderName,
      formation: cert.formation ? { title: cert.formation.title, slug: cert.formation.slug } : null,
      issuedAt: cert.issuedAt,
      verified: cert.verified,
      issuedBy: cert.issuedBy
    })
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Erreur lors de la vérification' }, { status: 500 })
  }
}
