
export async function sendVerificationEmail(email: string, token: string) {
  // In a real application, use Resend, SendGrid, or Nodemailer
  const confirmLink = `${process.env.NEXT_RES_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`

  console.log('---------------------------------------------------------')
  console.log(`📧 MOCK EMAIL TO: ${email}`)
  console.log(`🔑 SUBJECT: Vérifiez votre compte CJ DTC`)
  console.log(`🔗 LINK: ${confirmLink}`)
  console.log('---------------------------------------------------------')


  return { success: true }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  // In a real application, replace with actual email service
  const resetLink = `${process.env.NEXT_RES_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`

  console.log('---------------------------------------------------------')
  console.log(`📧 MOCK RESET EMAIL TO: ${email}`)
  console.log(`🔑 SUBJECT: Réinitialisation de mot de passe`)
  console.log(`🔗 LINK: ${resetLink}`)
  console.log(`⚠️  EXPIRATION: 1 hour`)
  console.log('---------------------------------------------------------')

  return { success: true }
}

export async function sendEmail(to: string, subject: string, html: string) {
  console.log('---------------------------------------------------------')
  console.log(`📧 MOCK EMAIL TO: ${to}`)
  console.log(`🔑 SUBJECT: ${subject}`)
  console.log(`📄 CONTENT: ${html.substring(0, 100)}...`)
  console.log('---------------------------------------------------------')

  return { success: true }
}

export async function sendAcceptanceEmail(email: string, formationTitle: string) {
  console.log('---------------------------------------------------------')
  console.log(`📧 MOCK ACCEPTANCE EMAIL TO: ${email}`)
  console.log(`🔑 SUBJECT: Félicitations ! Votre inscription a été acceptée`)
  console.log(`📚 FORMATION: ${formationTitle}`)
  console.log('---------------------------------------------------------')

  return { success: true }
}

export async function sendRejectionEmail(email: string, formationTitle: string, reason?: string) {
  console.log('---------------------------------------------------------')
  console.log(`📧 MOCK REJECTION EMAIL TO: ${email}`)
  console.log(`🔑 SUBJECT: Votre inscription n'a pas été retenue`)
  console.log(`📚 FORMATION: ${formationTitle}`)
  if (reason) console.log(`📝 RAISON: ${reason}`)
  console.log('---------------------------------------------------------')

  return { success: true }
}
