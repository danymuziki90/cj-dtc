import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const runtime = "nodejs"

// GET /api/formations/[id] - Récupérer une formation spécifique
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        enrollments: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            createdAt: true
          }
        },
        sessions: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            maxParticipants: true,
            currentParticipants: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            sessions: true
          }
        }
      }
    })

    if (!formation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    return NextResponse.json(formation)
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    )
  }
}

// PUT /api/formations/[id] - Mettre à jour une formation
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      categorie, 
      duree, 
      modules, 
      methodes, 
      certification, 
      statut,
      imageUrl 
    } = body

    // Vérifier que la formation existe
    const existingFormation = await prisma.formation.findUnique({
      where: { id }
    })

    if (!existingFormation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Générer un nouveau slug si le titre a changé
    let slug = existingFormation.slug
    if (title && title !== existingFormation.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(categorie !== undefined && { categorie }),
        ...(duree !== undefined && { duree }),
        ...(modules !== undefined && { modules }),
        ...(methodes !== undefined && { methodes }),
        ...(certification !== undefined && { certification }),
        ...(statut && { statut }),
        ...(imageUrl !== undefined && { imageUrl })
      }
    })

    return NextResponse.json(updatedFormation)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })
    }
    console.error('Erreur lors de la mise à jour de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la formation' },
      { status: 500 }
    )
  }
}

// DELETE /api/formations/[id] - Supprimer une formation
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Vérifier que la formation existe
    const existingFormation = await prisma.formation.findUnique({
      where: { id },
      include: {
        enrollments: true,
        sessions: true
      }
    })

    if (!existingFormation) {
      return NextResponse.json({ error: 'Formation non trouvée' }, { status: 404 })
    }

    // Vérifier s'il y a des inscriptions ou des sessions actives
    if (existingFormation.enrollments.length > 0 || existingFormation.sessions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Impossible de supprimer une formation avec des inscriptions ou des sessions actives. Veuillez d\'abord archiver la formation.' 
        },
        { status: 400 }
      )
    }

    await prisma.formation.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Formation supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la formation' },
      { status: 500 }
    )
  }
}
