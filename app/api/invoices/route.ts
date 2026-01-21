import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

// Générer un numéro de facture unique
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `FACT-${year}${month}-${random}`
}

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

    const invoices = await prisma.invoice.findMany({
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

    return NextResponse.json(invoices)
  } catch (error: any) {
    console.error('Erreur lors de la récupération des factures:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { enrollmentId, amount, taxAmount = 0, dueDate, notes } = body

    if (!enrollmentId || !amount) {
      return NextResponse.json(
        { error: 'enrollmentId et amount sont requis' },
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

    // Générer un numéro de facture unique
    let invoiceNumber = generateInvoiceNumber()
    let exists = true
    while (exists) {
      const existing = await prisma.invoice.findUnique({
        where: { invoiceNumber }
      })
      if (!existing) {
        exists = false
      } else {
        invoiceNumber = generateInvoiceNumber()
      }
    }

    // Créer la facture
    const totalAmount = parseFloat(amount) + (parseFloat(taxAmount) || 0)
    const invoice = await prisma.invoice.create({
      data: {
        enrollmentId,
        invoiceNumber,
        amount: parseFloat(amount),
        taxAmount: parseFloat(taxAmount) || 0,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        status: 'draft'
      },
      include: {
        enrollment: {
          include: {
            formation: true
          }
        }
      }
    })

    // Mettre à jour le numéro de facture dans l'inscription si c'est la première
    if (!enrollment.invoiceNumber) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          invoiceNumber: invoiceNumber
        }
      })
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de la création de la facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la facture' },
      { status: 500 }
    )
  }
}
