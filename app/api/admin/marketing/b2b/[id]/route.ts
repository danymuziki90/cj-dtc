import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) {
      return auth.error
    }

    const { id } = await params
    const requestId = parseInt(id, 10)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    const body = await req.json()
    const { status, notes, company, contactName, position, email, phone, sector, employees, needType, message } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (company !== undefined) updateData.company = company
    if (contactName !== undefined) updateData.contactName = contactName
    if (position !== undefined) updateData.position = position
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (sector !== undefined) updateData.sector = sector
    if (employees !== undefined) updateData.employees = employees
    if (needType !== undefined) updateData.needType = needType
    if (message !== undefined) updateData.message = message

    const updated = await prisma.b2BRequest.update({
      where: { id: requestId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error PUT /api/admin/marketing/b2b/[id]:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) {
      return auth.error
    }

    const { id } = await params
    const requestId = parseInt(id, 10)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    await prisma.b2BRequest.delete({
      where: { id: requestId },
    })

    return NextResponse.json({ message: 'Demande B2B supprimée avec succès' })
  } catch (error) {
    console.error('Error DELETE /api/admin/marketing/b2b/[id]:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
