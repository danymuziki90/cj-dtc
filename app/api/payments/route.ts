import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://localhost')
    const { searchParams } = url
    const enrollmentId = searchParams.get('enrollmentId')
    const status = searchParams.get('status')

    const where: any = {}
    if (enrollmentId) {
      where.enrollmentId = parseInt(enrollmentId)
    }
    if (status) {
      where.status = status
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        enrollment: {
          include: {
            formation: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Erreur lors de la récupération des paiements:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { enrollmentId, amount, method, transactionId, reference, notes } = body

    if (!enrollmentId || !amount || !method) {
      return NextResponse.json(
        { error: 'enrollmentId, amount et method sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'inscription existe
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Inscription non trouvée' },
        { status: 404 }
      )
    }

    // Créer le paiement
    const payment = await prisma.payment.create({
      data: {
        enrollmentId,
        amount: parseFloat(amount),
        method,
        transactionId: transactionId || null,
        reference: reference || null,
        notes: notes || null,
        status: 'completed',
        paidAt: new Date()
      },
      include: {
        enrollment: {
          include: {
            formation: true
          }
        }
      }
    })

    // Mettre à jour le statut de paiement de l'inscription
    const totalPaid = await prisma.payment.aggregate({
      where: {
        enrollmentId,
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    })

    const newPaidAmount = totalPaid._sum.amount || 0
    let newPaymentStatus = 'unpaid'
    if (newPaidAmount >= enrollment.totalAmount) {
      newPaymentStatus = 'paid'
    } else if (newPaidAmount > 0) {
      newPaymentStatus = 'partial'
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus: newPaymentStatus,
        paymentDate: newPaidAmount >= enrollment.totalAmount ? new Date() : enrollment.paymentDate
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de la création du paiement:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cette transaction existe déjà' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
