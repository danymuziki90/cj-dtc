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

    // Simuler les données de progression (en réalité, viendraient de la base de données)
    const progress = [
      {
        id: 1,
        studentEmail: session.user.email,
        courseId: 1,
        completed: true,
        completedAt: new Date('2025-06-15').toISOString(),
        timeSpent: 2700,
        score: 85
      },
      {
        id: 2,
        studentEmail: session.user.email,
        courseId: 2,
        completed: false,
        timeSpent: 1200,
        score: null
      },
      {
        id: 3,
        studentEmail: session.user.email,
        courseId: 3,
        completed: false,
        timeSpent: 900,
        score: null
      },
      {
        id: 4,
        studentEmail: session.user.email,
        courseId: 4,
        completed: false,
        timeSpent: 600,
        score: null
      }
    ]

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Erreur lors du chargement de la progression:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { courseId, completed, timeSpent } = await req.json()

    if (!courseId) {
      return NextResponse.json({ error: 'ID du cours requis' }, { status: 400 })
    }

    // Simuler la mise à jour de la progression
    const updatedProgress = {
      id: Date.now(),
      studentEmail: session.user.email,
      courseId,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
      timeSpent,
      score: completed ? Math.floor(Math.random() * 20) + 60 : null
    }

    return NextResponse.json(updatedProgress, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
