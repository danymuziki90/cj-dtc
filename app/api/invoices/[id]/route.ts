import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        enrollment: {
          include: {
            formation: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la facture' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)
    const body = await req.json()
    const { status, paidDate, sentAt, notes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (paidDate) updateData.paidDate = new Date(paidDate)
    if (sentAt) updateData.sentAt = new Date(sentAt)
    if (notes !== undefined) updateData.notes = notes

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        enrollment: {
          include: {
            formation: true
          }
        }
      }
    })

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la facture' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)

    await prisma.invoice.delete({
      where: { id: invoiceId }
    })

    return NextResponse.json({ message: 'Facture supprimée' })
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la facture' },
      { status: 500 }
    )
  }
}
