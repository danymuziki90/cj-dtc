import * as nodemailer from 'nodemailer'

export type EmailMessage = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
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

export function renderBrandedEmailLayout(options: BrandedEmailLayoutOptions) {
  const supportEmail = escapeHtml(getSupportEmail())
  const actionBlock = options.action
    ? `
        <tr>
          <td style="padding: 24px 32px 0 32px;">
            <a href="${escapeHtml(options.action.href)}" style="display: inline-block; border-radius: 6px; background: #1a1a2e; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; letter-spacing: 0.02em;">
              ${escapeHtml(options.action.label)}
            </a>
          </td>
        </tr>
      `
    : ''
  const actionHintBlock = options.actionHintHtml
    ? `
        <tr>
          <td style="padding: 12px 32px 0 32px;">
            <div style="font-size: 13px; line-height: 1.7; color: #94a3b8;">
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
    `Besoin d'aide ? Contactez-nous via <a href="mailto:${supportEmail}" style="color: #1a1a2e; text-decoration: none; font-weight: 700;">${supportEmail}</a>.<br />Cet e-mail vous a ete envoye automatiquement par CJ DTC.`

  return `
    <div style="margin: 0; padding: 32px 16px; background: #f5f5f5; font-family: Arial, Helvetica, sans-serif; color: #1e293b;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0;">

              <tr>
                <td style="padding: 24px 32px 20px 32px; border-bottom: 3px solid #1a1a2e;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <tr>
                      <td>
                        <div style="font-size: 20px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.02em;">CJ DTC</div>
                        <div style="font-size: 10px; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px;">CJ Development Training Center</div>
                      </td>
                      <td style="text-align: right; vertical-align: middle;">
                        <div style="display: inline-block; padding: 4px 10px; background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
                          ${escapeHtml(options.eyebrow)}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 32px 32px 0 32px;">
                  <div style="font-size: 24px; line-height: 1.3; font-weight: 700; color: #0f172a;">
                    ${escapeHtml(options.title)}
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 14px 32px 16px 32px;">
                  <div style="font-size: 15px; line-height: 1.8; color: #475569;">
                    ${options.introHtml}
                  </div>
                </td>
              </tr>

              ${badgeBlock}

              <tr>
                <td style="padding: 0 32px;">
                  <div style="border-top: 1px solid #f1f5f9;"></div>
                </td>
              </tr>

              <tr>
                <td style="padding: 20px 32px 0 32px;">
                  ${options.bodyHtml}
                </td>
              </tr>

              ${actionBlock}
              ${actionHintBlock}

              <tr>
                <td style="padding: 28px 32px 32px 32px;">
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; line-height: 1.8; color: #94a3b8;">
                    ${footerHtml}
                  </div>
                </td>
              </tr>

            </table>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-top: 16px;">
              <tr>
                <td style="padding: 0 8px; text-align: center;">
                  <div style="font-size: 11px; color: #94a3b8; line-height: 1.7;">
                    CJ Development Training Center &bull; E-mail automatique &bull; Ne pas repondre directement a ce message
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

  if (process.env.NODE_ENV === 'production') {
    throw new Error('APP_URL_MISSING: NEXT_PUBLIC_APP_URL (ou NEXTAUTH_URL) doit etre configuree en production.')
  }

  if (requestUrl) {
    try {
      const url = new URL(requestUrl, 'http://localhost:3000')
      return `${url.protocol}//${url.host}`
    } catch {
      return 'http://localhost:3000'
    }
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
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MAIL_CONFIGURATION_MISSING: MAIL_HOST, MAIL_USER et MAIL_PASSWORD sont requis en production.')
    }

    console.log('---------------------------------------------------------')
    console.log(`MOCK EMAIL TO: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`)
    if (message.replyTo) {
      console.log(`REPLY-TO: ${message.replyTo}`)
    }
    console.log(`SUBJECT: ${message.subject}`)
    console.log(`CONTENT: ${message.html.substring(0, 160)}...`)
    console.log('---------------------------------------------------------')

    return { success: true, mock: true }
  }

  const result = await transporter.sendMail({
    from: resolveMailFrom(message),
    to: message.to,
    replyTo: message.replyTo,
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
  resetPath: string = '/auth/reset-password',
  appBaseUrl?: string,
) {
  const resetLink = `${(appBaseUrl || resolveAppBaseUrl()).replace(/\/+$/, '')}${resetPath}?token=${token}`
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
        '<div style="display: inline-block; background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">Lien valable pendant 1 heure</div>',
      bodyHtml: `
        <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
            Lien de reinitialisation
          </div>
          <div style="font-size: 14px; line-height: 1.8; color: #334155;">
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Si le bouton ne fonctionne pas, utilisez ce lien direct:<br />
            <a href="${safeResetLink}" style="color: #1a1a2e; text-decoration: none; word-break: break-all; font-weight: 600;">${safeResetLink}</a>
          </div>
        </div>
        <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
            Protection du compte
          </div>
          <div style="font-size: 14px; line-height: 1.8; color: #475569;">
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
            <div style="display: inline-block; background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">
              Session : ${safeSessionTitle}
            </div>
          </td>
        </tr>
      `
    : ''

  const passwordBlock = hasPassword
    ? `
        <tr>
          <td style="padding: 12px 32px 0 32px;">
            <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 16px 20px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Mot de passe temporaire</div>
              <div style="font-size: 18px; line-height: 1.5; color: #0f172a; font-weight: 700; letter-spacing: 0.04em;">${safePassword}</div>
            </div>
          </td>
        </tr>
      `
    : `
        <tr>
          <td style="padding: 12px 32px 0 32px;">
            <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 16px 20px; color: #475569; font-size: 14px; line-height: 1.7;">
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
      <div style="margin: 0; padding: 32px 16px; background: #f5f5f5; font-family: Arial, Helvetica, sans-serif; color: #1e293b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; border-collapse: collapse;">
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0;">

                <tr>
                  <td style="padding: 24px 32px 20px 32px; border-bottom: 3px solid #1a1a2e;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                      <tr>
                        <td>
                          <div style="font-size: 20px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.02em;">CJ DTC</div>
                          <div style="font-size: 10px; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 2px;">CJ Development Training Center</div>
                        </td>
                        <td style="text-align: right; vertical-align: middle;">
                          <div style="display: inline-block; padding: 4px 10px; background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Espace Etudiant</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 32px 32px 0 32px;">
                    <div style="font-size: 22px; line-height: 1.35; font-weight: 700; color: #0f172a;">
                      Bonjour ${safeFullName},
                    </div>
                    <div style="margin-top: 10px; font-size: 15px; line-height: 1.8; color: #475569;">
                      Votre compte etudiant CJ DTC est maintenant actif${safeSessionTitle ? ` pour la session <strong style="color: #1a1a2e;">${safeSessionTitle}</strong>` : ''}. Retrouvez ci-dessous vos identifiants de connexion.
                    </div>
                  </td>
                </tr>

                ${sessionBadge}

                <tr>
                  <td style="padding: 16px 32px 0 32px;">
                    <div style="border-top: 1px solid #f1f5f9;"></div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 16px 32px 0 32px;">
                    <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 16px 20px;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Nom d'utilisateur</div>
                      <div style="font-size: 18px; line-height: 1.5; color: #0f172a; font-weight: 700;">${safeUsername}</div>
                    </div>
                  </td>
                </tr>

                ${passwordBlock}

                <tr>
                  <td style="padding: 24px 32px 0 32px;">
                    <a href="${safeLoginLink}" style="display: inline-block; border-radius: 6px; background: #1a1a2e; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; letter-spacing: 0.02em;">
                      Acceder a l'espace etudiant
                    </a>
                    <div style="margin-top: 12px; font-size: 13px; line-height: 1.7; color: #94a3b8;">
                      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br />
                      <a href="${safeLoginLink}" style="color: #1a1a2e; text-decoration: none; word-break: break-all; font-weight: 600;">${safeLoginLink}</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 32px 0 32px;">
                    <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 18px 20px;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
                        Bonnes pratiques
                      </div>
                      <div style="font-size: 14px; line-height: 1.9; color: #475569;">
                        1. Connectez-vous des reception de cet e-mail.<br />
                        2. Modifiez votre mot de passe apres votre premiere connexion.<br />
                        3. Conservez vos identifiants de maniere confidentielle.
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 24px 32px 32px 32px;">
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 12px; line-height: 1.8; color: #94a3b8;">
                      Besoin d'aide ? Contactez-nous via <a href="mailto:${safeSupportEmail}" style="color: #1a1a2e; text-decoration: none; font-weight: 700;">${safeSupportEmail}</a>.<br />
                      Cet e-mail vous a ete envoye automatiquement par CJ DTC.
                    </div>
                  </td>
                </tr>

              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-top: 16px;">
                <tr>
                  <td style="padding: 0 8px; text-align: center;">
                    <div style="font-size: 11px; color: #94a3b8; line-height: 1.7;">
                      CJ Development Training Center &bull; E-mail automatique &bull; Ne pas repondre directement a ce message
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
      introHtml: `Votre candidature pour la formation <strong style="color: #0f172a;">${safeFormationTitle}</strong> a ete validee par notre equipe.`,
      badgeHtml:
        '<div style="display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">Admission confirmee</div>',
      bodyHtml: `
        <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
            Formation retenue
          </div>
          <div style="font-size: 20px; line-height: 1.4; color: #0f172a; font-weight: 700;">${safeFormationTitle}</div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 1.8; color: #475569;">
            Votre dossier est maintenant retenu. Surveillez votre boite mail : les prochaines consignes pratiques, dates utiles et informations de demarrage vous seront partagees prochainement.
          </div>
        </div>
        <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
            Prochaines etapes
          </div>
          <div style="font-size: 14px; line-height: 1.9; color: #475569;">
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
      title: "Votre inscription n'a pas ete retenue",
      introHtml: `Apres examen de votre dossier pour la formation <strong style="color: #0f172a;">${safeFormationTitle}</strong>, nous ne pouvons pas donner une suite favorable a cette candidature pour le moment.`,
      badgeHtml:
        '<div style="display: inline-block; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">Decision non favorable</div>',
      bodyHtml: `
        <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
            Formation concernee
          </div>
          <div style="font-size: 20px; line-height: 1.4; color: #0f172a; font-weight: 700;">${safeFormationTitle}</div>
          <div style="margin-top: 10px; font-size: 14px; line-height: 1.8; color: #475569;">
            Cette decision ne remet pas en cause votre interet pour nos programmes. D'autres opportunites peuvent mieux correspondre a votre profil ou a vos disponibilites.
          </div>
        </div>
        ${
          safeReason
            ? `<div style="border: 1px solid #fecaca; background: #fef2f2; padding: 20px; margin-bottom: 16px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #991b1b; font-weight: 700; margin-bottom: 8px;">
                  Motif communique
                </div>
                <div style="font-size: 14px; line-height: 1.8; color: #7f1d1d;">${safeReason}</div>
              </div>`
            : ''
        }
        <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
            Suite possible
          </div>
          <div style="font-size: 14px; line-height: 1.8; color: #475569;">
            Si vous souhaitez explorer une autre formation ou obtenir plus d'explications, notre equipe peut vous orienter vers la meilleure suite a donner.
          </div>
        </div>
      `,
      action: {
        label: 'Contacter notre equipe',
        href: `mailto:${supportEmail}`,
      },
      actionHintHtml:
        "Vous pouvez nous ecrire directement pour etudier une autre option ou obtenir plus d'informations.",
    }),
  })
}

