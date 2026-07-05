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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type BrandedEmailAction = {
  label: string
  href: string
}

type BrandedEmailLayoutOptions = {
  eyebrow: string
  title: string
  introHtml: string
  bodyHtml: string
  badgeHtml?: string
  action?: BrandedEmailAction | null
  actionHintHtml?: string
  footerHtml?: string
}

function getSupportEmail() {
  return process.env.CONTACT_EMAIL || process.env.MAIL_USER || 'contact@cjdevelopmenttc.org'
}

function toPlainTextEmail(lines: Array<string | null | undefined>) {
  return lines.filter((line): line is string => Boolean(line && line.trim())).join('\n')
}

function renderBrandedEmailLayout(options: BrandedEmailLayoutOptions) {
  const supportEmail = escapeHtml(getSupportEmail())
  const actionBlock = options.action
    ? `
        <tr>
          <td style="padding: 24px 32px 0 32px;">
            <a href="${escapeHtml(options.action.href)}" style="display: inline-block; border-radius: 16px; background: #e30613; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 22px;">
              ${escapeHtml(options.action.label)}
            </a>
          </td>
        </tr>
      `
    : ''
  const actionHintBlock = options.actionHintHtml
    ? `
        <tr>
          <td style="padding: 14px 32px 0 32px;">
            <div style="font-size: 13px; line-height: 1.7; color: #64748b;">
              ${options.actionHintHtml}
            </div>
          </td>
        </tr>
      `
    : ''
  const badgeBlock = options.badgeHtml
    ? `
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            ${options.badgeHtml}
          </td>
        </tr>
      `
    : ''
  const footerHtml =
    options.footerHtml ||
    `Besoin d'aide ? Contactez-nous via <a href="mailto:${supportEmail}" style="color: #003b9d; text-decoration: none; font-weight: 700;">${supportEmail}</a>.<br />Cet e-mail vous a ete envoye automatiquement par CJ DTC.`

  return `
    <div style="margin: 0; padding: 24px 12px; background: #eef3f9; font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; overflow: hidden; border-radius: 28px; background: #ffffff; border: 1px solid #dbe6f5; box-shadow: 0 24px 70px -38px rgba(15, 23, 42, 0.35);">
              <tr>
                <td style="background: linear-gradient(135deg, #001f5c 0%, #003b9d 68%, #e30613 100%); padding: 32px;">
                  <div style="display: inline-block; padding: 7px 12px; border-radius: 999px; background: rgba(255,255,255,0.14); color: #dbeafe; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">
                    ${escapeHtml(options.eyebrow)}
                  </div>
                  <div style="margin-top: 18px; font-size: 30px; line-height: 1.2; font-weight: 700; color: #ffffff;">
                    ${escapeHtml(options.title)}
                  </div>
                  <div style="margin-top: 12px; max-width: 520px; font-size: 15px; line-height: 1.7; color: #dbeafe;">
                    CJ DTC vous accompagne avec un message clair, professionnel et directement exploitable.
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 32px 32px 12px 32px;">
                  <div style="font-size: 15px; line-height: 1.8; color: #334155;">
                    ${options.introHtml}
                  </div>
                </td>
              </tr>

              ${badgeBlock}

              <tr>
                <td style="padding: 0 32px 0 32px;">
                  ${options.bodyHtml}
                </td>
              </tr>

              ${actionBlock}
              ${actionHintBlock}

              <tr>
                <td style="padding: 24px 32px 32px 32px;">
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; line-height: 1.8; color: #64748b;">
                    ${footerHtml}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
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
  const safeResetLink = escapeHtml(resetLink)
  const subject = 'Reinitialisation de mot de passe'
  const text = toPlainTextEmail([
    'Reinitialisation de mot de passe',
    '',
    'Utilisez le lien ci-dessous pour definir un nouveau mot de passe.',
    `Lien de reinitialisation: ${resetLink}`,
    'Expiration: 1 heure.',
    "Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet e-mail.",
    `Support: ${getSupportEmail()}`,
  ])

  return sendEmail({
    to: email,
    subject,
    text,
    html: renderBrandedEmailLayout({
      eyebrow: 'Securite compte',
      title: 'Reinitialisez votre mot de passe',
      introHtml:
        'Nous avons recu une demande de reinitialisation de mot de passe pour votre compte CJ DTC. Utilisez le lien securise ci-dessous pour definir un nouveau mot de passe.',
      badgeHtml:
        '<div style="display: inline-block; border-radius: 999px; background: #eef4ff; color: #002d72; border: 1px solid #c9d9ff; padding: 8px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">Lien valable pendant 1 heure</div>',
      bodyHtml: `
        <div style="border: 1px solid #d7e3ff; border-radius: 22px; background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%); padding: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-weight: 700; margin-bottom: 8px;">
            Lien de reinitialisation
          </div>
          <div style="font-size: 14px; line-height: 1.8; color: #334155;">
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Si le bouton ne fonctionne pas, utilisez ce lien direct:<br />
            <a href="${safeResetLink}" style="color: #003b9d; text-decoration: none; word-break: break-all;">${safeResetLink}</a>
          </div>
        </div>
        <div style="margin-top: 16px; border-radius: 22px; background: #0f172a; padding: 22px 24px; color: #e2e8f0;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #93c5fd; font-weight: 700; margin-bottom: 10px;">
            Protection du compte
          </div>
          <div style="font-size: 14px; line-height: 1.8;">
            Si vous n'etes pas a l'origine de cette demande, ignorez cet e-mail. Votre mot de passe actuel restera actif tant qu'aucune modification n'est confirmee.
          </div>
        </div>
      `,
      action: {
        label: 'Definir un nouveau mot de passe',
        href: resetLink,
      },
      actionHintHtml:
        'Par mesure de securite, ce lien expire automatiquement apres 1 heure.',
    }),
  })
}

export async function sendStudentPortalAccessEmail(params: StudentPortalAccessEmailParams) {
  const loginLink = `${params.appBaseUrl.replace(/\/+$/, '')}/student/login`
  const hasPassword = Boolean(params.password)
  const supportEmail = process.env.CONTACT_EMAIL || process.env.MAIL_USER || 'contact@cjdevelopmenttc.org'
  const safeFullName = escapeHtml(params.fullName)
  const safeUsername = escapeHtml(params.username)
  const safePassword = params.password ? escapeHtml(params.password) : ''
  const safeSessionTitle = params.sessionTitle ? escapeHtml(params.sessionTitle) : null
  const safeLoginLink = escapeHtml(loginLink)
  const safeSupportEmail = escapeHtml(supportEmail)

  const subject = hasPassword
    ? 'Vos acces a l espace etudiant CJ DTC'
    : 'Mise a jour de vos acces a l espace etudiant CJ DTC'

  const sessionBadge = safeSessionTitle
    ? `
        <tr>
          <td style="padding: 0 32px 20px 32px;">
            <div style="display: inline-block; border-radius: 999px; background: #eef4ff; color: #002d72; border: 1px solid #c9d9ff; padding: 8px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">
              Session: ${safeSessionTitle}
            </div>
          </td>
        </tr>
      `
    : ''

  const passwordBlock = hasPassword
    ? `
        <tr>
          <td style="padding: 0 32px 0 32px;">
            <div style="border: 1px solid #d7e3ff; border-radius: 18px; background: #ffffff; padding: 18px 20px; margin-top: 12px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; font-weight: 700; margin-bottom: 8px;">Mot de passe temporaire</div>
              <div style="font-size: 18px; line-height: 1.5; color: #0f172a; font-weight: 700;">${safePassword}</div>
            </div>
          </td>
        </tr>
      `
    : `
        <tr>
          <td style="padding: 0 32px 0 32px;">
            <div style="border: 1px solid #d7e3ff; border-radius: 18px; background: #ffffff; padding: 18px 20px; margin-top: 12px; color: #334155; font-size: 14px; line-height: 1.7;">
              Votre mot de passe a ete mis a jour. Utilisez les nouveaux acces communiques par l'administration pour vous connecter.
            </div>
          </td>
        </tr>
      `

  const text = [
    `Bonjour ${params.fullName},`,
    '',
    `Votre compte etudiant CJ DTC est pret${params.sessionTitle ? ` pour la session ${params.sessionTitle}` : ''}.`,
    `Nom d'utilisateur: ${params.username}`,
    hasPassword
      ? `Mot de passe temporaire: ${params.password}`
      : "Votre mot de passe a ete mis a jour. Utilisez les nouveaux acces communiques par l'administration.",
    `Connexion: ${loginLink}`,
    'Nous vous recommandons de modifier votre mot de passe apres votre premiere connexion.',
    `Support: ${supportEmail}`,
  ].join('\n')

  return sendEmail({
    to: params.to,
    subject,
    text,
    html: `
      <div style="margin: 0; padding: 24px 12px; background: #eef3f9; font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto; border-collapse: collapse;">
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; overflow: hidden; border-radius: 28px; background: #ffffff; border: 1px solid #dbe6f5; box-shadow: 0 24px 70px -38px rgba(15, 23, 42, 0.35);">
                <tr>
                  <td style="background: linear-gradient(135deg, #001f5c 0%, #003b9d 68%, #e30613 100%); padding: 32px;">
                    <div style="display: inline-block; padding: 7px 12px; border-radius: 999px; background: rgba(255,255,255,0.14); color: #dbeafe; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">
                      CJ DTC
                    </div>
                    <div style="margin-top: 18px; font-size: 30px; line-height: 1.2; font-weight: 700; color: #ffffff;">
                      Vos acces a l'espace etudiant sont prets
                    </div>
                    <div style="margin-top: 12px; max-width: 520px; font-size: 15px; line-height: 1.7; color: #dbeafe;">
                      Retrouvez ci-dessous vos identifiants de connexion et le lien direct vers votre espace etudiant.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 32px 32px 12px 32px;">
                    <div style="font-size: 22px; line-height: 1.35; font-weight: 700; color: #0f172a;">
                      Bonjour ${safeFullName},
                    </div>
                    <div style="margin-top: 12px; font-size: 15px; line-height: 1.8; color: #334155;">
                      Votre compte etudiant CJ DTC est maintenant actif${safeSessionTitle ? ` pour la session <strong style="color: #002d72;">${safeSessionTitle}</strong>` : ''}. Gardez ces informations en lieu sur et utilisez-les pour acceder a votre espace personnel.
                    </div>
                  </td>
                </tr>

                ${sessionBadge}

                <tr>
                  <td style="padding: 0 32px 0 32px;">
                    <div style="border: 1px solid #d7e3ff; border-radius: 22px; background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%); padding: 20px;">
                      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-weight: 700; margin-bottom: 8px;">
                        Identifiants de connexion
                      </div>
                      <div style="border: 1px solid #d7e3ff; border-radius: 18px; background: #ffffff; padding: 18px 20px; margin-top: 12px;">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; font-weight: 700; margin-bottom: 8px;">Nom d'utilisateur</div>
                        <div style="font-size: 18px; line-height: 1.5; color: #0f172a; font-weight: 700;">${safeUsername}</div>
                      </div>
                    </div>
                  </td>
                </tr>

                ${passwordBlock}

                <tr>
                  <td style="padding: 24px 32px 0 32px;">
                    <a href="${safeLoginLink}" style="display: inline-block; border-radius: 16px; background: #e30613; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 22px;">
                      Acceder a l'espace etudiant
                    </a>
                    <div style="margin-top: 14px; font-size: 13px; line-height: 1.7; color: #64748b;">
                      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br />
                      <a href="${safeLoginLink}" style="color: #003b9d; text-decoration: none; word-break: break-all;">${safeLoginLink}</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 32px 0 32px;">
                    <div style="border-radius: 22px; background: #0f172a; padding: 22px 24px; color: #e2e8f0;">
                      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #93c5fd; font-weight: 700; margin-bottom: 10px;">
                        Bonnes pratiques
                      </div>
                      <div style="font-size: 14px; line-height: 1.8;">
                        1. Connectez-vous des reception de cet e-mail.<br />
                        2. Modifiez votre mot de passe apres votre premiere connexion.<br />
                        3. Conservez vos identifiants de maniere confidentielle.
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 32px 32px 32px;">
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; line-height: 1.8; color: #64748b;">
                      Besoin d'aide ? Contactez-nous via <a href="mailto:${safeSupportEmail}" style="color: #003b9d; text-decoration: none; font-weight: 700;">${safeSupportEmail}</a>.<br />
                      Cet e-mail vous a ete envoye automatiquement par CJ DTC.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
  const appBaseUrl = resolveAppBaseUrl()
  const safeFormationTitle = escapeHtml(formationTitle)
  const subject = 'Felicitations ! Votre inscription a ete acceptee'
  const text = toPlainTextEmail([
    'Inscription acceptee',
    '',
    `Votre inscription a la formation ${formationTitle} a ete acceptee.`,
    'Notre equipe vous transmettra prochainement les informations pratiques utiles.',
    `Site CJ DTC: ${appBaseUrl}`,
    `Support: ${getSupportEmail()}`,
  ])

  return sendEmail({
    to: email,
    subject,
    text,
    html: renderBrandedEmailLayout({
      eyebrow: 'Admission',
      title: 'Votre inscription est acceptee',
      introHtml: `Votre candidature pour la formation <strong style="color: #002d72;">${safeFormationTitle}</strong> a ete validee par notre equipe.`,
      badgeHtml:
        '<div style="display: inline-block; border-radius: 999px; background: #ecfdf3; color: #047857; border: 1px solid #a7f3d0; padding: 8px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">Admission confirmee</div>',
      bodyHtml: `
        <div style="border: 1px solid #d7e3ff; border-radius: 22px; background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%); padding: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-weight: 700; margin-bottom: 8px;">
            Formation retenue
          </div>
          <div style="font-size: 20px; line-height: 1.5; color: #0f172a; font-weight: 700;">${safeFormationTitle}</div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 1.8; color: #334155;">
            Votre dossier est maintenant retenu. Surveillez votre boite mail: les prochaines consignes pratiques, dates utiles et informations de demarrage vous seront partagees prochainement.
          </div>
        </div>
        <div style="margin-top: 16px; border-radius: 22px; background: #0f172a; padding: 22px 24px; color: #e2e8f0;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #93c5fd; font-weight: 700; margin-bottom: 10px;">
            Prochaines etapes
          </div>
          <div style="font-size: 14px; line-height: 1.8;">
            1. Surveillez vos prochains e-mails de confirmation.<br />
            2. Preparez les elements administratifs demandes si besoin.<br />
            3. Contactez notre equipe en cas de question avant le demarrage.
          </div>
        </div>
      `,
      action: {
        label: 'Consulter le site CJ DTC',
        href: appBaseUrl,
      },
      actionHintHtml:
        'Nous restons disponibles pour toute precision complementaire sur votre admission.',
    }),
  })
}

export async function sendRejectionEmail(email: string, formationTitle: string, reason?: string) {
  const supportEmail = getSupportEmail()
  const safeFormationTitle = escapeHtml(formationTitle)
  const safeReason = reason ? escapeHtml(reason) : null
  const subject = "Votre inscription n'a pas ete retenue"
  const text = toPlainTextEmail([
    'Inscription non retenue',
    '',
    `Votre inscription a la formation ${formationTitle} n'a pas ete retenue.`,
    reason ? `Motif: ${reason}` : null,
    'Vous pouvez reprendre contact avec notre equipe pour etre oriente vers une autre opportunite.',
    `Support: ${supportEmail}`,
  ])

  return sendEmail({
    to: email,
    subject,
    text,
    html: renderBrandedEmailLayout({
      eyebrow: 'Suivi candidature',
      title: 'Votre inscription n a pas ete retenue',
      introHtml: `Apres examen de votre dossier pour la formation <strong style="color: #002d72;">${safeFormationTitle}</strong>, nous ne pouvons pas donner une suite favorable a cette candidature pour le moment.`,
      badgeHtml:
        '<div style="display: inline-block; border-radius: 999px; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; padding: 8px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">Decision non favorable</div>',
      bodyHtml: `
        <div style="border: 1px solid #fde2e8; border-radius: 22px; background: linear-gradient(180deg, #fff7f8 0%, #ffffff 100%); padding: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #9f1239; font-weight: 700; margin-bottom: 8px;">
            Formation concernee
          </div>
          <div style="font-size: 20px; line-height: 1.5; color: #0f172a; font-weight: 700;">${safeFormationTitle}</div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 1.8; color: #334155;">
            Cette decision ne remet pas en cause votre interet pour nos programmes. D'autres opportunites peuvent mieux correspondre a votre profil ou a vos disponibilites.
          </div>
        </div>
        ${
          safeReason
            ? `<div style="margin-top: 16px; border: 1px solid #fecdd3; border-radius: 22px; background: #fff1f2; padding: 20px;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #9f1239; font-weight: 700; margin-bottom: 8px;">
                  Motif communique
                </div>
                <div style="font-size: 14px; line-height: 1.8; color: #4c0519;">${safeReason}</div>
              </div>`
            : ''
        }
        <div style="margin-top: 16px; border-radius: 22px; background: #0f172a; padding: 22px 24px; color: #e2e8f0;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #93c5fd; font-weight: 700; margin-bottom: 10px;">
            Suite possible
          </div>
          <div style="font-size: 14px; line-height: 1.8;">
            Si vous souhaitez explorer une autre formation ou obtenir plus d'explications, notre equipe peut vous orienter vers la meilleure suite a donner.
          </div>
        </div>
      `,
      action: {
        label: 'Contacter notre equipe',
        href: `mailto:${supportEmail}`,
      },
      actionHintHtml:
        'Vous pouvez repondre a cet accompagnement en nous ecrivant directement pour etudier une autre option.',
    }),
  })
}
