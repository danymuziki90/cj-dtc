import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const runtime = "nodejs"

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([])
    }

    const list = await prisma.formation.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(list)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des formations' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      title, 
      description, 
      categorie, 
      duree, 
      modules, 
      methodes, 
      certification, 
      statut = 'brouillon',
      imageUrl 
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
    }

    // Générer un slug à partir du titre
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const created = await prisma.formation.create({
      data: {
        title,
        slug,
        description: description || '',
        categorie: categorie || '',
        duree: duree || '',
        modules: modules || '',
        methodes: methodes || '',
        certification: certification || '',
        statut,
        imageUrl: imageUrl || null
      }
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })
    }
    console.error('Formation creation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

