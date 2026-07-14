import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── GET /api/sessions/[id]/form-answers/export ─────────────────────────────
// Export CSV des réponses d'une session
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id)
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Session ID invalide' }, { status: 400 })
    }

    // Charge les questions (colonnes)
    const questions = await prisma.sessionFormQuestion.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' },
    })

    // Charge toutes les réponses avec les infos de l'étudiant
    const answers = await prisma.sessionFormAnswer.findMany({
      where: { question: { sessionId } },
      include: {
        question: true,
        enrollment: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, createdAt: true },
        },
      },
      orderBy: [{ enrollmentId: 'asc' }, { question: { order: 'asc' } }],
    })

    // Groupe les réponses par enrollment
    const byEnrollment = new Map<number, { enrollment: any; answers: Map<number, string> }>()
    for (const ans of answers) {
      if (!byEnrollment.has(ans.enrollmentId)) {
        byEnrollment.set(ans.enrollmentId, { enrollment: ans.enrollment, answers: new Map() })
      }
      const row = byEnrollment.get(ans.enrollmentId)!
      // Détermine la valeur lisible
      let value = ''
      if (ans.textValue !== null && ans.textValue !== undefined) {
        value = ans.textValue
      } else if (ans.jsonValue) {
        try { value = JSON.parse(ans.jsonValue).join(', ') } catch { value = ans.jsonValue }
      } else if (ans.fileUrl) {
        value = ans.fileName || ans.fileUrl
      }
      row.answers.set(ans.questionId, value)
    }

    // Construction CSV
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`

    const headers = [
      'ID Inscription', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Date inscription',
      ...questions.map((q) => q.label),
    ]

    const rows: string[][] = []
    for (const [, { enrollment, answers: ansMap }] of byEnrollment) {
      rows.push([
        String(enrollment.id),
        enrollment.firstName,
        enrollment.lastName,
        enrollment.email,
        enrollment.phone || '',
        new Date(enrollment.createdAt).toLocaleDateString('fr-FR'),
        ...questions.map((q) => ansMap.get(q.id) || ''),
      ])
    }

    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ]
    const csv = csvLines.join('\r\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reponses_session_${sessionId}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err: any) {
    console.error('GET form-answers/export error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
  }
}
