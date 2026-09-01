import portraitCoach from '@/app/img/Portrait 5 Coach.jpg'
import { prisma } from '@/lib/prisma'

export const directorWelcomeDefaults = {
  id: 'director-welcome',
  isActive: true,
  imageUrl: portraitCoach.src,
  name: 'Coach Jimanel LWIGULIRA',
  titleFr: 'Founder & Chief Executive Officer',
  titleEn: 'Founder & Chief Executive Officer',
  messageFr: `Bienvenue à CJ Development Training Center.

Nous sommes partis d’une conviction simple : le talent existe partout, mais l’excellence exige une méthode, des standards et des opportunités.

Notre mission est de préparer des professionnels et des organisations capables non seulement de répondre aux exigences d’aujourd’hui, mais surtout de créer celles de demain.

Ici, nous ne promettons pas la réussite. Nous construisons les compétences, la discipline et le leadership qui la rendent possible.

Bienvenue dans un environnement où l’ambition rencontre l’exigence.`,
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
