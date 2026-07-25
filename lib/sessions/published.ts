import { prisma } from '@/lib/prisma'
import {
  parseSessionMetadata,
  normalizeParticipationType,
} from '@/lib/sessions/metadata'

/**
 * Source unique de vérité des sessions ouvertes aux visiteurs et aux étudiants.
 * Récupère uniquement les sessions actives et ouvertes aux inscriptions.
 * Exclut systématiquement les sessions fermées, annulées, terminées, brouillons et archivées.
 */
export async function getPublishedSessions(now = new Date()) {
  const sessions = await prisma.trainingSession.findMany({
    where: {
      status: {
        in: ['ouverte', 'open', 'complete'],
      },
    },
    include: {
      formation: {
        select: {
          id: true,
          title: true,
          slug: true,
          categorie: true,
          description: true,
          imageUrl: true,
        },
      },
      enrollments: {
        where: {
          status: { notIn: ['waitlist', 'rejected', 'cancelled'] },
        },
        select: { id: true },
      },
    },
    orderBy: { startDate: 'asc' },
  })

  // Traiter et enrichir les sessions avec les métadonnées sérialisées et le décompte exact
  return sessions.map((session) => {
    const parsedMetadata = parseSessionMetadata(session.prerequisites)
    const resolvedImageUrl = parsedMetadata.metadata.imageUrl || session.imageUrl || session.formation?.imageUrl || null
    const currentParticipants = Array.isArray(session.enrollments) ? session.enrollments.length : 0

    return {
      ...session,
      imageUrl: resolvedImageUrl,
      currentParticipants,
      prerequisitesText: parsedMetadata.prerequisitesText,
      adminMeta: {
        customTitle: parsedMetadata.metadata.customTitle || null,
        sessionType: parsedMetadata.metadata.sessionType || (session.formation?.categorie ?? null),
        durationLabel: parsedMetadata.metadata.durationLabel || null,
        paymentInfo: parsedMetadata.metadata.paymentInfo || null,
        participationType:
          parsedMetadata.metadata.participationType || normalizeParticipationType(session.format),
        imageUrl: resolvedImageUrl,
        registrationDeadline: parsedMetadata.metadata.registrationDeadline || null,
      },
    }
  })
}
