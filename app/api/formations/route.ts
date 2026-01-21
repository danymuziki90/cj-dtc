import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

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
    const formData = await req.formData()
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File | null

    if (!title || !slug) {
      return NextResponse.json({ error: 'Titre et slug requis' }, { status: 400 })
    }

    let imageUrl = null

    // If an image file is provided, convert to base64 data URL
    if (imageFile && imageFile.size > 0) {
      const buffer = await imageFile.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const mimeType = imageFile.type || 'image/jpeg'
      imageUrl = `data:${mimeType};base64,${base64}`
    }

    const created = await prisma.formation.create({
      data: {
        title,
        slug,
        description: description || '',
        imageUrl
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

