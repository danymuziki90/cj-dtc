import { prisma } from '@/lib/prisma'

/**
 * Source unique des sessions visibles par les visiteurs et les étudiants.
 * Les canaux clients consomment /api/sessions, tandis que les routes serveur
 * peuvent appeler directement cette fonction pour ne jamais diverger.
 */
export async function getPublishedSessions(now = new Date()) {
  const sessions = await prisma.trainingSession.findMany({
    where: {
      status: 'ouverte',
      startDate: { gte: now },
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
