import { NextResponse } from 'next/server'
import { z } from 'zod'
import { resetStudentPasswordFromToken } from '@/lib/auth-portal/password-reset'

const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = resetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Donnees invalides. Mot de passe minimum 8 caracteres.' },
        { status: 400 }
      )
    }

    const result = await resetStudentPasswordFromToken({
      token: parsed.data.token,
      newPassword: parsed.data.newPassword,
      syncUserPassword: true,
    })

    if (!result.ok) {
      const message = result.reason === 'expired' ? 'Token expire.' : 'Token invalide ou expire.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe reinitialise avec succes.',
    })
  } catch (error) {
    console.error('Student reset-password error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 })
  }
}
