
// Script de test de connectivité backend
// À exécuter dans la console du navigateur

async function testBackendConnectivity() {
  console.log('🧪 Test de connectivité backend...');
  
  const apiUrl = 'http://localhost:3001';
  console.log('📝 URL API:', apiUrl);
  
  try {
    // Test de connectivité basique
    console.log('📤 Test de connectivité...');
    const response = await fetch(apiUrl + '/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Réponse health check:');
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.text();
      console.log('📝 Response:', data);
      console.log('✅ Backend accessible !');
    } else {
      console.log('⚠️ Backend répond mais avec erreur');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connectivité:', error);
    console.log('💡 Vérifiez que le backend NestJS est démarré sur le port 3001');
  }
}

// Exécuter le test
testBackendConnectivity();
