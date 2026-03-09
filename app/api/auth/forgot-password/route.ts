import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendPasswordResetEmail } from '@/lib/email'
import { createStudentPasswordResetToken } from '@/lib/auth-portal/password-reset'

export const runtime = 'nodejs'

const forgotSchema = z.object({
  email: z.string().email(),
})

const GENERIC_SUCCESS_MESSAGE =
  'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = forgotSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const reset = await createStudentPasswordResetToken(result.data.email)
    if (reset.found && reset.rawToken) {
      await sendPasswordResetEmail(reset.email, reset.rawToken)
    }

    return NextResponse.json({ success: true, message: GENERIC_SUCCESS_MESSAGE })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
