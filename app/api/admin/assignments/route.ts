import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Simuler des travaux assignés (en réalité, viendraient de la base de données)
    const assignments = [
      {
        id: 1,
        title: 'TP 1 - Introduction à la programmation',
        description: 'Exercices de base en JavaScript',
        type: 'tp',
        formationId: 1,
        formation: { title: 'Développement Web' },
        deadline: '2025-07-15T23:59:59Z',
        maxFileSize: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'zip'],
        instructions: 'Résolvez les exercices et soumettez vos solutions',
        createdAt: new Date().toISOString(),
        submissions: []
      },
      {
        id: 2,
        title: 'Examen mi-parcours',
        description: 'Évaluation des connaissances acquises',
        type: 'exam',
        formationId: 1,
        formation: { title: 'Développement Web' },
        deadline: '2025-07-20T23:59:59Z',
        maxFileSize: 15,
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        instructions: 'Examen écrit de 2 heures',
        createdAt: new Date().toISOString(),
        submissions: []
      },
      {
        id: 3,
        title: 'Projet Final - Site E-commerce',
        description: 'Développement complet d\'un site e-commerce',
        type: 'project',
        formationId: 1,
        formation: { title: 'Développement Web' },
        deadline: '2025-08-30T23:59:59Z',
        maxFileSize: 50,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'zip', 'rar'],
        instructions: 'Développez un site e-commerce complet avec toutes les fonctionnalités requises',
        createdAt: new Date().toISOString(),
        submissions: []
      }
    ]

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Erreur lors du chargement des travaux:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { title, description, type, formationId, deadline, maxFileSize, allowedFileTypes, instructions } = await req.json()

    // Créer un nouveau travail (simulation)
    const newAssignment = {
      id: Date.now(),
      title,
      description,
      type,
      formationId,
      formation: { title: 'Formation test' },
      deadline,
      maxFileSize: maxFileSize || 10,
      allowedFileTypes: allowedFileTypes || ['pdf', 'doc', 'docx'],
      instructions: instructions || '',
      createdAt: new Date().toISOString(),
      submissions: []
    }

    return NextResponse.json(newAssignment, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du travail:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
