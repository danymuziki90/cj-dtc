import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../../lib/prisma'
import { apiHandler, ApiError } from '@/lib/api-error'

export const GET = apiHandler(async (req: NextRequest) => {
  const session: any = await getServerSession(authOptions)
  
  if (!session || session.user?.role !== 'admin') {
    throw new ApiError(403, 'Accès non autorisé')
  }

    // Récupérer toutes les inscriptions avec les informations des utilisateurs
    const enrollments = await prisma.enrollment.findMany({
      include: {
        formation: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Grouper par étudiant pour créer la liste des étudiants
    const studentMap = new Map()

    enrollments.forEach((enrollment: any) => {
      const studentKey = enrollment.email
      
      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          id: enrollment.id,
          firstName: enrollment.firstName,
          lastName: enrollment.lastName,
          email: enrollment.email,
          phone: enrollment.phone,
          address: enrollment.address,
          matricule: enrollment.matricule,
          enrollments: []
        })
      }
      
      const student = studentMap.get(studentKey)
      student.enrollments.push({
        id: enrollment.id,
        status: enrollment.status,
        formation: {
          title: enrollment.formation.title,
          categorie: enrollment.formation.categorie
        },
        startDate: enrollment.startDate
      })
    })

    const students = Array.from(studentMap.values())

  return NextResponse.json(students)
})
