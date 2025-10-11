// Script de test simple pour l'API des favoris
const API_BASE = 'http://localhost:4750';

async function testFavoritesAPI() {
  console.log('🧪 Test de l\'API des favoris...\n');

  try {
    // 1. Test de connexion
    console.log('1. Test de connexion...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.log('✅ Connexion réussie\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Récupérer les campagnes
    console.log('2. Récupération des campagnes...');
    const campaignsResponse = await fetch(`${API_BASE}/campaigns?page=1&limit=3`, { headers });
    const campaignsData = await campaignsResponse.json();
    console.log('✅ Campagnes récupérées:', campaignsData.data?.length || 0, 'campagnes');

    if (campaignsData.data && campaignsData.data.length > 0) {
      const campaignId = campaignsData.data[0].id;
      console.log('Première campagne isFavoris:', campaignsData.data[0].isFavoris);
      console.log('');

      // 3. Test toggle favoris
      console.log('3. Test toggle favoris...');
      const toggleResponse = await fetch(`${API_BASE}/campaigns/${campaignId}/toggle-favorite`, {
        method: 'POST',
        headers
      });

      if (!toggleResponse.ok) {
        throw new Error(`Erreur toggle: ${toggleResponse.status}`);
      }

      const toggleData = await toggleResponse.json();
      console.log('✅ Toggle favoris:', toggleData);
      console.log('');

      // 4. Vérifier le statut après toggle
      console.log('4. Vérification du statut...');
      const campaignResponse = await fetch(`${API_BASE}/campaigns/${campaignId}`, { headers });
      const campaignData = await campaignResponse.json();
      console.log('✅ Détail campagne isFavoris:', campaignData.isFavoris);
      console.log('');

      // 5. Récupérer les favoris
      console.log('5. Récupération des favoris...');
      const favoritesResponse = await fetch(`${API_BASE}/favorites/my-favorites`, { headers });
      const favoritesData = await favoritesResponse.json();
      console.log('✅ Favoris récupérés:', favoritesData.data?.length || 0, 'favoris');
      console.log('');

      // 6. Toggle à nouveau pour nettoyer
      console.log('6. Nettoyage (toggle inverse)...');
      const toggleResponse2 = await fetch(`${API_BASE}/campaigns/${campaignId}/toggle-favorite`, {
        method: 'POST',
        headers
      });
      const toggleData2 = await toggleResponse2.json();
      console.log('✅ Toggle inverse:', toggleData2);
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Exécuter les tests
testFavoritesAPI();
