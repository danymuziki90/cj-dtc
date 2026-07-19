import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import {
  mapParticipationTypeToFormat,
  normalizeParticipationType,
  parseSessionMetadata,
  serializeSessionMetadata,
  type ManagedSessionType,
  type ParticipationType,
} from '@/lib/sessions/metadata'

// GET /api/sessions/[id] - Recuperer une session specifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 })
    }

    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        formation: true,
        enrollments: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvee' }, { status: 404 })
    }

    const adminAccess = await requireAdmin(request)
    const isAdmin = !adminAccess.error
    const parsedMetadata = parseSessionMetadata(session.prerequisites)
    const deadline = parsedMetadata.metadata.registrationDeadline
    const registrationOpen = !deadline || new Date(deadline).getTime() >= Date.now()
    if (!isAdmin && (session.status !== 'ouverte' || session.formation.statut !== 'publie' || session.startDate < new Date() || !registrationOpen)) {
      return NextResponse.json({ error: 'Session non disponible' }, { status: 404 })
    }
    const resolvedImageUrl = parsedMetadata.metadata.imageUrl || session.imageUrl || null

    return NextResponse.json({
      ...session,
      imageUrl: resolvedImageUrl,
      prerequisitesText: parsedMetadata.prerequisitesText,
      currentParticipants: session.enrollments.filter(
        (enrollment) => !['waitlist', 'rejected', 'cancelled'].includes(enrollment.status)
      ).length,
      adminMeta: {
        customTitle: parsedMetadata.metadata.customTitle || null,
        sessionType: parsedMetadata.metadata.sessionType || null,
        durationLabel: parsedMetadata.metadata.durationLabel || null,
        paymentInfo: parsedMetadata.metadata.paymentInfo || null,
        participationType:
          parsedMetadata.metadata.participationType || normalizeParticipationType(session.format),
        imageUrl: resolvedImageUrl,
        registrationDeadline: parsedMetadata.metadata.registrationDeadline || null,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la recuperation de la session:', error)
    return NextResponse.json({ error: 'Erreur lors de la recuperation de la session' }, { status: 500 })
  }
}

// PUT /api/sessions/[id] - Modifier une session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 })
    }

    const body = await request.json()
    const {
      formationId,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      format,
      maxParticipants,
      price,
      status,
      description,
      prerequisites,
      objectives,
      imageUrl,
      sessionType,
      durationLabel,
      paymentInfo,
      customTitle,
      participationType,
      prerequisitesText,
      registrationDeadline,
    } = body

    const existingSession = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session non trouvee' }, { status: 404 })
    }

    const parsedExistingMetadata = parseSessionMetadata(existingSession.prerequisites)
    const mergedMetadata = {
      customTitle:
        customTitle !== undefined ? (customTitle as string) : parsedExistingMetadata.metadata.customTitle,
      sessionType:
        sessionType !== undefined
          ? (sessionType as ManagedSessionType)
          : parsedExistingMetadata.metadata.sessionType,
      durationLabel:
        durationLabel !== undefined
          ? (durationLabel as string)
          : parsedExistingMetadata.metadata.durationLabel,
      paymentInfo:
        paymentInfo !== undefined ? (paymentInfo as string) : parsedExistingMetadata.metadata.paymentInfo,
      participationType:
        participationType !== undefined
          ? (participationType as ParticipationType)
          : parsedExistingMetadata.metadata.participationType || normalizeParticipationType(format),
      imageUrl: imageUrl !== undefined ? (imageUrl as string) : parsedExistingMetadata.metadata.imageUrl,
      registrationDeadline:
        registrationDeadline !== undefined
          ? (registrationDeadline as string)
          : parsedExistingMetadata.metadata.registrationDeadline,
    }

    const nextPrerequisitesText =
      prerequisitesText !== undefined
        ? (prerequisitesText as string)
        : prerequisites !== undefined
        ? (prerequisites as string)
        : parsedExistingMetadata.prerequisitesText

    const updatedSession = await prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        ...(formationId && { formationId: parseInt(formationId) }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(location && { location }),
        ...((format || participationType) && {
          format: participationType
            ? mapParticipationTypeToFormat(participationType as ParticipationType)
            : format,
        }),
        ...(maxParticipants && { maxParticipants: parseInt(maxParticipants) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...((prerequisites !== undefined ||
          prerequisitesText !== undefined ||
          sessionType !== undefined ||
          durationLabel !== undefined ||
          paymentInfo !== undefined ||
          customTitle !== undefined ||
          participationType !== undefined ||
          imageUrl !== undefined ||
          registrationDeadline !== undefined) && {
          prerequisites: serializeSessionMetadata(mergedMetadata, nextPrerequisitesText),
        }),
        ...(objectives !== undefined && { objectives }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: {
        formation: true,
      },
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Erreur lors de la modification de la session:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de la session' }, { status: 500 })
  }
}

// DELETE /api/sessions/[id] - Supprimer une session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error
  try {
    const resolvedParams = await params
    const sessionId = parseInt(resolvedParams.id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 })
    }

    const existingSession = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session non trouvee' }, { status: 404 })
    }

    await prisma.trainingSession.delete({
      where: { id: sessionId },
    })

    return NextResponse.json({ message: 'Session supprimee avec succes' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de la session' }, { status: 500 })
  }
}
