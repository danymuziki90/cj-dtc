import { NextResponse } from 'next/server'
import { z } from 'zod'
import { resetStudentPasswordFromToken } from '@/lib/auth-portal/password-reset'

export const runtime = 'nodejs'

const resetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = resetSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Donnees invalides' }, { status: 400 })
    }

    const reset = await resetStudentPasswordFromToken({
      token: result.data.token,
      newPassword: result.data.newPassword,
      syncUserPassword: true,
    })

    if (!reset.ok) {
      if (reset.reason === 'expired') {
        return NextResponse.json({ error: 'Token expire' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Token invalide ou expire' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe reinitialise avec succes',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
