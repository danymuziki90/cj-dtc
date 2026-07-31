import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  STUDENT_AUTH_COOKIE,
  STUDENT_TOKEN_MAX_AGE,
  getAuthCookieOptions,
  signStudentToken,
} from '@/lib/auth-portal/jwt'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/fr/auth/student-login?error=MissingToken', request.url))
    }

    // Trouver le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/fr/auth/student-login?error=InvalidToken', request.url))
    }

    if (new Date() > verificationToken.expires) {
      // Le token est expiré
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.redirect(new URL('/fr/auth/student-login?error=ExpiredToken', request.url))
    }

    // Trouver l'étudiant associé
    const student = await prisma.student.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!student) {
      return NextResponse.redirect(new URL('/fr/auth/student-login?error=UserNotFound', request.url))
    }

    // Activer l'étudiant et supprimer le token
    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: student.id },
        data: { status: 'ACTIVE' },
      })

      // Activer l'utilisateur global (optionnel selon le système)
      await tx.user.updateMany({
        where: { email: student.email },
        data: { emailVerified: new Date() },
      }).catch(() => null) // Ignore si le champ n'existe pas ou si la mise à jour échoue

      await tx.verificationToken.delete({
        where: { token },
      })
    })

    // (Optionnel) Connecter automatiquement l'utilisateur après vérification
    // On génère le jeton JWT étudiant et on le met dans un cookie, puis on redirige
    const jwtToken = await signStudentToken({
      sub: student.id,
      studentId: student.id,
      username: student.username || student.email,
    })

    const response = NextResponse.redirect(new URL('/fr/auth/student-login?verified=true', request.url))
    response.cookies.set(STUDENT_AUTH_COOKIE, jwtToken, getAuthCookieOptions(STUDENT_TOKEN_MAX_AGE))
    
    return response

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/fr/auth/student-login?error=ServerError', request.url))
  }
}
