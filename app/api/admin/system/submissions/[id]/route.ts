import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const parsed = updateStatusSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const submission = await prisma.studentSubmission.update({
    where: { id },
    data: {
      status: parsed.data.status,
    },
  })

  return NextResponse.json({ submission })
}
