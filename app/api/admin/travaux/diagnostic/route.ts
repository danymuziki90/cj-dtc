import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/travaux/diagnostic
 * Diagnostic complet du pipeline soumissions : étudiants, inscriptions, travaux, soumissions.
 * Permet de savoir exactement pourquoi les soumissions sont vides.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  try {
    const [
      students,
      assignments,
      submissions,
      enrollments,
    ] = await Promise.all([
      prisma.student.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        },
      }),
      prisma.assignment.findMany({
        select: {
          id: true,
          title: true,
          published: true,
          formationId: true,
          sessionId: true,
          deadline: true,
          Formation: { select: { id: true, title: true } },
          TrainingSession: { select: { id: true } },
          _count: { select: { Submission: true } },
        },
      }),
      prisma.submission.findMany({
        select: {
          id: true,
          assignmentId: true,
          studentId: true,
          status: true,
          correctionStatus: true,
          submittedAt: true,
          _count: { select: { SubmissionFile: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      }),
      prisma.enrollment.findMany({
        where: {
          status: { in: ['accepted', 'confirmed', 'completed'] },
        },
        select: {
          id: true,
          studentId: true,
          formationId: true,
          sessionId: true,
          status: true,
          email: true,
        },
      }),
    ])

    // Pour chaque travail, vérifier quels étudiants y ont accès (selon les inscriptions)
    const assignmentAccess = assignments.map((assignment) => {
      const eligibleStudents = students.filter((student) => {
        // Un étudiant a accès si :
        // 1. Il est inscrit à la session du travail (si sessionId est défini)
        // 2. Il est inscrit à la formation du travail (si sessionId est null)
        const studentEnrollments = enrollments.filter(
          (e) => e.studentId === student.id || e.email === student.email
        )
        if (assignment.sessionId) {
          return studentEnrollments.some((e) => e.sessionId === assignment.sessionId)
        } else {
          return studentEnrollments.some((e) => e.formationId === assignment.formationId)
        }
      })

      const submissionsForAssignment = submissions.filter(
        (s) => s.assignmentId === assignment.id
      )

      return {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        published: assignment.published,
        formationId: assignment.formationId,
        sessionId: assignment.sessionId,
        deadline: assignment.deadline,
        eligibleStudentCount: eligibleStudents.length,
        eligibleStudents: eligibleStudents.map((s) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email,
          status: s.status,
          hasSubmitted: submissionsForAssignment.some((sub) => sub.studentId === s.id),
        })),
        submissionCount: submissionsForAssignment.length,
      }
    })

    // Étudiants sans enrollment actif
    const studentsWithoutEnrollment = students.filter((student) => {
      return !enrollments.some(
        (e) => e.studentId === student.id || e.email === student.email
      )
    })

    // Problèmes potentiels identifiés
    const issues: string[] = []

    if (submissions.length === 0) {
      issues.push('CRITIQUE : Aucune soumission en base. Le POST /api/student/assignments ne crée rien.')
    }
    if (assignments.length === 0) {
      issues.push('CRITIQUE : Aucun travail publié.')
    }
    if (enrollments.length === 0) {
      issues.push('CRITIQUE : Aucun étudiant avec une inscription active (accepted/confirmed/completed). Les étudiants ne voient donc pas les travaux.')
    }
    assignmentAccess.forEach((a) => {
      if (a.eligibleStudentCount === 0) {
        issues.push(`Travail "${a.assignmentTitle}" : aucun étudiant inscrit ne peut y accéder (formationId=${a.formationId}, sessionId=${a.sessionId ?? 'null'}).`)
      }
      if (!a.published) {
        issues.push(`Travail "${a.assignmentTitle}" : non publié (published=false). Les étudiants ne le voient pas.`)
      }
    })
    studentsWithoutEnrollment.forEach((s) => {
      issues.push(`Étudiant "${s.firstName} ${s.lastName}" (${s.email}) : aucune inscription active → ne voit aucun travail.`)
    })

    return NextResponse.json({
      summary: {
        totalStudents: students.length,
        totalAssignments: assignments.length,
        totalSubmissions: submissions.length,
        totalActiveEnrollments: enrollments.length,
        studentsWithoutActiveEnrollment: studentsWithoutEnrollment.length,
        issuesFound: issues.length,
      },
      issues,
      assignmentAccess,
      recentSubmissions: submissions,
      allEnrollments: enrollments,
      allStudents: students.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        status: s.status,
        enrollmentCount: enrollments.filter(
          (e) => e.studentId === s.id || e.email === s.email
        ).length,
      })),
    })
  } catch (error) {
    console.error('[travaux/diagnostic GET] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
  }
}
