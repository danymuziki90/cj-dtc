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

    // Simuler les examens (en réalité, viendraient de la base de données)
    const exams = [
      {
        id: 1,
        title: 'Examen JavaScript Fondamental',
        description: 'Testez vos connaissances de base en JavaScript',
        formationId: 1,
        formation: { title: 'Développement Web', categorie: 'Programmation' },
        duration: 60,
        questions: [
          {
            id: 1,
            question: 'Quelle est la bonne façon de déclarer une variable en JavaScript ?',
            type: 'multiple',
            options: [
              'var x = 5;',
              'let x = 5;',
              'const x = 5;',
              'x = 5;'
            ],
            correctAnswer: 'let x = 5;',
            points: 5
          },
          {
            id: 2,
            question: 'Quelle méthode est utilisée pour ajouter un élément à un tableau ?',
            type: 'multiple',
            options: [
              'array.push()',
              'array.add()',
              'array.concat()',
              'array.append()'
            ],
            correctAnswer: 'array.push()',
            points: 5
          },
          {
            id: 3,
            question: 'Comment créer une fonction en JavaScript ?',
            type: 'text',
            points: 10
          },
          {
            id: 4,
            question: 'Explique la différence entre null et undefined',
            type: 'essay',
            points: 10
          }
        ],
        startDate: new Date('2025-07-01T09:00:00Z').toISOString(),
        endDate: new Date('2025-07-31T23:59:59Z').toISOString(),
        maxAttempts: 2,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissions: [
          {
            id: 1,
            studentEmail: 'alice.dupont@example.com',
            score: 18,
            maxScore: 30,
            status: 'graded',
            submittedAt: '2025-07-15T14:30:00Z',
            gradedAt: '2025-07-15T16:00:00Z',
            gradedBy: 'admin@example.com'
          },
          {
            id: 2,
            studentEmail: 'bob.martin@example.com',
            score: 15,
            maxScore: 30,
            status: 'submitted',
            submittedAt: '2025-07-20T10:15:00Z'
          }
        ]
      },
      {
        id: 2,
        title: 'Examen HTML & CSS',
        description: 'Évaluation des compétences en HTML5 et CSS3',
        formationId: 1,
        formation: { title: 'Développement Web', categorie: 'Design Web' },
        duration: 45,
        questions: [
          {
            id: 1,
            question: 'Quelle balise HTML est utilisée pour le contenu principal ?',
            type: 'multiple',
            options: [
              '<main>',
              '<content>',
              '<section>',
              '<article>',
              '<div>'
            ],
            correctAnswer: '<main>',
            points: 5
          },
          {
            id: 2,
            question: 'Quelle propriété CSS est utilisée pour centrer horizontalement un élément ?',
            type: 'multiple',
            options: [
              'text-align: center',
              'margin: 0 auto',
              'display: flex',
              'position: absolute'
            ],
            correctAnswer: 'margin: 0 auto',
            points: 5
          },
          {
            id: 3,
            question: 'Décrive la structure d\'une page HTML sémantique',
            type: 'essay',
            points: 15
          }
        ],
        startDate: new Date('2025-07-15T14:00:00Z').toISOString(),
        endDate: new Date('2025-07-20T23:59:59Z').toISOString(),
        maxAttempts: 3,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissions: []
      }
    ]

    return NextResponse.json(exams)
  } catch (error) {
    console.error('Erreur lors du chargement des examens:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { title, description, formationId, duration, startDate, endDate, maxAttempts, status } = await req.json()

    // Créer un nouvel examen (simulation)
    const newExam = {
      id: Date.now(),
      title,
      description,
      formationId,
      formation: { title: 'Formation test', categorie: 'Test' },
      duration: duration || 60,
      questions: [],
      startDate: startDate,
      endDate: endDate,
      maxAttempts: maxAttempts || 2,
      status: status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submissions: []
    }

    return NextResponse.json(newExam, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'examen:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { examId, status } = await req.json()

    // Simuler la mise à jour du statut (en réalité, viendra de la base de données)
    const updatedExam = {
      id: examId,
      status,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedExam)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'examen:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
