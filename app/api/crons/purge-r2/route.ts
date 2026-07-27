export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { deleteFromR2 } from '@/lib/r2'

/**
 * GET /api/crons/purge-r2
 * Endpoint de maintenance pour vérifier et nettoyer les fichiers orphelins.
 * Supprime les enregistrements de fichiers en BDD dont le travail ou la remise n'existe plus.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    // 1. Purge AssignmentFiles where assignment does not exist
    const orphanAssignmentFiles = await prisma.assignmentFile.findMany({
      where: {
        assignmentId: {
          notIn: (
            await prisma.assignment.findMany({ select: { id: true } })
          ).map((a) => a.id),
        },
      },
    })

    let assignmentFilesPurged = 0
    for (const f of orphanAssignmentFiles) {
      if (f.key || f.url) {
        await deleteFromR2(f.key || f.url)
      }
      await prisma.assignmentFile.delete({ where: { id: f.id } })
      assignmentFilesPurged++
    }

    // 2. Purge SubmissionFiles where submission does not exist
    const orphanSubmissionFiles = await prisma.submissionFile.findMany({
      where: {
        submissionId: {
          notIn: (
            await prisma.submission.findMany({ select: { id: true } })
          ).map((s) => s.id),
        },
      },
    })

    let submissionFilesPurged = 0
    for (const sf of orphanSubmissionFiles) {
      if (sf.key || sf.url) {
        await deleteFromR2(sf.key || sf.url)
      }
      await prisma.submissionFile.delete({ where: { id: sf.id } })
      submissionFilesPurged++
    }

    return NextResponse.json({
      success: true,
      summary: {
        assignmentFilesPurged,
        submissionFilesPurged,
        totalPurged: assignmentFilesPurged + submissionFilesPurged,
      },
    })
  } catch (error: any) {
    console.error('[Purge R2 Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la purge des fichiers orphelins R2' },
      { status: 500 }
    )
  }
}
