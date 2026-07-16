import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { uploadToR2 } from '../../../lib/r2'

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
    console.log('[API Student Submissions] Requête POST reçue')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const formationId = formData.get('formationId') as string
    const email = formData.get('email') as string // À récupérer depuis la session

    if (!file || !title || !formationId) {
      console.warn('[API Student Submissions] Données requises manquantes')
      return NextResponse.json(
        { error: 'Fichier, titre et formation sont requis' },
        { status: 400 }
      )
    }

    console.log(`[API Student Submissions] Fichier: ${file.name} (${file.size} octets), titre: ${title}, formationId: ${formationId}`)
    const fileExtension = file.name.split('.').pop() || 'bin'
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log(`[API Student Submissions] Lancement upload R2. Clé: travaux/${fileName}`)
    const filePath = await uploadToR2(buffer, fileName, 'travaux', file.type)
    console.log(`[API Student Submissions] Upload réussi. URL: ${filePath}`)

    // TODO: Créer une entrée dans le modèle StudentSubmission
    // Pour l'instant, on retourne une confirmation
    return NextResponse.json({
      id: Date.now(),
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
  } catch (error: any) {
    console.error('[API Student Submissions] Erreur lors de la soumission:', error)
    return NextResponse.json(
      { error: `Erreur lors de la soumission du travail : ${error.message || error}` },
      { status: 500 }
    )
  }
}
