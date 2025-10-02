// Script de test pour vérifier l'API de donation
// Exécuter avec: node test-donation-api.js

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';

async function testDonationAPI() {
  console.log('🧪 Test de l\'API de donation');
  console.log('📍 URL de base:', API_BASE);
  
  // Test 1: Vérifier que l'API est accessible
  try {
    console.log('\n1️⃣ Test de connectivité...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    console.log('✅ Statut de santé:', healthResponse.status);
  } catch (error) {
    console.log('❌ Erreur de connectivité:', error.message);
    return;
  }
  
  // Test 2: Lister les campagnes pour obtenir un ID valide
  try {
    console.log('\n2️⃣ Récupération des campagnes...');
    const campaignsResponse = await fetch(`${API_BASE}/campaigns?page=1&limit=5`);
    const campaignsData = await campaignsResponse.json();
    console.log('✅ Campagnes récupérées:', campaignsData?.data?.length || 0);
    
    if (campaignsData?.data?.length > 0) {
      const testCampaign = campaignsData.data[0];
      console.log('📋 Campagne de test:', {
        id: testCampaign.id,
        title: testCampaign.title,
        status: testCampaign.status
      });
      
      // Test 3: Créer une donation de test
      console.log('\n3️⃣ Test de création de donation...');
      const donationData = {
        campaignId: testCampaign.id,
        amount: 10000,
        message: 'Test de donation depuis le script',
        donorName: 'Testeur API',
        isAnonymous: false,
        paymentMethod: 'mobile_money'
      };
      
      console.log('📤 Données de la donation:', donationData);
      
      const donationResponse = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData)
      });
      
      console.log('📥 Statut de la réponse:', donationResponse.status);
      
      if (donationResponse.ok) {
        const donationResult = await donationResponse.json();
        console.log('✅ Donation créée avec succès:', {
          id: donationResult.id,
          amount: donationResult.amount,
          status: donationResult.status,
          campaignId: donationResult.campaignId
        });
        
        // Test 4: Vérifier le message de remerciement
        console.log('\n4️⃣ Test du message de remerciement...');
        const thankYouResponse = await fetch(`${API_BASE}/public/campaign-thank-you-messages/campaign/${testCampaign.id}/active`);
        
        if (thankYouResponse.ok) {
          const thankYouMessage = await thankYouResponse.json();
          console.log('✅ Message de remerciement trouvé:', {
            id: thankYouMessage?.id,
            message: thankYouMessage?.message?.substring(0, 50) + '...',
            isActive: thankYouMessage?.isActive
          });
        } else if (thankYouResponse.status === 404) {
          console.log('⚠️ Aucun message de remerciement actif pour cette campagne');
        } else {
          console.log('❌ Erreur lors de la récupération du message:', thankYouResponse.status);
        }
        
      } else {
        const errorText = await donationResponse.text();
        console.log('❌ Erreur lors de la création de la donation:', errorText);
      }
    } else {
      console.log('⚠️ Aucune campagne trouvée pour le test');
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testDonationAPI().then(() => {
  console.log('\n🏁 Test terminé');
}).catch(error => {
  console.log('💥 Erreur fatale:', error.message);
});
