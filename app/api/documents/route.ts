import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireStudent } from '@/lib/auth-portal/guards'
import { ADMIN_AUTH_COOKIE, STUDENT_AUTH_COOKIE } from '@/lib/auth-portal/jwt'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'

const PEDAGOGICAL_CATEGORIES = ['cours', 'tp', 'guide', 'presentation', 'video', 'documentation', 'ressource']

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

  // Pas de cookie : accès public (lecture seule, documents isPublic uniquement)
  return { mode: 'public' as const }
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
    const pedagogicalOnly = searchParams.get('scope') === 'pedagogical'
    const isPublicParam = searchParams.get('isPublic')

    if (access.mode === 'admin') {
      const documents = await prisma.document.findMany({
        where: {
          ...(formationId ? { formationId } : {}),
          ...(sessionId ? { sessionId } : {}),
          ...(category ? { category } : {}),
          ...(pedagogicalOnly ? { category: { in: PEDAGOGICAL_CATEGORIES }, sessionId: { not: null } } : {}),
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

    // Mode public : documents isPublic uniquement, catégories pédagogiques
    if (access.mode === 'public') {
      const documents = await prisma.document.findMany({
        where: {
          isPublic: true,
          category: { not: 'certificate_template' },
          ...(pedagogicalOnly ? { category: { in: PEDAGOGICAL_CATEGORIES }, sessionId: { not: null } } : {}),
          ...(formationId ? { formationId } : {}),
          ...(sessionId ? { sessionId } : {}),
          ...(category ? { category } : {}),
        },
        include: {
          formation: { select: { id: true, title: true } },
          session: { select: { id: true, startDate: true, endDate: true, location: true, format: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(documents)
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        email: access.student.email,
        status: {
          in: ['accepted', 'confirmed', 'completed'],
        },
      },
      select: {
        formationId: true,
        sessionId: true,
      },
    })

    const allowedSessionIds = Array.from(
      new Set(enrollments.map((item) => item.sessionId).filter((value): value is number => Boolean(value))),
    )

    if (!allowedSessionIds.length) {
      return NextResponse.json([])
    }

    if (sessionId && !allowedSessionIds.includes(sessionId)) {
      return NextResponse.json([])
    }

    const documents = await prisma.document.findMany({
      where: {
        ...(pedagogicalOnly ? { category: { in: PEDAGOGICAL_CATEGORIES } } : { category: { not: 'certificate_template' } }),
        // A student can only receive documents bound to one of their confirmed sessions.
        // Formation-level access is deliberately not used here.
        sessionId: { in: allowedSessionIds },
        ...(category ? { category } : {}),
        ...(isPublicParam !== null ? { isPublic: isPublicParam === 'true' } : { isPublic: true }),
        ...(formationId ? { formationId } : {}),
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
    console.log('[API Documents] Requête POST reçue')
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = String(formData.get('title') || '').trim()
    const description = String(formData.get('description') || '').trim() || null
    const category = String(formData.get('category') || '').trim()
    const formationId = parseOptionalNumber(String(formData.get('formationId') || '').trim() || null)
    const sessionId = parseOptionalNumber(String(formData.get('sessionId') || '').trim() || null)
    const isPublic = String(formData.get('isPublic') || 'false') === 'true'

    if (!file || !title || !category || !sessionId) {
      console.warn('[API Documents] Données requises manquantes')
      return NextResponse.json({ error: 'Le fichier, le titre, la categorie et la session sont obligatoires.' }, { status: 400 })
    }

    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      select: { id: true, formationId: true },
    })
    if (!session) return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 })
    if (formationId && formationId !== session.formationId) {
      return NextResponse.json({ error: 'La formation doit correspondre a celle de la session.' }, { status: 400 })
    }

    console.log(`[API Documents] Fichier: ${file.name} (${file.size} octets), titre: ${title}, catégorie: ${category}`)
    const r2Folder = `supports/session-${sessionId}`
    const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const buffer = Buffer.from(await file.arrayBuffer())
    
    console.log(`[API Documents] Lancement upload R2. Clé: ${r2Folder}/${safeFileName}`)
    const relativeFilePath = await uploadToR2(buffer, safeFileName, r2Folder, file.type || 'application/octet-stream', true)
    console.log(`[API Documents] Upload R2 réussi. URL: ${relativeFilePath}`)

    const document = await prisma.document.create({
      data: {
        title,
        description,
        fileName: file.name,
        filePath: relativeFilePath,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        formationId: session.formationId,
        sessionId,
        category,
        // Publication means visible to enrolled students; access remains session-scoped.
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
  } catch (error: any) {
    console.error('[API Documents] Erreur lors de l upload du document:', error)
    return NextResponse.json({ error: `Erreur lors de l'upload du document : ${error.message || error}` }, { status: 500 })
  }
}
