import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'
import { hashPassword, verifyPassword } from '@/lib/auth-portal/password'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().min(6).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(8).optional(),
})

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const [student, sessionsCount, submissionsCount, certificatesCount] = await Promise.all([
    prisma.student.findUnique({
      where: { id: auth.student.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        status: true,
        studentNumber: true,
        address: true,
        city: true,
        country: true,
        createdAt: true,
      },
    }),
    prisma.enrollment.count({
      where: { email: auth.student.email },
    }),
    prisma.studentSubmission.count({
      where: { studentId: auth.student.id },
    }),
    prisma.certificate.count({
      where: {
        enrollment: {
          is: {
            email: auth.student.email,
          },
        },
      },
    }),
  ])

  if (!student) {
    return NextResponse.json({ error: 'Etudiant introuvable.' }, { status: 404 })
  }

  return NextResponse.json({
    student: {
      ...student,
      whatsapp: student.phone,
    },
    metrics: {
      sessionsCount,
      submissionsCount,
      certificatesCount,
    },
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Donnees invalides.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const payload = parsed.data
    const currentStudent = await prisma.student.findUnique({
      where: { id: auth.student.id },
      select: { id: true, email: true, password: true },
    })

    if (!currentStudent) {
      return NextResponse.json({ error: 'Etudiant introuvable.' }, { status: 404 })
    }

    const nextEmail = payload.email?.trim().toLowerCase()
    if (nextEmail && nextEmail !== currentStudent.email) {
      const existing = await prisma.student.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      })

      if (existing) {
        return NextResponse.json({ error: 'Cet email est deja utilise.' }, { status: 409 })
      }
    }

    if (payload.newPassword) {
      if (!payload.currentPassword) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel est requis pour le changement.' },
          { status: 400 }
        )
      }

      const validCurrentPassword = await verifyPassword(payload.currentPassword, currentStudent.password)
      if (!validCurrentPassword) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
      }
    }

    const updatedPasswordHash = payload.newPassword ? await hashPassword(payload.newPassword) : null

    const updatedStudent = await prisma.student.update({
      where: { id: auth.student.id },
      data: {
        ...(payload.firstName !== undefined ? { firstName: payload.firstName.trim() } : {}),
        ...(payload.lastName !== undefined ? { lastName: payload.lastName.trim() } : {}),
        ...(nextEmail ? { email: nextEmail } : {}),
        ...(payload.whatsapp !== undefined ? { phone: payload.whatsapp.trim() } : {}),
        ...(payload.address !== undefined ? { address: payload.address.trim() || null } : {}),
        ...(payload.city !== undefined ? { city: payload.city.trim() || null } : {}),
        ...(payload.country !== undefined ? { country: payload.country.trim() || null } : {}),
        ...(updatedPasswordHash ? { password: updatedPasswordHash } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        status: true,
        studentNumber: true,
        address: true,
        city: true,
        country: true,
        createdAt: true,
      },
    })

    // Sync optional mirror user row when present.
    const user = await prisma.user.findUnique({
      where: { email: currentStudent.email },
      select: { id: true },
    })
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(nextEmail ? { email: nextEmail } : {}),
          ...(updatedPasswordHash ? { password: updatedPasswordHash } : {}),
          ...(payload.firstName || payload.lastName
            ? { name: `${payload.firstName || updatedStudent.firstName} ${payload.lastName || updatedStudent.lastName}`.trim() }
            : {}),
        },
      })
    }

    return NextResponse.json({
      success: true,
      student: {
        ...updatedStudent,
        whatsapp: updatedStudent.phone,
      },
    })
  } catch (error) {
    console.error('Student profile update error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
