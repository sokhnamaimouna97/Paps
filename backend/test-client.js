const axios = require('axios');

const API_URL = 'http://localhost:5000/api/client';

// Données de test pour un client
const testClient = {
  prenom: 'Jean',
  nom: 'Dupont',
  telephone: '0123456789',
  email: 'jean.dupont@test.com',
  password: 'password123',
  adress: '123 Rue de la Paix, 75001 Paris'
};

async function testClientRegistration() {
  try {
    console.log('🔄 Test d\'inscription client...');
    
    const response = await axios.post(`${API_URL}/register`, testClient);
    
    console.log('✅ Inscription réussie !');
    console.log('Token:', response.data.token);
    console.log('Utilisateur:', response.data.user);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error.response?.data || error.message);
    return null;
  }
}

async function testClientLogin() {
  try {
    console.log('🔄 Test de connexion client...');
    
    const loginData = {
      email: testClient.email,
      password: testClient.password
    };
    
    const response = await axios.post(`${API_URL}/login`, loginData);
    
    console.log('✅ Connexion réussie !');
    console.log('Token:', response.data.token);
    console.log('Utilisateur:', response.data.user);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error.response?.data || error.message);
    return null;
  }
}

async function testProducts() {
  try {
    console.log('🔄 Test de récupération des produits...');
    
    const response = await axios.get(`${API_URL}/products`);
    
    console.log('✅ Produits récupérés !');
    console.log('Nombre de produits:', response.data.data.length);
    console.log('Premier produit:', response.data.data[0]);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error.response?.data || error.message);
    return null;
  }
}

async function testCategories() {
  try {
    console.log('🔄 Test de récupération des catégories...');
    
    const response = await axios.get(`${API_URL}/categories`);
    
    console.log('✅ Catégories récupérées !');
    console.log('Nombre de catégories:', response.data.data.length);
    console.log('Catégories:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests de l\'API client...\n');
  
  // Test 1: Inscription
  const token = await testClientRegistration();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Connexion
  const loginToken = await testClientLogin();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Produits
  const products = await testProducts();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Catégories
  const categories = await testCategories();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('🎉 Tests terminés !');
  console.log('\n📋 Résumé :');
  console.log('- Inscription:', token ? '✅ Réussi' : '❌ Échec');
  console.log('- Connexion:', loginToken ? '✅ Réussi' : '❌ Échec');
  console.log('- Produits:', products ? `✅ ${products.length} produits` : '❌ Échec');
  console.log('- Catégories:', categories ? `✅ ${categories.length} catégories` : '❌ Échec');
  
  if (token || loginToken) {
    console.log('\n🔑 Informations de connexion pour le frontend :');
    console.log('Email:', testClient.email);
    console.log('Mot de passe:', testClient.password);
  }
}

// Exécuter les tests
runTests().catch(console.error);
