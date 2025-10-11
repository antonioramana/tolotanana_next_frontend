'use client';

import { useState, useEffect } from 'react';
import { getStoredUser } from '@/lib/auth-client';
import { api } from '@/lib/api';
import FavoriteToggle from '@/components/campaign/FavoriteToggle';
import FavoriteButton from '@/components/campaign/FavoriteButton';
import CampaignCard from '@/components/ui/campaign-card';
import { useFavorites } from '@/hooks/useFavorites';

export default function TestAllFavoritesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await api('/campaigns?page=1&limit=3') as any;
      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test de tous les boutons de favoris</h1>
          <p className="text-gray-600">
            {currentUser ? `Connecté en tant que ${currentUser.firstName} ${currentUser.lastName}` : 'Non connecté'}
          </p>
        </div>

        {!currentUser ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connexion requise</h3>
            <p className="text-yellow-700 mb-4">
              Vous devez être connecté pour tester les favoris.
            </p>
            <a
              href="/login"
              className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Se connecter
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Test des composants individuels */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test des composants individuels</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                  // Wrapper component pour utiliser le hook useFavorites
                  const CampaignTestWrapper = () => {
                    const favorites = useFavorites({
                      campaignId: campaign.id,
                      initialIsFavoris: campaign.isFavoris || false
                    });

                    return (
                      <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3 truncate">{campaign.title}</h3>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">FavoriteToggle (icône):</p>
                            <FavoriteToggle
                              isFavoris={favorites.isFavoris}
                              onToggle={favorites.toggleFavorite}
                              isLoading={favorites.isLoading}
                              size="sm"
                            />
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-2">FavoriteButton (sidebar):</p>
                            <FavoriteButton
                              campaignId={campaign.id}
                              initialIsFavoris={campaign.isFavoris || false}
                              variant="sidebar"
                            />
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-2">FavoriteButton (card):</p>
                            <FavoriteButton
                              campaignId={campaign.id}
                              initialIsFavoris={campaign.isFavoris || false}
                              variant="card"
                            />
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-2">FavoriteButton (header):</p>
                            <FavoriteButton
                              campaignId={campaign.id}
                              initialIsFavoris={campaign.isFavoris || false}
                              variant="header"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return <CampaignTestWrapper key={campaign.id} />;
                })}
              </div>
            </div>

            {/* Test des cartes de campagnes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test des cartes de campagnes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions de test</h3>
              <div className="text-blue-800 space-y-2">
                <p>• Cliquez sur les différents boutons de favoris pour tester leur fonctionnement</p>
                <p>• Vérifiez que les états visuels changent correctement (cœur vide/plein)</p>
                <p>• Vérifiez que les toasts de confirmation s'affichent</p>
                <p>• Testez les différents variants (sidebar, card, header)</p>
                <p>• Vérifiez que les cartes de campagnes affichent bien les boutons de favoris</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
