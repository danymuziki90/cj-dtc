import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const assignmentId = searchParams.get('assignmentId')

    if (assignmentId) {
      // Récupérer les soumissions pour un travail spécifique
      const submissions = await prisma.submission.findMany({
        where: { assignmentId: Number(assignmentId) },
        include: {
          assignment: {
            include: { formation: true }
          },
          files: true
        },
        orderBy: { submittedAt: 'desc' }
      })
      return NextResponse.json(submissions)
    } else {
      // Récupérer toutes les soumissions
      const submissions = await prisma.submission.findMany({
        include: {
          assignment: {
            include: { formation: true }
          },
          files: true
        },
        orderBy: { submittedAt: 'desc' }
      })
      return NextResponse.json(submissions)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des soumissions:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { submissionId, grade, feedback, status } = await req.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'ID de soumission requis' }, { status: 400 })
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade ? Number(grade) : undefined,
        feedback,
        status: status || 'graded',
        gradedAt: new Date(),
        gradedBy: session.user.email
      },
      include: {
        assignment: {
          include: { formation: true }
        },
        files: true
      }
    })

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la soumission:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
