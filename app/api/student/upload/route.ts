import { NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File
    const assignmentIdVal   = formData.get('assignmentId')
    const maxFileSizeMbVal  = formData.get('maxFileSize')
    // Identifiants de secours envoyés par le modal
    const fallbackStudentId    = String(formData.get('studentId')    || '')
    const fallbackStudentEmail = String(formData.get('studentEmail') || '')

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni.' }, { status: 400 })
    }

    // ── Identifier l'étudiant (cookie JWT en priorité, fallback sinon) ──
    let student: { id: string } | null = null

    const auth = await requireStudent(request)
    if (auth.student) {
      student = auth.student
    } else if (fallbackStudentId) {
      student = await prisma.student.findUnique({
        where: { id: fallbackStudentId },
        select: { id: true },
      }).catch(() => null)
    } else if (fallbackStudentEmail) {
      student = await prisma.student.findFirst({
        where: { email: { equals: fallbackStudentEmail, mode: 'insensitive' } },
        select: { id: true },
      }).catch(() => null)
    }

    if (!student) {
      console.warn('[Student Upload] Auth échouée — cookie invalide et pas de fallback')
      return NextResponse.json(
        { success: false, error: 'Session expirée. Veuillez vous reconnecter.' },
        { status: 401 }
      )
    }

    // ── Vérification taille ────────────────────────────────────────────
    const maxFileSizeMb = maxFileSizeMbVal ? parseFloat(String(maxFileSizeMbVal)) : 10
    const maxSizeBytes  = maxFileSizeMb * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json({
        success: false,
        error: `Le fichier "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB) dépasse la taille maximale de ${maxFileSizeMb} MB.`,
      }, { status: 400 })
    }

    // ── Upload vers R2 ─────────────────────────────────────────────────
    const timestamp           = Date.now()
    const sanitizedName       = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storageKeyName      = `${student.id}_${assignmentIdVal || 'travail'}_${timestamp}_${sanitizedName}`
    const r2Folder            = 'travaux/remises'

    const bytes    = await file.arrayBuffer()
    const buffer   = Buffer.from(bytes)
    const mimeType = file.type || 'application/octet-stream'

    const fileUrl = await uploadToR2(buffer, storageKeyName, r2Folder, mimeType)

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "Échec de la génération de l'URL du fichier téléversé." },
        { status: 500 }
      )
    }

    console.log(`[Student Upload] OK — student=${student.id} key=${r2Folder}/${storageKeyName}`)

    return NextResponse.json({
      success: true,
      file: {
        name:         storageKeyName,
        originalName: file.name,
        size:         file.size,
        mimeType,
        url:          fileUrl,
        key:          `${r2Folder}/${storageKeyName}`,
      },
    })
  } catch (error: any) {
    console.error('[Student Upload Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors du téléversement.' },
      { status: 500 }
    )
  }
}
