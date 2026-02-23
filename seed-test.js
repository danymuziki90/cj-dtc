const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
    try {
        console.log('🌱 Création des données de test...');

        // Créer une formation
        const formation = await prisma.formation.create({
            data: {
                title: 'Formation Développement Web Full Stack',
                slug: 'formation-developpement-web-full-stack',
                description: 'Apprenez à développer des applications web complètes',
                categorie: 'Développement',
                duree: '120 heures',
                objectifs: 'Maîtriser les technologies web modernes',
                modules: 'HTML, CSS, JavaScript, React, Node.js, Databases'
            }
        });

        console.log('✅ Formation créée:', formation.title);

        // Créer des sessions
        const sessions = [
            {
                formationId: formation.id,
                startDate: new Date('2026-03-15'),
                endDate: new Date('2026-03-20'),
                startTime: '09:00',
                endTime: '17:00',
                location: 'Dakar, Sénégal',
                format: 'Presentiel',
                maxParticipants: 20,
                price: 250000,
                description: 'Session intensive de développement web avec projets pratiques',
                status: 'ouverte'
            },
            {
                formationId: formation.id,
                startDate: new Date('2026-04-10'),
                endDate: new Date('2026-04-15'),
                startTime: '14:00',
                endTime: '18:00',
                location: 'En ligne',
                format: 'Distanciel',
                maxParticipants: 25,
                price: 200000,
                description: 'Formation en ligne flexible pour les professionnels',
                status: 'ouverte'
            },
            {
                formationId: formation.id,
                startDate: new Date('2026-05-05'),
                endDate: new Date('2026-05-10'),
                startTime: '09:00',
                endTime: '17:00',
                location: 'Abidjan, Côte d\'Ivoire',
                format: 'Hybride',
                maxParticipants: 15,
                price: 220000,
                description: 'Formation hybride combinant présentiel et distanciel',
                status: 'ouverte'
            }
        ];

        for (const sessionData of sessions) {
            const session = await prisma.trainingSession.create({
                data: sessionData
            });
            console.log('✅ Session créée:', session.location, session.format);
        }

        console.log('🎉 Données de test créées avec succès !');
        console.log('📊 Visitez http://localhost:3000/programmes pour voir les sessions');

    } catch (error) {
        console.error('❌ Erreur lors de la création des données:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();