import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Simuler les données des étudiants (en réalité, viendraient de la base de données)
    const students = [
      {
        id: 1,
        name: 'Alice Dupont',
        email: 'alice.dupont@example.com',
        phone: '+221 33 123 456',
        address: '123 Rue de la République',
        dateOfBirth: '1995-05-15',
        city: 'Dakar',
        country: 'Sénégal',
        role: 'student',
        status: 'active',
        createdAt: '2025-01-15T10:00:00Z',
        lastLogin: '2025-07-20T14:30:00Z',
        enrollments: [
          {
            id: 1,
            formationId: 1,
            formation: {
              title: 'Développement Web',
              categorie: 'Programmation'
            },
            status: 'completed',
            startDate: '2025-01-20',
            completionDate: '2025-06-15',
            grade: 18
          },
          {
            id: 2,
            formationId: 2,
            formation: {
              title: 'Marketing Digital',
              categorie: 'Marketing'
            },
            status: 'confirmed',
            startDate: '2025-06-01'
          }
        ],
        progress: [
          {
            courseId: 1,
            courseTitle: 'Introduction à JavaScript',
            completed: true,
            timeSpent: 2700,
            completedAt: '2025-03-15T10:00:00Z'
          },
          {
            courseId: 2,
            courseTitle: 'HTML5 et CSS3',
            completed: true,
            timeSpent: 1800,
            completedAt: '2025-04-20T15:30:00Z'
          },
          {
            courseId: 3,
            courseTitle: 'Quiz JavaScript',
            completed: false,
            timeSpent: 900
          }
        ]
      },
      {
        id: 2,
        name: 'Bob Martin',
        email: 'bob.martin@example.com',
        phone: '+221 77 987 654',
        address: '456 Avenue Bourguiba',
        dateOfBirth: '1993-08-22',
        city: 'Abidjan',
        country: 'Côte d\'Ivoire',
        role: 'student',
        status: 'active',
        createdAt: '2025-02-10T09:00:00Z',
        lastLogin: '2025-07-21T10:15:00Z',
        enrollments: [
          {
            id: 3,
            formationId: 1,
            formation: {
              title: 'Développement Web',
              categorie: 'Programmation'
            },
            status: 'confirmed',
            startDate: '2025-02-15'
          }
        ],
        progress: [
          {
            courseId: 1,
            courseTitle: 'Introduction à JavaScript',
            completed: false,
            timeSpent: 1200
          },
          {
            courseId: 2,
            courseTitle: 'HTML5 et CSS3',
            completed: false,
            timeSpent: 800
          }
        ]
      },
      {
        id: 3,
        name: 'Carol Johnson',
        email: 'carol.johnson@example.com',
        phone: '+221 76 543 210',
        address: '789 Boulevard de la Libération',
        dateOfBirth: '1997-03-10',
        city: 'Lomé',
        country: 'Togo',
        role: 'student',
        status: 'suspended',
        createdAt: '2025-03-05T11:00:00Z',
        lastLogin: '2025-06-30T16:45:00Z',
        enrollments: [
          {
            id: 4,
            formationId: 3,
            formation: {
              title: 'Gestion de Projet',
              categorie: 'Management'
            },
            status: 'confirmed',
            startDate: '2025-03-10'
          }
        ],
        progress: [
          {
            courseId: 4,
            courseTitle: 'Principes de Gestion',
            completed: true,
            timeSpent: 1500,
            completedAt: '2025-05-20T09:00:00Z'
          }
        ]
      }
    ]

    return NextResponse.json(students)
  } catch (error) {
    console.error('Erreur lors du chargement des étudiants:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { name, email, phone, address, dateOfBirth, city, country, password } = await req.json()

    // Validation basique
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Un compte avec cet email existe déjà' }, { status: 409 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'student'
      }
    })

    // Créer le profil étudiant (simulation)
    const student = {
      id: user.id,
      name,
      email,
      phone,
      address,
      dateOfBirth,
      city,
      country,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
      enrollments: [],
      progress: []
    }

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { studentId, status } = await req.json()

    if (!studentId || !status) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    // Simuler la mise à jour du statut (en réalité, viendra de la base de données)
    const updatedStudent = {
      id: studentId,
      status,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
