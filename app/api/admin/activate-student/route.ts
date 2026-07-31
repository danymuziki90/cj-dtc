import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

const activateStudentSchema = z.object({
  email: z.string().trim().email('Email invalide')
})

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const parsed = activateStudentSchema.safeParse(await req.json())
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { email } = parsed.data

    const student = await prisma.student.update({
      where: { email },
      data: { status: 'ACTIVE' },
    })

    return NextResponse.json({
      success: true,
      message: 'Étudiant activé',
      student: { email: student.email, status: student.status },
    })
  } catch (error: any) {
    console.error('Error activating student:', error)
    return NextResponse.json({ error: "Erreur lors de l'activation" }, { status: 500 })
  }
}
