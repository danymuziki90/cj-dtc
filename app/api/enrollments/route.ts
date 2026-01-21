import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([])
    }

    const url = new URL(req.url, 'http://localhost')
    const formationId = url.searchParams.get('formationId')
    const status = url.searchParams.get('status')
    const paymentStatus = url.searchParams.get('paymentStatus')
    const startDateFrom = url.searchParams.get('startDateFrom')
    const startDateTo = url.searchParams.get('startDateTo')

    const where: any = {}
    if (formationId) where.formationId = parseInt(formationId)
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (startDateFrom || startDateTo) {
      where.startDate = {}
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom)
      if (startDateTo) where.startDate.lte = new Date(startDateTo)
    }

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
    const formData = await req.formData()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string | null
    const address = formData.get('address') as string | null
    const formationId = formData.get('formationId') as string
    const startDate = formData.get('startDate') as string
    const notes = formData.get('notes') as string | null
    const motivationFile = formData.get('motivation') as File | null

    if (!firstName || !lastName || !email || !formationId || !startDate) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    let motivationLetter = null

    // If a motivation letter file is provided, convert to base64 data URL
    if (motivationFile && motivationFile.size > 0) {
      const buffer = await motivationFile.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const mimeType = motivationFile.type || 'application/pdf'
      motivationLetter = `data:${mimeType};base64,${base64}`
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        formationId: parseInt(formationId),
        startDate: new Date(startDate),
        motivationLetter,
        notes: notes || null,
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
    console.error('Enrollment error:', error)
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
