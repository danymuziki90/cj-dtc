import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

// GET /api/student-submissions - Récupérer les soumissions d'un étudiant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const email = searchParams.get('email')
    const formationId = searchParams.get('formationId')

    // Pour l'instant, on retourne les soumissions basées sur les inscriptions
    // TODO: Créer un modèle StudentSubmission dans Prisma
    const where: any = {}
    if (email) {
      where.email = email
    }
    if (formationId) {
      where.formationId = parseInt(formationId)
    }

    // Simuler avec les données d'inscription pour l'instant
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        formation: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Retourner un format compatible avec l'interface
    const submissions = enrollments.map((enrollment) => ({
      id: enrollment.id,
      title: `Travail - ${enrollment.formation.title}`,
      fileName: enrollment.motivationLetter ? 'lettre-motivation.pdf' : 'N/A',
      filePath: enrollment.motivationLetter || '',
      fileSize: enrollment.motivationLetter ? 100000 : 0,
      status: 'submitted',
      submittedAt: enrollment.createdAt.toISOString(),
      feedback: enrollment.notes,
      formation: enrollment.formation
    }))

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Erreur lors de la récupération des soumissions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des soumissions' },
      { status: 500 }
    )
  }
}

// POST /api/student-submissions - Soumettre un travail
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const formationId = formData.get('formationId') as string
    const email = formData.get('email') as string // À récupérer depuis la session

    if (!file || !title || !formationId) {
      return NextResponse.json(
        { error: 'Fichier, titre et formation sont requis' },
        { status: 400 }
      )
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'student-submissions')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Le dossier existe déjà
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join('uploads', 'student-submissions', fileName)

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(join(process.cwd(), 'public', filePath), buffer)

    // TODO: Créer une entrée dans le modèle StudentSubmission
    // Pour l'instant, on retourne une confirmation
    return NextResponse.json({
      id: timestamp,
      title,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      formation: {
        id: parseInt(formationId),
        title: 'Formation'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la soumission du travail:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la soumission du travail' },
      { status: 500 }
    )
  }
}
