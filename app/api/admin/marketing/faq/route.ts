import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const faqSchema = z.object({
  question: z.string().trim().min(1, 'La question est obligatoire'),
  answer: z.string().trim().min(1, 'La réponse est obligatoire'),
  category: z.string().trim().optional().default('General'),
  order: z.union([z.number(), z.string()]).optional().transform(val => val !== undefined ? Number(val) : 0)
})

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions)
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
    const session: any = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const parsed = faqSchema.safeParse(await req.json())
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { question, answer, category, order } = parsed.data

    const created = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category,
        order
      }
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error POST /api/admin/marketing/faq:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
