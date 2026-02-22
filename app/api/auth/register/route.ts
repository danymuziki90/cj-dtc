
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const runtime = "nodejs"

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  studentNumber: z.string().optional(), // Generated if not provided
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(['STUDENT', 'ADMIN']).optional().default('STUDENT'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: result.error.errors },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, phone, role } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Un étudiant avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate student number if not provided (with timestamp to reduce collision risk)
    const studentNumber = result.data.studentNumber || `STU-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`

    // Create Student and User in a transaction (all or nothing)
    const [student, user] = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          studentNumber,
          dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : null,
          address: result.data.address,
          city: result.data.city,
          country: result.data.country,
          status: 'PENDING',
          role: role as any
        }
      })
      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          role: role as any
        }
      })
      return [student, user]
    })

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès.',
      studentId: student.id,
      userId: user.id
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)

    // Messages plus explicites pour les erreurs courantes
    let message = 'Erreur lors de la création du compte'
    const code = error?.code
    if (code === 'P2002') {
      const target = (error?.meta?.target as string[])?.[0]
      if (target === 'email') message = 'Cet email est déjà utilisé.'
      else if (target === 'studentNumber') message = 'Numéro étudiant en conflit. Veuillez réessayer.'
      else message = 'Une donnée est déjà utilisée (email ou numéro étudiant).'
    } else if (code === 'P2025') {
      message = 'Enregistrement introuvable.'
    } else if (error?.message) {
      message = error.message
    }

    return NextResponse.json(
      { error: message, details: error?.message },
      { status: 500 }
    )
  }
}
