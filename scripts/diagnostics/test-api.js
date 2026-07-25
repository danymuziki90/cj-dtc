async function testAPI() {
    try {
        console.log('🔄 Test de l\'API sessions...');
        const response = await fetch('http://localhost:3000/api/sessions');

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API fonctionne !');
            console.log(`📊 ${data.length} sessions trouvées`);

            if (data.length > 0) {
                const session = data[0];
                console.log('\n🎓 Première session:');
                console.log(`   Titre: ${session.formation?.title || 'Sans titre'}`);
                console.log(`   Catégorie: ${session.formation?.categorie || 'Non définie'}`);
                console.log(`   Date: ${new Date(session.startDate).toLocaleDateString('fr-FR')}`);
                console.log(`   Lieu: ${session.location}`);
                console.log(`   Format: ${session.format}`);
                console.log(`   Participants: ${session.currentParticipants || 0}/${session.maxParticipants}`);
                console.log(`   Prix: ${session.price} USD`);
                console.log(`   Status: ${session.status}`);
                if (session.imageUrl) {
                    console.log(`   Image: ✅ Présente`);
                }
            } else {
                console.log('ℹ️ Aucune session trouvée dans la base de données');
            }
        } else {
            console.log(`❌ Erreur API: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.log('❌ Erreur de connexion:', error.message);
        console.log('💡 Vérifiez que le serveur Next.js est démarré sur le port 3000');
    }
}

testAPI();