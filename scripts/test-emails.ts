import { sendAcceptanceEmail, sendRejectionEmail } from '../lib/email'

// Test data
const testEnrollment = {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'test@example.com',
    phone: '+33612345678',
    address: '123 Rue de Paris, 75001 Paris',
    startDate: new Date('2024-03-15'),
    status: 'accepted',
    formation: {
        id: 1,
        title: 'Développement Web Avancé',
        description: 'Une formation complète sur le développement web moderne avec React et Node.js',
        slug: 'dev-web-avance'
    }
}

async function runTests() {
    console.log('🧪 Tests d\'envoi d\'emails\n')

    try {
        console.log('1️⃣  Test d\'email d\'acceptation...')
        const acceptanceResult = await sendAcceptanceEmail(testEnrollment.email, testEnrollment.formation.title)
        console.log('✅ Email d\'acceptation:', acceptanceResult)
        console.log()

        console.log('2️⃣  Test d\'email de rejet (avec raison)...')
        const rejectionResult = await sendRejectionEmail(
            testEnrollment.email,
            testEnrollment.formation.title,
            'Nous avons reçu trop de candidatures pour cette formation'
        )
        console.log('✅ Email de rejet:', rejectionResult)
        console.log()

        console.log('3️⃣  Test d\'email de rejet (sans raison)...')
        const rejectionResultNoReason = await sendRejectionEmail(testEnrollment.email, testEnrollment.formation.title)
        console.log('✅ Email de rejet (sans raison):', rejectionResultNoReason)
        console.log()

        console.log('🎉 Tous les tests sont passés!')
    } catch (error: any) {
        console.error('❌ Erreur lors des tests:', error.message)
        console.error('Détails:', error)
        process.exit(1)
    }
}

runTests()
