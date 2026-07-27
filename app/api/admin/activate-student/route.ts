import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

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
