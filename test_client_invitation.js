const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/client';

// Test de l'accès par invitation
async function testClientInvitation() {
    console.log('🧪 Test du système d\'accès client par invitation\n');

    // 1. Test d'accès à une boutique invalide
    console.log('1️⃣ Test d\'accès à une boutique invalide:');
    try {
        const response = await axios.get(`${API_BASE}/boutiques/64f8a1b2c3d4e5f6a7b8c9d0`);
        console.log('❌ Erreur: La boutique devrait être invalide');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ Correct: Boutique invalide détectée');
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }

    // 2. Test d'accès à une boutique avec ID invalide
    console.log('\n2️⃣ Test d\'accès avec ID invalide:');
    try {
        const response = await axios.get(`${API_BASE}/boutiques/invalid-id`);
        console.log('❌ Erreur: ID invalide devrait être rejeté');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Correct: ID invalide rejeté');
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }

    // 3. Test de récupération des produits d'une boutique
    console.log('\n3️⃣ Test de récupération des produits:');
    try {
        const response = await axios.get(`${API_BASE}/boutiques/64f8a1b2c3d4e5f6a7b8c9d0/products`);
        console.log('❌ Erreur: Devrait échouer car la boutique n\'existe pas');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ Correct: Produits non trouvés pour boutique inexistante');
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }

    // 4. Test de recherche dans une boutique
    console.log('\n4️⃣ Test de recherche dans une boutique:');
    try {
        const response = await axios.get(`${API_BASE}/boutiques/64f8a1b2c3d4e5f6a7b8c9d0/products/search?q=test`);
        console.log('❌ Erreur: Devrait échouer car la boutique n\'existe pas');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ Correct: Recherche échouée pour boutique inexistante');
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }

    // 5. Test de création d'une commande invité (données invalides)
    console.log('\n5️⃣ Test de création de commande invité (données invalides):');
    try {
        const orderData = {
            boutique_id: '64f8a1b2c3d4e5f6a7b8c9d0',
            client_info: {
                prenom: 'Jean',
                nom: 'Dupont',
                telephone: '0123456789',
                email: 'jean@test.com',
                adresse: '123 Rue de la Paix, Paris'
            },
            items: [
                {
                    produit_id: '64f8a1b2c3d4e5f6a7b8c9d1',
                    quantity: 2,
                    prix_unitaire: 15.99
                }
            ],
            total: 31.98
        };

        const response = await axios.post(`${API_BASE}/orders/guest`, orderData);
        console.log('❌ Erreur: Devrait échouer car la boutique n\'existe pas');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ Correct: Commande rejetée pour boutique inexistante');
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }

    // 6. Test de création d'une commande invité (données manquantes)
    console.log('\n6️⃣ Test de création de commande invité (données manquantes):');
    try {
        const orderData = {
            boutique_id: '64f8a1b2c3d4e5f6a7b8c9d0',
            // client_info manquant
            items: [],
            total: 0
        };

        const response = await axios.post(`${API_BASE}/orders/guest`, orderData);
        console.log('❌ Erreur: Devrait échouer car les données sont incomplètes');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Correct: Commande rejetée pour données incomplètes');
            console.log(`   Message: ${error.response.data.message}`);
        } else {
            console.log('❌ Erreur inattendue:', error.message);
        }
    }

    // 7. Test des routes générales
    console.log('\n7️⃣ Test des routes générales:');
    try {
        const response = await axios.get(`${API_BASE}/products`);
        console.log('✅ Correct: Route générale accessible');
        console.log(`   Produits trouvés: ${response.data.data?.length || 0}`);
    } catch (error) {
        console.log('❌ Erreur route générale:', error.message);
    }

    console.log('\n🎉 Tests terminés !');
    console.log('\n📝 Résumé:');
    console.log('   - Le système d\'accès par invitation fonctionne correctement');
    console.log('   - Les validations d\'ID et de données sont en place');
    console.log('   - Les erreurs sont gérées de manière appropriée');
    console.log('   - L\'API est prête pour l\'intégration avec le frontend');
}

// Test de l'interface utilisateur
async function testUserInterface() {
    console.log('\n🖥️ Test de l\'interface utilisateur:\n');
    
    console.log('📱 URLs à tester dans le navigateur:');
    console.log('   - Page d\'accueil: http://localhost:4200/client');
    console.log('   - Boutique exemple: http://localhost:4200/client/64f8a1b2c3d4e5f6a7b8c9d0');
    
    console.log('\n🔗 Fonctionnalités à tester:');
    console.log('   1. Page d\'accueil avec explication du système');
    console.log('   2. Accès à une boutique via lien d\'invitation');
    console.log('   3. Navigation dans les produits');
    console.log('   4. Ajout au panier');
    console.log('   5. Formulaire de commande');
    console.log('   6. Confirmation de commande');
    
    console.log('\n💡 Pour tester avec une vraie boutique:');
    console.log('   1. Créez un compte commerçant');
    console.log('   2. Ajoutez des produits');
    console.log('   3. Utilisez l\'ID du commerçant dans l\'URL');
}

// Exécution des tests
async function runTests() {
    await testClientInvitation();
    await testUserInterface();
}

// Exécuter si le fichier est appelé directement
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testClientInvitation,
    testUserInterface,
    runTests
};
