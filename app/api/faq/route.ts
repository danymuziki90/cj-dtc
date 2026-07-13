import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const faq = await prisma.fAQ.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    })
    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error GET /api/faq:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
