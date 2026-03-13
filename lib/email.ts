import * as nodemailer from 'nodemailer'

export type EmailMessage = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

type StudentPortalAccessEmailParams = {
  to: string
  fullName: string
  username: string
  password?: string
  appBaseUrl: string
  sessionTitle?: string | null
}

let cachedTransporter: nodemailer.Transporter | null = null
let cachedTransporterConfigKey: string | null = null

function getMailTransporter() {
  const host = process.env.MAIL_HOST
  const port = Number(process.env.MAIL_PORT || 587)
  const user = process.env.MAIL_USER
  const pass = process.env.MAIL_PASSWORD
  const secure = process.env.MAIL_SECURE === 'true'
  const tlsServername = process.env.MAIL_TLS_SERVERNAME?.trim() || undefined

  if (!host || !user || !pass) {
    return null
  }

  const configKey = JSON.stringify({ host, port, user, secure, tlsServername })

  if (!cachedTransporter || cachedTransporterConfigKey !== configKey) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: tlsServername
        ? {
            servername: tlsServername,
          }
        : undefined,
    })
    cachedTransporterConfigKey = configKey
  }

  return cachedTransporter
}

function normalizeMessage(
  messageOrTo: EmailMessage | string,
  subject?: string,
  html?: string
): EmailMessage {
  if (typeof messageOrTo === 'string') {
    if (!subject || !html) {
      throw new Error('sendEmail requires subject and html when called with positional arguments.')
    }

    return {
      to: messageOrTo,
      subject,
      html,
    }
  }

  return messageOrTo
}

function resolveMailFrom(message: EmailMessage) {
  return message.from || process.env.MAIL_FROM || process.env.MAIL_USER || 'no-reply@localhost'
}

export function resolveAppBaseUrl(requestUrl?: string) {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_RES_URL || process.env.NEXTAUTH_URL

  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '')
  }

  if (requestUrl) {
    const url = new URL(requestUrl)
    return `${url.protocol}//${url.host}`
  }

  return 'http://localhost:3000'
}

export async function sendEmail(
  messageOrTo: EmailMessage | string,
  subject?: string,
  html?: string
) {
  const message = normalizeMessage(messageOrTo, subject, html)
  const transporter = getMailTransporter()

  if (!transporter) {
    console.log('---------------------------------------------------------')
    console.log(`MOCK EMAIL TO: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`)
    console.log(`SUBJECT: ${message.subject}`)
    console.log(`CONTENT: ${message.html.substring(0, 160)}...`)
    console.log('---------------------------------------------------------')

    return { success: true, mock: true }
  }

  const result = await transporter.sendMail({
    from: resolveMailFrom(message),
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })

  return {
    success: true,
    mock: false,
    messageId: result.messageId,
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${resolveAppBaseUrl()}/api/auth/verify?token=${token}`

  return sendEmail({
    to: email,
    subject: 'Verifiez votre compte CJ DTC',
    html: `
      <h2>Verification de compte</h2>
      <p>Confirmez votre adresse email en cliquant sur le lien suivant:</p>
      <p><a href="${confirmLink}">${confirmLink}</a></p>
    `,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  resetPath: string = '/auth/reset-password'
) {
  const resetLink = `${resolveAppBaseUrl()}${resetPath}?token=${token}`

  return sendEmail({
    to: email,
    subject: 'Reinitialisation de mot de passe',
    html: `
      <h2>Reinitialisation de mot de passe</h2>
      <p>Utilisez le lien suivant pour definir un nouveau mot de passe:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Expiration: 1 heure.</p>
    `,
  })
}

export async function sendStudentPortalAccessEmail(params: StudentPortalAccessEmailParams) {
  const loginLink = `${params.appBaseUrl.replace(/\/+$/, '')}/student/login`
  const hasPassword = Boolean(params.password)

  return sendEmail({
    to: params.to,
    subject: hasPassword
      ? 'Vos acces a l espace etudiant CJ DTC'
      : 'Mise a jour de vos acces a l espace etudiant CJ DTC',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px; color: #002D72;">Bonjour ${params.fullName},</h2>
        <p style="margin: 0 0 16px;">
          Votre compte etudiant CJ DTC est pret${params.sessionTitle ? ` pour la session <strong>${params.sessionTitle}</strong>` : ''}.
        </p>
        <div style="padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #dbeafe; margin-bottom: 16px;">
          <p style="margin: 0 0 8px;"><strong>Nom d utilisateur:</strong> ${params.username}</p>
          ${
            hasPassword
              ? `<p style="margin: 0;"><strong>Mot de passe initial:</strong> ${params.password}</p>`
              : '<p style="margin: 0;">Votre mot de passe a ete mis a jour. Utilisez les nouveaux acces communiques par l administration.</p>'
          }
        </div>
        <p style="margin: 0 0 16px;">
          Connexion: <a href="${loginLink}" style="color: #E30613;">${loginLink}</a>
        </p>
        <p style="margin: 0; color: #475569;">
          Nous vous recommandons de modifier votre mot de passe apres votre premiere connexion.
        </p>
      </div>
    `,
  })
}

export async function withEmailTimeout<T>(operation: Promise<T>, timeoutMs = Number(process.env.EMAIL_DELIVERY_TIMEOUT_MS || 8000)) {
  let timer: NodeJS.Timeout | null = null

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Email delivery timed out after ${timeoutMs}ms.`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function sendAcceptanceEmail(email: string, formationTitle: string) {
  return sendEmail({
    to: email,
    subject: 'Felicitations ! Votre inscription a ete acceptee',
    html: `
      <h2>Inscription acceptee</h2>
      <p>Votre inscription a la formation <strong>${formationTitle}</strong> a ete acceptee.</p>
    `,
  })
}

export async function sendRejectionEmail(email: string, formationTitle: string, reason?: string) {
  return sendEmail({
    to: email,
    subject: "Votre inscription n'a pas ete retenue",
    html: `
      <h2>Inscription non retenue</h2>
      <p>Votre inscription a la formation <strong>${formationTitle}</strong> n'a pas ete retenue.</p>
      ${reason ? `<p>Motif: ${reason}</p>` : ''}
    `,
  })
}
