import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-portal/password'
import {
  STUDENT_AUTH_COOKIE,
  STUDENT_TOKEN_MAX_AGE,
  getAuthCookieOptions,
  signStudentToken,
} from '@/lib/auth-portal/jwt'

export const runtime = 'nodejs'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet doit comporter au moins 2 caractères.'),
  email: z.string().email('Adresse e-mail invalide.'),
  username: z.string().min(3, 'Le nom d utilisateur doit comporter au moins 3 caractères.'),
  password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères.'),
  confirmPassword: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of parsed.error.errors) {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      }
      return NextResponse.json(
        { error: 'Données d\'inscription invalides.', details: { fieldErrors } },
        { status: 400 }
      )
    }

    const { fullName, email, username, password, confirmPassword } = parsed.data

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas.', details: { fieldErrors: { confirmPassword: 'Les mots de passe ne correspondent pas.' } } },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim().toLowerCase()

    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.student.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Un compte avec cette adresse e-mail existe déjà.', details: { fieldErrors: { email: 'Adresse e-mail déjà utilisée.' } } },
        { status: 409 }
      )
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await prisma.student.findFirst({
      where: { username: { equals: normalizedUsername, mode: 'insensitive' } },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà pris.', details: { fieldErrors: { username: 'Nom d\'utilisateur déjà pris.' } } },
        { status: 409 }
      )
    }

    // Séparer le nom complet
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || 'Étudiant'
    const lastName = nameParts.slice(1).join(' ') || firstName

    const hashedPassword = await hashPassword(password)
    const studentNumber = `STU-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-6)}`

    // Créer le compte Student et le User correspondant
    const student = await prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          username: normalizedUsername,
          password: hashedPassword,
          studentNumber,
          status: 'ACTIVE',
          role: 'STUDENT',
        },
      })

      await tx.user.upsert({
        where: { email: normalizedEmail },
        update: { password: hashedPassword, name: fullName },
        create: {
          email: normalizedEmail,
          name: fullName,
          password: hashedPassword,
          role: 'STUDENT',
        },
      }).catch(() => null)

      return createdStudent
    })

    // Générer le jeton JWT étudiant
    const token = await signStudentToken({
      sub: student.id,
      studentId: student.id,
      username: student.username || student.email,
    })

    const response = NextResponse.json({
      success: true,
      token,
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`.trim(),
        username: student.username,
        email: student.email,
        role: student.role,
      },
    }, { status: 201 })

    response.cookies.set(STUDENT_AUTH_COOKIE, token, getAuthCookieOptions(STUDENT_TOKEN_MAX_AGE))
    return response
  } catch (error) {
    console.error('Student registration error:', error)
    return NextResponse.json(
      { error: 'Impossible de créer le compte pour le moment. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
