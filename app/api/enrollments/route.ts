import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const formationId = url.searchParams.get('formationId')
    
    const where = formationId ? { formationId: parseInt(formationId) } : {}
    
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(enrollments)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    if (!body.firstName || !body.lastName || !body.email || !body.formationId || !body.startDate) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        formationId: parseInt(body.formationId),
        startDate: new Date(body.startDate),
        notes: body.notes || null,
        status: 'pending'
      },
      include: {
        formation: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Une inscription avec cet email existe déjà pour cette formation' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'inscription' },
      { status: 500 }
    )
  }
}
