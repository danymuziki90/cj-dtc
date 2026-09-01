import { prisma } from '@/lib/prisma'

export const directorWelcomeDefaults = {
  id: 'director-welcome', isActive: true, imageUrl: '/apropos.jpeg', name: 'Direction Générale',
  titleFr: 'Directeur Général', titleEn: 'Managing Director',
  messageFr: "Bienvenue à CJ Development Training Center. Nous vous accompagnons avec exigence, proximité et engagement afin de transformer vos ambitions en compétences concrètes et durables.",
  messageEn: 'Welcome to CJ Development Training Center. We support you with high standards, close attention and commitment to turn your ambitions into concrete, lasting skills.',
}

export async function getDirectorWelcome() {
  try {
    const content = await prisma.directorWelcome.findUnique({ where: { id: 'director-welcome' } })
    return { ...directorWelcomeDefaults, ...content }
  } catch (error) {
    console.error('[getDirectorWelcome]', error)
    return directorWelcomeDefaults
  }
}
