'use client';

import { useMyFavorites } from '@/hooks/useMyFavorites';
import CampaignCard from '@/components/ui/campaign-card';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites, isLoading, error, refetch, hasNextPage, loadMore } = useMyFavorites();

  if (isLoading && favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                Retour au tableau de bord
              </Link>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiHeart className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
            </div>
            <p className="text-gray-600">
              {favorites.length > 0 
                ? `${favorites.length} campagne${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`
                : 'Aucune campagne en favoris pour le moment'
              }
            </p>
          </div>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun favori pour le moment</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explorez les campagnes et ajoutez celles qui vous intéressent à vos favoris en cliquant sur l'icône cœur.
            </p>
            <Link
              href="/campaigns"
              className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FiHeart className="w-5 h-5 mr-2" />
              Découvrir les campagnes
            </Link>
          </div>
        ) : (
          <>
            {/* Grid des campagnes */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {favorites.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Chargement...' : 'Charger plus de favoris'}
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de vos favoris</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{favorites.length}</div>
                  <div className="text-sm text-gray-600">Campagnes favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {favorites.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Campagnes actives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {favorites.filter(c => c.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Campagnes terminées</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}