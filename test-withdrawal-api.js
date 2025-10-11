
// Script de test pour l'API route de validation des retraits
// À exécuter dans la console du navigateur

async function testWithdrawalValidationAPI() {
  console.log('🧪 Test de l'API de validation des retraits...');
  
  // Données de test
  const testData = {
    withdrawalId: 'test-withdrawal-id',
    action: 'approved',
    captchaToken: 'test-captcha-token'
  };
  
  // Token d'autorisation simulé
  const authToken = 'Bearer test-token';
  
  try {
    console.log('📤 Envoi de la requête...');
    console.log('📝 Données:', testData);
    
    const response = await fetch('/api/admin/withdrawals/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Réponse reçue:');
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📝 Response Body:', responseText);
    
    if (response.ok) {
      console.log('✅ Test réussi !');
    } else {
      console.log('❌ Test échoué !');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testWithdrawalValidationAPI();
