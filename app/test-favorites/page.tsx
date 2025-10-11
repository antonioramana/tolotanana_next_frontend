'use client';

import { useState, useEffect } from 'react';
import { getStoredUser } from '@/lib/auth-client';
import { api } from '@/lib/api';
import FavoriteToggle from '@/components/campaign/FavoriteToggle';
import { useFavorites } from '@/hooks/useFavorites';

export default function TestFavoritesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await api('/campaigns?page=1&limit=5') as any;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test des Favoris</h1>
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
            {/* Test du composant FavoriteToggle */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test du composant FavoriteToggle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignFavoriteTest key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>

            {/* Test de l'API */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test de l'API Favoris</h2>
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await api('/favorites/my-favorites') as any;
                      console.log('Mes favoris:', response);
                      alert(`Favoris récupérés: ${response.data.length} campagnes`);
                    } catch (error) {
                      console.error('Erreur API favoris:', error);
                      alert('Erreur lors de la récupération des favoris');
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Récupérer mes favoris
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignFavoriteTest({ campaign }: { campaign: any }) {
  const favorites = useFavorites({
    campaignId: campaign.id,
    initialIsFavoris: campaign.isFavoris || false
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 truncate">{campaign.title}</h3>
        <FavoriteToggle
          isFavoris={favorites.isFavoris}
          onToggle={favorites.toggleFavorite}
          isLoading={favorites.isLoading}
          size="sm"
        />
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{campaign.description}</p>
      <div className="text-xs text-gray-500">
        Statut: {favorites.isFavoris ? '❤️ Favori' : '🤍 Pas favori'}
      </div>
    </div>
  );
}
