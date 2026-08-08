import { NextResponse } from 'next/server'
import { z } from 'zod'
import { resetStudentPasswordFromToken } from '@/lib/auth-portal/password-reset'

const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
  locale: z.enum(['fr', 'en']).optional().default('fr'),
})

function getResetMessages(locale: 'fr' | 'en') {
  return locale === 'en'
    ? {
        invalid: 'This reset link is invalid or has expired.',
        expired: 'This reset link has expired. Please request a new one.',
        success: 'Your password has been reset successfully.',
      }
    : {
        invalid: 'Ce lien de réinitialisation est invalide ou a expiré.',
        expired: 'Ce lien de réinitialisation a expiré. Demandez un nouveau lien.',
        success: 'Votre mot de passe a été réinitialisé avec succès.',
      }
}

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

    const messages = getResetMessages(parsed.data.locale)
    const result = await resetStudentPasswordFromToken({
      token: parsed.data.token,
      newPassword: parsed.data.newPassword,
      syncUserPassword: true,
    })

    if (!result.ok) {
      const message = result.reason === 'expired' ? messages.expired : messages.invalid
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: messages.success,
    })
  } catch (error) {
    console.error('Student reset-password error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 })
  }
}
