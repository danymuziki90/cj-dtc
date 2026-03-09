import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp'])
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_FILE_SIZE = 10 * 1024 * 1024

function parsePaymentNotes(notes?: string | null) {
  if (!notes) return {} as Record<string, unknown>
  try {
    const parsed = JSON.parse(notes)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return {}
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const paymentIdRaw = formData.get('paymentId')
    const paymentId =
      typeof paymentIdRaw === 'string' && paymentIdRaw.trim().length > 0
        ? Number(paymentIdRaw)
        : null

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB).' }, { status: 400 })
    }

    const extension = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Format invalide. Utilisez uniquement PDF, JPG, PNG ou WEBP.' },
        { status: 400 }
      )
    }

    const payment = paymentId
      ? await prisma.payment.findFirst({
          where: {
            id: paymentId,
            enrollment: {
              is: {
                email: auth.student.email,
              },
            },
          },
          include: {
            enrollment: {
              select: {
                id: true,
                email: true,
                formation: { select: { title: true } },
              },
            },
          },
        })
      : await prisma.payment.findFirst({
          where: {
            enrollment: {
              is: {
                email: auth.student.email,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            enrollment: {
              select: {
                id: true,
                email: true,
                formation: { select: { title: true } },
              },
            },
          },
        })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement introuvable pour ce compte.' }, { status: 404 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'payment-proofs', auth.student.id)
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const proofUrl = `/uploads/payment-proofs/${auth.student.id}/${fileName}`
    const existingNotes = parsePaymentNotes(payment.notes)
    const nextNotes = {
      ...existingNotes,
      proofUrl,
      paymentProofUrl: proofUrl,
      proofOriginalName: file.name,
      proofMimeType: file.type,
      proofUploadedAt: new Date().toISOString(),
      proofUploadedBy: 'student',
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        notes: JSON.stringify(nextNotes),
      },
      select: {
        id: true,
        status: true,
        method: true,
        amount: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      proofUrl,
      payment: {
        ...updated,
        formationTitle: payment.enrollment.formation.title,
        enrollmentId: payment.enrollment.id,
      },
    })
  } catch (error) {
    console.error('Student payment proof upload error:', error)
    return NextResponse.json({ error: 'Échec du téléversement de la preuve.' }, { status: 500 })
  }
}

