import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Simuler les examens (en réalité, viendraient de la base de données)
    const exams = [
      {
        id: 1,
        title: 'Examen JavaScript Fondamental',
        description: 'Testez vos connaissances de base en JavaScript',
        formationId: 1,
        formation: { title: 'Développement Web' },
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
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Examen HTML & CSS',
        description: 'Évaluation des compétences en HTML5 et CSS3',
        formationId: 1,
        formation: { title: 'Développement Web' },
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
        createdAt: new Date().toISOString()
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
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { examId, answers } = await req.json()

    if (!examId || !answers) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    // Simuler la soumission (en réalité, viendra de la base de données)
    const submission = {
      id: Date.now(),
      examId,
      studentEmail: session.user.email,
      answers,
      maxScore: 30,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    }

    // Calculer le score (simulation)
    let score = 0
    const exam = await fetch('/api/student/exams').then(res => res.json())
    const examData = exam.find((e: any) => e.id === examId)
    
    if (examData) {
      examData.questions.forEach((question: any) => {
        const studentAnswer = answers[question.id]
        if (question.type === 'multiple') {
          if (studentAnswer === question.correctAnswer) {
            score += question.points
          }
        } else if (question.type === 'text' || question.type === 'essay') {
          // Pour les questions textes et essais, simulation de notation
          score += Math.floor(Math.random() * question.points) + (question.points * 0.6)
        }
      })
    }

    const submissionWithScore = {
      ...submission,
      score
    }

    return NextResponse.json({
      success: true,
      submission: submissionWithScore
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
