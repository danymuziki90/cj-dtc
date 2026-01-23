import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request) {
  try {
    // If DATABASE_URL is not set (e.g. during certain build environments),
    // return an empty list to avoid build-time failures on platforms like Vercel.
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([])
    }

    const url = new URL(req.url, 'http://localhost')
    const { searchParams } = url
    const limit = parseInt(searchParams.get('limit') || '10')
    const published = searchParams.get('published') === 'true'

    const where = published ? { published: true } : {}

    const list = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des articles', details: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string | null
    const content = formData.get('content') as string
    const published = formData.get('published') === 'true'
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

    const created = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || '',
        imageUrl,
        published: !!published
      }
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })
    }
    console.error('Article creation error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

