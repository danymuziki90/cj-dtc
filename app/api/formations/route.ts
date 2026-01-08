import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const list = await prisma.formation.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des formations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Titre et slug requis' }, { status: 400 })
    }
    const created = await prisma.formation.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || ''
      }
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
