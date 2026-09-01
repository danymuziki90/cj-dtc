import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/admin/auth'
import { directorWelcomeDefaults } from '@/lib/director-welcome'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  if (!(await verifyAdminToken(request)).admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const content = await prisma.directorWelcome.findUnique({ where: { id: 'director-welcome' } })
  return NextResponse.json({ content: { ...directorWelcomeDefaults, ...content } })
}

export async function PUT(request: NextRequest) {
  if (!(await verifyAdminToken(request)).admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const data = {
    isActive: Boolean(body.isActive), imageUrl: body.imageUrl || null, name: body.name || null,
    titleFr: body.titleFr || null, titleEn: body.titleEn || null,
    messageFr: body.messageFr || null, messageEn: body.messageEn || null,
  }
  const content = await prisma.directorWelcome.upsert({ where: { id: 'director-welcome' }, update: data, create: { id: 'director-welcome', ...data } })
  revalidatePath('/fr')
  revalidatePath('/en')
  return NextResponse.json({ content })
}
