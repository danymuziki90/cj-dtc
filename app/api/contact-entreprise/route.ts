import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '../../../lib/email'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const b2bContactSchema = z.object({
  company: z.string().trim().min(2, 'Le nom de l\'entreprise est requis.'),
  contactName: z.string().trim().min(2, 'Le nom du contact est requis.'),
  position: z.string().trim().optional().nullable(),
  email: z.string().trim().email('Format d\'email invalide.'),
  phone: z.string().trim().optional().nullable(),
  sector: z.string().trim().optional().nullable(),
  employees: z.string().trim().optional().nullable(),
  needType: z.string().trim().min(2, 'Le type de besoin est requis.'),
  message: z.string().trim().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const parsed = b2bContactSchema.safeParse(await req.json())
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Données invalides.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { company, contactName, position, email, phone, sector, employees, needType, message } = parsed.data

    // 1. Save corporate request in DB
    const newRequest = await prisma.b2BRequest.create({
        company,
        contactName,
        position: position || null,
        email: email.toLowerCase(),
        phone: phone || null,
        sector: sector || null,
        employees: employees || null,
        needType,
        message: message || null,
        status: 'pending',
      },
    })

    // 2. Prepare Email HTML notification for Admin
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
        <div style="background:#002D72;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:20px;">
            Nouvelle demande Entreprise — CJ Development Training Center
          </h2>
        </div>
        <div style="background:#f8fafc;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">

          <h3 style="color:#002D72;font-size:15px;margin-top:0;">Organisation</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#64748b;width:45%;">Entreprise / Organisation</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${company}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Secteur</td><td style="padding:6px 0;color:#0f172a;">${sector || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Nombre de collaborateurs</td><td style="padding:6px 0;color:#0f172a;">${employees || '—'}</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">

          <h3 style="color:#002D72;font-size:15px;">Contact</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#64748b;width:45%;">Nom complet</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${contactName}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Fonction</td><td style="padding:6px 0;color:#0f172a;">${position || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;color:#0f172a;"><a href="mailto:${email}" style="color:#002D72;">${email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Téléphone</td><td style="padding:6px 0;color:#0f172a;">${phone || '—'}</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">

          <h3 style="color:#002D72;font-size:15px;">Besoin exprimé</h3>
          <p style="font-size:14px;color:#0f172a;background:#fff;border-left:4px solid #E30613;padding:12px 16px;border-radius:0 8px 8px 0;">
            <strong>Type :</strong> ${needType}<br>
            ${message ? `<br>${message.replace(/\n/g, '<br>')}` : ''}
          </p>

          <div style="margin-top:24px;font-size:12px;color:#94a3b8;">
            CJ DEVELOPMENT TRAINING CENTER · contact@cjdevelopmenttc.org
          </div>
        </div>
      </div>
    `

    // 3. Send email notification (non-blocking for DB storage)
    try {
      await sendEmail({
        to: process.env.CONTACT_EMAIL || process.env.MAIL_USER || 'contact@cjdevelopmenttc.org',
        replyTo: email,
        subject: `[Entreprise] ${company} — ${needType}`,
        html,
      })
    } catch (emailErr) {
      console.error('B2B Email Notification Warning (request saved in DB):', emailErr)
    }

    return NextResponse.json({
      message: 'Demande entreprise enregistrée avec succès.',
      id: newRequest.id
    }, { status: 200 })
  } catch (err) {
    console.error('contact-entreprise error:', err)
    return NextResponse.json({ error: 'Erreur inattendue lors de l\'enregistrement.' }, { status: 500 })
  }
}
