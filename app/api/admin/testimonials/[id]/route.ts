import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

// ─── GET single testimonial ────────────────────────────────────────────────
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const testimonial = await prisma.testimonial.findUnique({
    where: { id: Number(id) },
    include: {
      formation: { select: { id: true, title: true } },
      session:   { select: { id: true, startDate: true, location: true } },
      student:   { select: { id: true, firstName: true, lastName: true, email: true, photoUrl: true } },
    },
  })
  if (!testimonial) return NextResponse.json({ error: 'Témoignage introuvable' }, { status: 404 })
  return NextResponse.json(testimonial)
}

// ─── PATCH — approve | reject | reply | edit ───────────────────────────────
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const { action, adminReply, quote, title, location } = body

  const existing = await prisma.testimonial.findUnique({
    where: { id: Number(id) },
    include: { student: { select: { email: true, firstName: true, lastName: true } } },
  })
  if (!existing) return NextResponse.json({ error: 'Témoignage introuvable' }, { status: 404 })

  let data: any = {}
  let notifySubject = ''
  let notifyHtml = ''

  if (action === 'approve') {
    data = { status: 'approved', approved: true, publishedAt: new Date() }
    notifySubject = 'Votre témoignage a été approuvé — CJ Development Training Center'
    notifyHtml = `
      <p>Bonjour ${existing.student?.firstName ?? existing.name},</p>
      <p>Votre témoignage a été <strong>approuvé et publié</strong> sur notre site. Merci pour votre contribution !</p>
      <p>— L'équipe CJ Development Training Center</p>
    `
  } else if (action === 'reject') {
    data = { status: 'rejected', approved: false, publishedAt: null }
    notifySubject = 'Votre témoignage — CJ Development Training Center'
    notifyHtml = `
      <p>Bonjour ${existing.student?.firstName ?? existing.name},</p>
      <p>Après examen, votre témoignage n'a pas pu être publié sur notre site.</p>
      <p>Vous pouvez soumettre un nouveau témoignage depuis votre Espace Étudiant.</p>
      <p>— L'équipe CJ Development Training Center</p>
    `
  } else if (action === 'reply') {
    const reply = String(adminReply || '').trim()
    if (!reply) return NextResponse.json({ error: 'La réponse ne peut pas être vide.' }, { status: 400 })
    data = { adminReply: reply }
    notifySubject = 'L\'administration vous a répondu — CJ Development Training Center'
    notifyHtml = `
      <p>Bonjour ${existing.student?.firstName ?? existing.name},</p>
      <p>L'administration a répondu à votre témoignage :</p>
      <blockquote style="border-left:3px solid #002d72;padding-left:12px;color:#374151;">${reply}</blockquote>
      <p>Connectez-vous à votre Espace Étudiant pour consulter la réponse complète.</p>
      <p>— L'équipe CJ Development Training Center</p>
    `
  } else if (action === 'edit') {
    // Light editorial correction only
    if (quote !== undefined) data.quote = String(quote).trim()
    if (title !== undefined) data.title = String(title).trim() || null
    if (location !== undefined) data.location = String(location).trim() || null
  } else {
    return NextResponse.json({ error: 'Action invalide. Valeurs: approve, reject, reply, edit' }, { status: 400 })
  }

  const updated = await prisma.testimonial.update({ where: { id: Number(id) }, data })

  // Send email notification if student has an email address
  const studentEmail = existing.student?.email
  if (notifySubject && studentEmail) {
    try {
      await sendEmail({ to: studentEmail, subject: notifySubject, html: notifyHtml })
    } catch (err) {
      console.error('[testimonials] email notification failed:', err)
      // Non-blocking — the update already succeeded
    }
  }

  return NextResponse.json(updated)
}

// ─── DELETE — permanent removal ────────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const { id } = await params
  const existing = await prisma.testimonial.findUnique({ where: { id: Number(id) } })
  if (!existing) return NextResponse.json({ error: 'Témoignage introuvable' }, { status: 404 })

  await prisma.testimonial.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
