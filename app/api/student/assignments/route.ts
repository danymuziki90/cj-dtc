import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les travaux assignés à l'étudiant
    const assignments = await prisma.assignment.findMany({
      where: {
        formation: {
          enrollments: {
            some: {
              email: session.user.email,
              status: 'confirmed'
            }
          }
        }
      },
      include: {
        formation: true,
        submissions: {
          where: {
            studentEmail: session.user.email
          },
          include: {
            files: true
          },
          orderBy: { submittedAt: 'desc' }
        }
      },
      orderBy: { deadline: 'asc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Erreur lors du chargement des travaux:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const formData = await req.formData()
    const assignmentId = Number(formData.get('assignmentId'))
    const fileCount = Number(formData.get('fileCount'))

    if (!assignmentId) {
      return NextResponse.json({ error: 'ID du travail requis' }, { status: 400 })
    }

    // Vérifier le travail
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { formation: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Travail non trouvé' }, { status: 404 })
    }

    // Vérifier que l'étudiant est bien inscrit à cette formation
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        email: session.user.email,
        formationId: assignment.formationId,
        status: 'confirmed'
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Non inscrit à cette formation' }, { status: 403 })
    }

    // Créer la soumission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentEmail: session.user.email,
        status: 'submitted',
        submittedAt: new Date()
      }
    })

    // Traiter les fichiers
    const files = []
    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file_${i}`) as File
      if (file) {
        // Convertir le fichier en base64 pour le stockage
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mimeType = file.type || 'application/octet-stream'
        
        const submissionFile = await prisma.submissionFile.create({
          data: {
            submissionId: submission.id,
            name: `file_${i}_${Date.now()}`,
            originalName: file.name,
            size: file.size,
            mimeType,
            url: `data:${mimeType};base64,${base64}`
          }
        })
        
        files.push(submissionFile)
      }
    }

    // Retourner la soumission avec les fichiers
    const submissionWithFiles = await prisma.submission.findUnique({
      where: { id: submission.id },
      include: { files: true }
    })

    return NextResponse.json({
      success: true,
      submission: submissionWithFiles
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
