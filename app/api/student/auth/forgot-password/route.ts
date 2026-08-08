import { NextResponse } from 'next/server'
import { z } from 'zod'
import { resolveAppBaseUrl, sendPasswordResetEmail } from '@/lib/email'
import { createStudentPasswordResetToken } from '@/lib/auth-portal/password-reset'

const forgotSchema = z.object({
  email: z.string().email(),
  locale: z.enum(['fr', 'en']).optional().default('fr'),
})

function getForgotPasswordMessages(locale: 'fr' | 'en') {
  return locale === 'en'
    ? {
        success: 'If an account is associated with this email address, you will receive a password reset link shortly.',
        unavailable: 'We are unable to send the email right now. Please try again in a few minutes.',
      }
    : {
        success: 'Si un compte associé à cette adresse existe, vous recevrez prochainement un lien permettant de réinitialiser votre mot de passe.',
        unavailable: 'Impossible d envoyer l e-mail pour le moment. Veuillez réessayer dans quelques instants.',
      }
}

export async function POST(req: Request) {
  let locale: 'fr' | 'en' = 'fr'
  try {
    const body = await req.json()
    const parsed = forgotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const { email, locale: requestedLocale } = parsed.data
    locale = requestedLocale
    const messages = getForgotPasswordMessages(locale)
    const result = await createStudentPasswordResetToken(email)
    if (result.found && result.rawToken) {
      const appBaseUrl = resolveAppBaseUrl(req.url)
      await sendPasswordResetEmail(
        result.email,
        result.rawToken,
        `/${locale}/auth/reset-password`,
        appBaseUrl,
      )
      console.info('[password-reset] Reset link sent', { studentId: result.studentId, locale })
    } else {
      console.info('[password-reset] Request for unknown account')
    }

    return NextResponse.json({
      success: true,
      message: messages.success,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error'
    const category = message.startsWith('APP_URL_MISSING')
      ? 'app_url_configuration'
      : message.startsWith('MAIL_CONFIGURATION_MISSING')
      ? 'mail_configuration'
      : 'delivery_or_database'
    console.error('[password-reset] Request failed', { category, message })
    return NextResponse.json(
      { error: getForgotPasswordMessages(locale).unavailable },
      { status: 503 }
    )
  }
}
