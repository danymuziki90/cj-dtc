import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const newsSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  published: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ news })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const parsed = newsSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const article = await prisma.news.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      published: parsed.data.published ?? false,
    },
  })

  return NextResponse.json({ article }, { status: 201 })
}
