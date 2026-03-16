import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireStudent } from '@/lib/auth-portal/guards'
import { ADMIN_AUTH_COOKIE, STUDENT_AUTH_COOKIE } from '@/lib/auth-portal/jwt'
import { writeAdminAuditLog } from '@/lib/admin/audit'

export const runtime = 'nodejs'

async function resolveDocumentAccess(request: NextRequest) {
  const hasAdminCookie = Boolean(request.cookies.get(ADMIN_AUTH_COOKIE)?.value)
  const hasStudentCookie = Boolean(request.cookies.get(STUDENT_AUTH_COOKIE)?.value)

  if (hasAdminCookie) {
    const adminAuth = await requireAdmin(request)
    if (!adminAuth.error) {
      return { mode: 'admin' as const, admin: adminAuth.admin }
    }
    if (!hasStudentCookie) return { error: adminAuth.error }
  }

  if (hasStudentCookie) {
    const studentAuth = await requireStudent(request)
    if (!studentAuth.error) {
      return { mode: 'student' as const, student: studentAuth.student }
    }
    return { error: studentAuth.error }
  }

  return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
}

function parseOptionalNumber(value: string | null) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function GET(request: NextRequest) {
  const access = await resolveDocumentAccess(request)
  if ('error' in access) return access.error

  try {
    const { searchParams } = request.nextUrl
    const formationId = parseOptionalNumber(searchParams.get('formationId'))
    const sessionId = parseOptionalNumber(searchParams.get('sessionId'))
    const category = searchParams.get('category')?.trim() || null
    const isPublicParam = searchParams.get('isPublic')

    if (access.mode === 'admin') {
      const documents = await prisma.document.findMany({
        where: {
          ...(formationId ? { formationId } : {}),
          ...(sessionId ? { sessionId } : {}),
          ...(category ? { category } : {}),
          ...(isPublicParam !== null ? { isPublic: isPublicParam === 'true' } : {}),
        },
        include: {
          formation: {
            select: { id: true, title: true },
          },
          session: {
            select: { id: true, startDate: true, endDate: true, location: true, format: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(documents)
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        email: access.student.email,
        status: {
          notIn: ['rejected', 'cancelled'],
        },
      },
      select: {
        formationId: true,
        sessionId: true,
      },
    })

    const allowedFormationIds = Array.from(new Set(enrollments.map((item) => item.formationId)))
    const allowedSessionIds = Array.from(
      new Set(enrollments.map((item) => item.sessionId).filter((value): value is number => Boolean(value))),
    )

    if (!allowedFormationIds.length && !allowedSessionIds.length) {
      return NextResponse.json([])
    }

    if (formationId && !allowedFormationIds.includes(formationId)) {
      return NextResponse.json([])
    }

    if (sessionId && !allowedSessionIds.includes(sessionId)) {
      return NextResponse.json([])
    }

    const documents = await prisma.document.findMany({
      where: {
        category: {
          not: 'certificate_template',
        },
        ...(formationId ? { formationId } : {}),
        ...(sessionId ? { sessionId } : {}),
        ...(category ? { category } : {}),
        OR: [
          ...(allowedFormationIds.length ? [{ formationId: { in: allowedFormationIds } }] : []),
          ...(allowedSessionIds.length ? [{ sessionId: { in: allowedSessionIds } }] : []),
        ],
      },
      include: {
        formation: {
          select: { id: true, title: true },
        },
        session: {
          select: { id: true, startDate: true, endDate: true, location: true, format: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Erreur lors de la recuperation des documents:', error)
    return NextResponse.json({ error: 'Erreur lors de la recuperation des documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = String(formData.get('title') || '').trim()
    const description = String(formData.get('description') || '').trim() || null
    const category = String(formData.get('category') || '').trim()
    const formationId = parseOptionalNumber(String(formData.get('formationId') || '').trim() || null)
    const sessionId = parseOptionalNumber(String(formData.get('sessionId') || '').trim() || null)
    const isPublic = String(formData.get('isPublic') || 'false') === 'true'

    if (!file || !title || !category) {
      return NextResponse.json({ error: 'File, title and category are required.' }, { status: 400 })
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents')
    await mkdir(uploadsDir, { recursive: true })

    const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const absoluteFilePath = join(uploadsDir, safeFileName)
    const relativeFilePath = join('uploads', 'documents', safeFileName).replace(/\\/g, '/')
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(absoluteFilePath, buffer)

    const document = await prisma.document.create({
      data: {
        title,
        description,
        fileName: file.name,
        filePath: relativeFilePath,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        formationId,
        sessionId,
        category,
        isPublic,
        uploadedBy: auth.admin.id,
      },
      include: {
        formation: {
          select: { id: true, title: true },
        },
        session: {
          select: { id: true, startDate: true, endDate: true, location: true, format: true },
        },
      },
    })

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'document.create',
      targetType: 'document',
      targetId: String(document.id),
      targetLabel: document.title,
      summary: `Document ajoute: ${document.title}`,
      metadata: {
        category: document.category,
        formationId: document.formationId,
        sessionId: document.sessionId,
        isPublic: document.isPublic,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de l upload du document:', error)
    return NextResponse.json({ error: 'Erreur lors de l upload du document' }, { status: 500 })
  }
}
