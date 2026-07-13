import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const faq = await prisma.fAQ.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error('Error GET /api/admin/marketing/faq:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await req.json()
    const { question, answer, category, order } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const created = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || 'General',
        order: order ?? 0
      }
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error POST /api/admin/marketing/faq:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