export async function sendAssignmentGradedEmail(email: string, assignmentTitle: string, grade: number, feedback?: string | null) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const safeAssignmentTitle = escapeHtml(assignmentTitle)
  const safeFeedback = feedback ? escapeHtml(feedback) : null
  const subject = `Votre travail "${assignmentTitle}" a ete note`
  const text = toPlainTextEmail([
    'Note disponible',
    '',
    `Votre travail pour "${assignmentTitle}" a ete corrige.`,
    `Note : ${grade}/100`,
    feedback ? `Commentaire : ${feedback}` : null,
    `Vous pouvez consulter les details sur votre espace etudiant.`,
    `Lien: ${appBaseUrl}/fr/espace-etudiants/travaux`,
  ])

  return sendEmail({
    to: email,
    subject,
    text,
    html: renderBrandedEmailLayout({
      eyebrow: 'Evaluation',
      title: 'Votre travail a ete note',
      introHtml: `Votre depot pour le travail <strong style="color: #0f172a;">${safeAssignmentTitle}</strong> a ete corrige par l'equipe pedagogique.`,
      badgeHtml:
        '<div style="display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;">Correction terminee</div>',
      bodyHtml: `
        <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
            Note obtenue
          </div>
          <div style="font-size: 36px; line-height: 1.1; color: #0f172a; font-weight: 800;">${grade} <span style="font-size: 18px; color: #94a3b8; font-weight: 400;">/ 100</span></div>
        </div>
        ${
          safeFeedback
            ? `<div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 20px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #94a3b8; font-weight: 700; margin-bottom: 8px;">
                  Commentaire du correcteur
                </div>
                <div style="font-size: 14px; line-height: 1.8; color: #475569; font-style: italic;">"${safeFeedback}"</div>
              </div>`
            : ''
        }
      `,
      action: {
        label: 'Voir dans mon Espace Etudiant',
        href: `${appBaseUrl}/fr/espace-etudiants/travaux`,
      },
      actionHintHtml:
        'Connectez-vous pour consulter le detail de vos devoirs et votre progression globale.',
    }),
  })
}
