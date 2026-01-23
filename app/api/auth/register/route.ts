
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateVerificationToken } from '../../../../lib/tokens'
import { sendVerificationEmail } from '../../../../lib/email'

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

    // Check if student exists (by email or explicit student number if provided)
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

    // Generate student number if not provided
    // Format: STU-YEAR-RANDOM
    const studentNumber = result.data.studentNumber || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    // Transaction to create both Student and User
    const [student, user] = await prisma.$transaction([
      prisma.student.create({
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
          status: 'PENDING'
        }
      }),
      prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          role: 'STUDENT',
        }
      })
    ])

    // Generate Verification Token
    const verificationToken = await generateVerificationToken(email)

    // Send Verification Email
    await sendVerificationEmail(email, verificationToken.token)

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      studentId: student.id,
      userId: user.id
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte', details: error.message },
      { status: 500 }
    )
  }
}
