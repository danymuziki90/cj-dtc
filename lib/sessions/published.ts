import { prisma } from '@/lib/prisma'

/**
 * Source unique des sessions visibles par les visiteurs et les étudiants.
 * Récupère toutes les sessions publiées/actives (hors brouillon, archive et annulée).
 */
export async function getPublishedSessions(now = new Date()) {
  const sessions = await prisma.trainingSession.findMany({
    where: {
      status: {
        notIn: ['brouillon', 'archive', 'annulee']
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
        where: { status: { notIn: ['waitlist', 'rejected', 'cancelled'] } },
        select: { id: true },
      },
    },
    orderBy: { startDate: 'asc' },
  })

  return sessions
}
