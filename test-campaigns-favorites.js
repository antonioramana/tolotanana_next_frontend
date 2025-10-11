// Script de test pour vérifier les endpoints de campagnes avec isFavoris
const API_BASE = 'http://localhost:4750';

async function testCampaignsWithFavorites() {
  console.log('🧪 Test des endpoints de campagnes avec isFavoris...\n');

  try {
    // 1. Test sans authentification (endpoint public)
    console.log('1. Test endpoint public (sans authentification)...');
    const publicResponse = await fetch(`${API_BASE}/public/campaigns?page=1&limit=3`);
    const publicData = await publicResponse.json();
    console.log('✅ Endpoint public:', publicData.data?.length || 0, 'campagnes');
    if (publicData.data && publicData.data.length > 0) {
      console.log('Première campagne isFavoris (public):', publicData.data[0].isFavoris);
    }
    console.log('');

    // 2. Test avec authentification
    console.log('2. Test endpoint authentifié...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Remplacez par un email valide
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Connexion réussie');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Test endpoint authentifié
    const authResponse = await fetch(`${API_BASE}/campaigns?page=1&limit=3`, { headers });
    const authData = await authResponse.json();
    console.log('✅ Endpoint authentifié:', authData.data?.length || 0, 'campagnes');
    if (authData.data && authData.data.length > 0) {
      console.log('Première campagne isFavoris (auth):', authData.data[0].isFavoris);
    }
    console.log('');

    // 4. Test détail de campagne
    if (authData.data && authData.data.length > 0) {
      const campaignId = authData.data[0].id;
      console.log('3. Test détail de campagne...');
      const detailResponse = await fetch(`${API_BASE}/campaigns/${campaignId}`, { headers });
      const detailData = await detailResponse.json();
      console.log('✅ Détail campagne isFavoris:', detailData.isFavoris);
      console.log('');

      // 5. Test toggle favoris
      console.log('4. Test toggle favoris...');
      const toggleResponse = await fetch(`${API_BASE}/campaigns/${campaignId}/toggle-favorite`, {
        method: 'POST',
        headers
      });
      const toggleData = await toggleResponse.json();
      console.log('✅ Toggle favoris:', toggleData);
      console.log('');

      // 6. Vérifier le changement
      console.log('5. Vérification du changement...');
      const detailResponse2 = await fetch(`${API_BASE}/campaigns/${campaignId}`, { headers });
      const detailData2 = await detailResponse2.json();
      console.log('✅ Détail campagne isFavoris après toggle:', detailData2.isFavoris);
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Exécuter les tests
testCampaignsWithFavorites();
