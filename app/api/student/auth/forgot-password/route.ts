import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendPasswordResetEmail } from '@/lib/email'
import { createStudentPasswordResetToken } from '@/lib/auth-portal/password-reset'

const forgotSchema = z.object({
  email: z.string().email(),
})

const GENERIC_SUCCESS_MESSAGE =
  "Si un compte étudiant existe avec cet email, un lien de réinitialisation a été envoyé."

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = forgotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const result = await createStudentPasswordResetToken(parsed.data.email)
    if (result.found && result.rawToken) {
      await sendPasswordResetEmail(result.email, result.rawToken, '/student/reset-password')
    }

    return NextResponse.json({
      success: true,
      message: GENERIC_SUCCESS_MESSAGE,
    })
  } catch (error) {
    console.error('Student forgot-password error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue.' }, { status: 500 })
  }
}
