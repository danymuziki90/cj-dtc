/**
 * Script de seed pour initialiser les HeroSections avec les données actuelles
 * Exécuter: npx tsx scripts/seed-heroes.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HERO_DEFAULTS = [
  {
    pageKey: 'home',
    titleFr: 'CJ DEVELOPMENT TRAINING CENTER',
    titleEn: 'CJ DEVELOPMENT TRAINING CENTER',
    eyebrowFr: 'Centre de Formation Panafricain',
    eyebrowEn: 'Pan-African Training Center',
    descriptionFr: "Former, accompagner, inspirer et révéler les talents pour bâtir des carrières solides, des entreprises performantes et des leaders d'impact.",
    descriptionEn: 'Training, guiding, inspiring, and unleashing talents to build solid careers, high-performing enterprises, and impactful leaders.',
    defaultImageUrl: '/lor-de-formation.jpeg',
    overlayOpacity: 50,
    compact: false,
    slides: [
      {
        order: 0,
        imageUrl: '/lor-de-formation.jpeg',
        eyebrowFr: 'Centre de Formation Panafricain',
        eyebrowEn: 'Pan-African Training Center',
        titleFr: 'CJ DEVELOPMENT TRAINING CENTER',
        titleEn: 'CJ DEVELOPMENT TRAINING CENTER',
        descriptionFr: "Former, accompagner, inspirer et révéler les talents pour bâtir des carrières solides, des entreprises performantes et des leaders d'impact.",
        descriptionEn: 'Training, guiding, inspiring, and unleashing talents to build solid careers, high-performing enterprises, and impactful leaders.',
        badgeFr: 'Excellence Panafricaine',
        badgeEn: 'Pan-African Excellence',
      },
      {
        order: 1,
        imageUrl: '/img/certificat 1.jpeg',
        eyebrowFr: 'Solutions Pour Entreprises',
        eyebrowEn: 'Enterprise Solutions',
        titleFr: 'Formations Professionnelles pour les Entreprises',
        titleEn: 'Corporate Professional Training',
        descriptionFr: "Renforcez les compétences de vos collaborateurs grâce à des formations professionnelles sur mesure, conçues pour améliorer la performance, le leadership et la productivité de votre organisation.",
        descriptionEn: 'Empower your teams with customized professional training designed to enhance performance, leadership, and productivity.',
        badgeFr: 'Sur Mesure & In-Company',
        badgeEn: 'Customized & In-Company',
      },
      {
        order: 2,
        imageUrl: '/apropos.jpeg',
        eyebrowFr: 'Accompagnement & Carrière',
        eyebrowEn: 'Career Guidance & Support',
        titleFr: 'Orientation et Insertion Professionnelle',
        titleEn: 'Career Guidance & Professional Insertion',
        descriptionFr: "Préparez votre avenir professionnel avec confiance. Nous vous accompagnons dans votre orientation, la construction de votre projet de carrière et votre insertion sur le marché de l'emploi.",
        descriptionEn: 'Prepare your professional future with confidence. We guide your orientation, career project building, and employment market insertion.',
        badgeFr: 'Parcours IOP Certifié',
        badgeEn: 'Certified IOP Program',
      },
    ],
  },
  {
    pageKey: 'about',
    titleFr: 'Notre Histoire & Notre Mission',
    titleEn: 'Our Story & Mission',
    eyebrowFr: 'À Propos de CJ DTC',
    eyebrowEn: 'About CJ DTC',
    descriptionFr: "Depuis 2018, CJ Development Training Center forme les talents africains en leadership, management des RH et développement professionnel.",
    descriptionEn: 'Since 2018, CJ Development Training Center has been shaping African talent in leadership, HR management and professional development.',
    defaultImageUrl: '/apropos.jpeg',
    overlayOpacity: 55,
    compact: false,
  },
  {
    pageKey: 'sessions',
    titleFr: 'Nos Sessions de Formation',
    titleEn: 'Our Training Sessions',
    eyebrowFr: 'Formations Certifiantes',
    eyebrowEn: 'Certified Training',
    descriptionFr: "Inscrivez-vous aux prochaines sessions ouvertes et développez vos compétences en RH, leadership et management avec des formateurs experts.",
    descriptionEn: 'Join our upcoming open sessions and develop your HR, leadership and management skills with expert trainers and recognized certifications.',
    defaultImageUrl: '/img/Formaions 2.jpg',
    overlayOpacity: 55,
    compact: false,
  },
  {
    pageKey: 'entreprises',
    titleFr: 'Solutions de Formation pour les Entreprises',
    titleEn: 'Corporate Training Solutions',
    eyebrowFr: 'Partenaire stratégique RH & Formation',
    eyebrowEn: 'Strategic HR & Training Partner',
    descriptionFr: "Accompagnez le développement des compétences de vos équipes grâce à des formations adaptées aux besoins de votre organisation.",
    descriptionEn: "Support your teams' skills development with training tailored to your organisation's needs.",
    defaultImageUrl: '/img/ceo.jpeg',
    overlayOpacity: 60,
    compact: false,
  },
  {
    pageKey: 'actualites',
    titleFr: 'Actualités et Opportunités',
    titleEn: 'News and Opportunities',
    eyebrowFr: 'Actualités & Événements',
    eyebrowEn: 'News & Events',
    descriptionFr: "Découvrez les dernières actualités, événements, annonces et opportunités publiées par CJ Development Training Center.",
    descriptionEn: 'Explore the latest news, events, announcements and opportunities published by CJ Development Training Center.',
    defaultImageUrl: '/img/actu.jpeg',
    overlayOpacity: 55,
    compact: true,
  },
  {
    pageKey: 'contact',
    titleFr: 'Contactez Notre Équipe',
    titleEn: 'Contact Our Team',
    eyebrowFr: 'Nous Contacter',
    eyebrowEn: 'Contact Us',
    descriptionFr: "Notre équipe est disponible pour répondre à vos questions et vous accompagner dans votre projet de formation.",
    descriptionEn: 'Our team is available to answer your questions and support your training project.',
    defaultImageUrl: '/img/team.jpeg',
    overlayOpacity: 55,
    compact: false,
  },
  {
    pageKey: 'emplois',
    titleFr: 'Opportunités de Carrière',
    titleEn: 'Career Opportunities',
    eyebrowFr: "Offres d'emploi",
    eyebrowEn: 'Job Openings',
    descriptionFr: "Découvrez les offres d'emploi, stages et opportunités proposées par notre réseau de partenaires.",
    descriptionEn: 'Explore job openings, internships and opportunities from our partner network.',
    defaultImageUrl: '/img/actu.jpeg',
    overlayOpacity: 55,
    compact: true,
  },
  {
    pageKey: 'galerie',
    titleFr: 'Galerie Photos & Moments Forts',
    titleEn: 'Photo Gallery & Highlights',
    eyebrowFr: 'Vie académique',
    eyebrowEn: 'Academic Life',
    descriptionFr: "Explorez en images l'ambiance des ateliers pratiques, les remises de diplômes et les rencontres des promotions CJ DTC.",
    descriptionEn: 'Explore the atmosphere of practical workshops, graduations, and CJ DTC alumni meetings in pictures.',
    defaultImageUrl: '/img/actu.jpeg',
    overlayOpacity: 55,
    compact: true,
  },
  {
    pageKey: 'partenaires',
    titleFr: 'Nos Partenaires Institutionnels',
    titleEn: 'Our Institutional Partners',
    eyebrowFr: 'Réseau de Partenaires',
    eyebrowEn: 'Partner Network',
    descriptionFr: "CJ DTC s'appuie sur un réseau de partenaires institutionnels, académiques et professionnels pour offrir des formations de haut niveau.",
    descriptionEn: 'CJ DTC relies on a network of institutional, academic and professional partners to deliver high-level training.',
    defaultImageUrl: '/img/certificat 1.jpeg',
    overlayOpacity: 55,
    compact: true,
  },
]

async function main() {
  console.log('🌱 Seeding HeroSection data...')

  for (const heroData of HERO_DEFAULTS) {
    const { slides, ...heroFields } = heroData

    // Upsert la section hero (ne pas écraser si déjà existante avec des données custom)
    const existing = await prisma.heroSection.findUnique({
      where: { pageKey: heroFields.pageKey },
    })

    if (!existing) {
      const created = await prisma.heroSection.create({
        data: {
          ...heroFields,
          imageUrl: null, // Pas d'image uploadée par défaut
        },
      })
      console.log(`  ✓ Created HeroSection: ${heroFields.pageKey}`)

      // Créer les slides pour la page home
      if (slides && slides.length > 0) {
        for (const slide of slides) {
          await prisma.heroSlide.create({
            data: { heroId: created.id, ...slide },
          })
        }
        console.log(`  ✓ Created ${slides.length} slides for: ${heroFields.pageKey}`)
      }
    } else {
      console.log(`  → Already exists, skipping: ${heroFields.pageKey}`)
    }
  }

  console.log('✅ HeroSection seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
