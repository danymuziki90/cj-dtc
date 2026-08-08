import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { supabase } from '@/lib/supabase'
import { canStudentResubmit } from '@/lib/submission-rules'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const submitSchema = z.object({
  assignmentId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  files: z.array(z.any()).min(1, 'Au moins un fichier est requis'),
  // Identification de secours si le cookie JWT est invalide
  studentEmail: z.string().email().optional(),
  studentId:    z.string().optional(),
})

/**
 * POST /api/student/submit
 * Route de soumission robuste avec double identification :
 * 1. Cookie JWT student_token (méthode principale)
 * 2. studentEmail + studentId dans le body (fallback si cookie invalide)
 *
 * Retourne toujours un JSON détaillé pour le diagnostic.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ success: false, error: 'Corps de la requête manquant.' }, { status: 400 })
  }

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      success: false,
      error: parsed.error.errors[0]?.message || 'Données invalides.',
      details: parsed.error.errors,
    }, { status: 400 })
  }

  const { assignmentId, files, studentEmail, studentId: bodyStudentId } = parsed.data

  // ── 1. Identifier l'étudiant ──────────────────────────────────────────────
  let student: { id: string; email: string; firstName: string; lastName: string; status: string } | null = null
  let authMethod = 'none'

  // Méthode A : cookie JWT
  const auth = await requireStudent(req)
  if (auth.student) {
    student = auth.student
    authMethod = 'jwt_cookie'
  }

  // Méthode B : studentId dans le body (fallback)
  if (!student && bodyStudentId) {
    student = await prisma.student.findUnique({
      where: { id: bodyStudentId },
      select: { id: true, email: true, firstName: true, lastName: true, status: true },
    }).catch(() => null)
    if (student) authMethod = 'student_id_body'
  }

  // Méthode C : email dans le body (dernier recours)
  if (!student && studentEmail) {
    student = await prisma.student.findFirst({
      where: { email: { equals: studentEmail, mode: 'insensitive' } },
      select: { id: true, email: true, firstName: true, lastName: true, status: true },
    }).catch(() => null)
    if (student) authMethod = 'email_body'
  }

  if (!student) {
    return NextResponse.json({
      success: false,
      error: 'Identification impossible. Veuillez vous reconnecter.',
      hint: 'cookie_invalid_and_no_fallback',
    }, { status: 401 })
  }

  // Vérifier que le compte n'est pas bloqué
  const blocked = ['SUSPENDED', 'INACTIVE', 'DELETED', 'BANNED']
  if (blocked.includes(student.status?.toUpperCase())) {
    return NextResponse.json({
      success: false,
      error: 'Compte désactivé. Contactez l\'administration.',
    }, { status: 403 })
  }

  console.log(`[POST /api/student/submit] Student ${student.id} (${student.email}) — méthode: ${authMethod} — assignmentId: ${assignmentId} — ${files.length} fichier(s)`)

  // ── 2. Vérifier le travail ────────────────────────────────────────────────
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } })
  if (!assignment) {
    return NextResponse.json({ success: false, error: 'Travail introuvable.' }, { status: 404 })
  }
  if (!assignment.published) {
    return NextResponse.json({ success: false, error: 'Ce travail n\'est pas encore publié.' }, { status: 403 })
  }

  // ── 3. Créer ou mettre à jour la soumission ───────────────────────────────
  let submission = await prisma.submission.findFirst({
    where: { assignmentId: assignment.id, studentId: student.id },
  })

  if (submission) {
    if (!canStudentResubmit(assignment.allowResubmission, submission)) {
      return NextResponse.json({
        success: false,
        error: 'Ce travail a déjà été remis et ne peut plus être soumis à nouveau.',
      }, { status: 409 })
    }

    submission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: 'submitted',
        correctionStatus: 'pending',
        submittedAt: new Date(),
        sessionId: assignment.sessionId ?? null,
        maxGrade: assignment.maxGrade,
      },
    })
    await prisma.submissionFile.deleteMany({ where: { submissionId: submission.id } })
    console.log(`[POST /api/student/submit] Mise à jour soumission id=${submission.id}`)
  } else {
    submission = await prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        studentId: student.id,
        sessionId: assignment.sessionId ?? null,
        maxGrade: assignment.maxGrade,
        status: 'submitted',
        submittedAt: new Date(),
      },
    })
    console.log(`[POST /api/student/submit] Nouvelle soumission id=${submission.id}`)
  }

  // ── 4. Enregistrer les fichiers ───────────────────────────────────────────
  for (const file of files) {
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        name: file.name,
        originalName: file.originalName || file.name,
        url: file.url,
        size: Number(file.size) || 0,
        mimeType: file.mimeType || file.type || 'application/octet-stream',
      },
    })
  }

  console.log(`[POST /api/student/submit] ${files.length} fichier(s) enregistré(s) pour soumission id=${submission.id}`)

  // ── 5. Broadcast Supabase (non bloquant) ──────────────────────────────────
  if (supabase) {
    supabase.channel('submissions_travaux_channel').send({
      type: 'broadcast',
      event: 'submission_created',
      payload: { submissionId: submission.id, assignmentId: assignment.id, studentId: student.id },
    }).catch((e: any) => console.warn('[submit broadcast]', e?.message))
  }

  return NextResponse.json({
    success: true,
    submissionId: submission.id,
    studentId: student.id,
    authMethod,
    filesCreated: files.length,
  }, { status: 201 })
}
