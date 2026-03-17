import Link from 'next/link';
import { Campaign } from '@/types';
import { FiCalendar, FiUsers, FiShare2, FiMapPin } from 'react-icons/fi';
import { formatMoney } from '@/lib/utils';
import FavoriteToggle from '@/components/campaign/FavoriteToggle';
import FavoriteButton from '@/components/campaign/FavoriteButton';
import ShareModal from '@/components/campaign/ShareModal';
import VerifiedBadge from '@/components/ui/verified-badge';
import UserAvatar from '@/components/ui/user-avatar';
import { useFavorites } from '@/hooks/useFavorites';
import { getStoredUser } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

interface CampaignCardProps {
  campaign: Campaign | any;
  viewMode?: 'grid' | 'list';
}

const normalizeImageUrl = (url?: string | null) => {
  if (!url) return url || '';
  // Corriger les anciennes URLs qui pointaient sur /api/uploads
  if (url.includes('/api/uploads')) {
    return url.replace('/api/uploads', '/uploads');
  }
  return url;
};

export default function CampaignCard({ campaign, viewMode = 'grid' }: CampaignCardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  // Utiliser le hook useFavorites seulement si l'utilisateur est connecté
  const favorites = useFavorites({
    campaignId: campaign.id,
    initialIsFavoris: campaign.isFavoris || false
  });
  const currentAmount = typeof campaign.currentAmount === 'string' ? parseFloat(campaign.currentAmount) : campaign.currentAmount || 0;
  const totalRaised = typeof campaign.totalRaised === 'string' ? parseFloat(campaign.totalRaised) : campaign.totalRaised || currentAmount;
  const targetAmount = typeof campaign.targetAmount === 'string' ? parseFloat(campaign.targetAmount) : campaign.targetAmount || 0;
  const progressBase = targetAmount > 0 ? (totalRaised / targetAmount) * 100 : 0;
  const progressPercentage = Math.round(progressBase);
  
  const getStatusBadge = () => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Terminée' },
      paused: { color: 'bg-yellow-100 text-yellow-800', text: 'En pause' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Annulée' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
    } as const;

    const config = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const imageUrl = normalizeImageUrl(campaign.images && campaign.images[0]) || 'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=800';
  const creatorName = campaign.createdByName || `${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim();
  const categoryName = campaign.category?.name || campaign.category || '—';

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative sm:w-64 flex-shrink-0">
            <img
              src={imageUrl}
              alt={campaign.title}
              className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              {getStatusBadge()}
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              {currentUser && (
                <FavoriteToggle
                  isFavoris={favorites.isFavoris}
                  onToggle={favorites.toggleFavorite}
                  isLoading={favorites.isLoading}
                  size="sm"
                  className="shadow-lg"
                />
              )}
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-white/90 hover:bg-white p-1.5 rounded-full transition-colors shadow-lg"
                aria-label="Partager"
              >
                <FiShare2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {campaign.title}
                </h3>
                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  {categoryName}
                </span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {campaign.description}
              </p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {formatMoney(totalRaised)} collectés
                  </span>
                  <span className="text-sm text-gray-500">
                    {progressPercentage}% — Objectif: {formatMoney(targetAmount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <FiUsers className="w-4 h-4 mr-1" />
                  {campaign.totalDonors || 0} donateurs
                </span>
                <span className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-1" />
                  {new Date(campaign.deadline).toLocaleDateString('fr-FR')}
                </span>
                <span className="flex items-center">
                  <UserAvatar src={campaign.creator?.avatar} alt={creatorName} size="xs" className="mr-1" />
                  {creatorName}
                  {campaign.creator?.isVerified && <VerifiedBadge size="xs" className="ml-1" />}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {currentUser && (
                  <FavoriteButton
                    campaignId={campaign.id}
                    initialIsFavoris={campaign.isFavoris || false}
                    variant="card"
                  />
                )}
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Voir plus
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          campaignTitle={campaign.title}
          campaignId={campaign.id}
        />
      </div>
    );
  }

  // Grid mode (default)
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className="relative">
        <img
          src={imageUrl}
          alt={campaign.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex gap-2">
            {currentUser && (
              <FavoriteToggle
                isFavoris={favorites.isFavoris}
                onToggle={favorites.toggleFavorite}
                isLoading={favorites.isLoading}
                size="sm"
                className="shadow-lg"
              />
            )}
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-white/90 hover:bg-white p-1.5 rounded-full transition-colors shadow-lg"
              aria-label="Partager"
            >
              <FiShare2 className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {campaign.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className="flex items-center">
              <FiUsers className="w-4 h-4 mr-1" />
              {campaign.totalDonors || 0} donateurs
            </span>
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              {categoryName}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {formatMoney(totalRaised)} collectés
            </span>
            <span className="text-sm text-gray-500">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Objectif: {formatMoney(targetAmount)}</span>
            <span className="flex items-center">
              <FiCalendar className="w-3 h-3 mr-1" />
              {new Date(campaign.deadline).toLocaleDateString('fr-FR')}
            </span>
          </div>
          {totalRaised > currentAmount && (
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-green-600">Disponible: {formatMoney(currentAmount)}</span>
              <span className="mx-2">•</span>
              <span className="text-blue-600">Total collecté: {formatMoney(totalRaised)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserAvatar src={campaign.creator?.avatar} alt={creatorName} size="xs" className="mr-2" />
            <span className="text-sm text-gray-600">{creatorName}</span>
            {campaign.creator?.isVerified && <VerifiedBadge size="xs" className="ml-1" />}
          </div>
          <div className="flex items-center space-x-2">
            {currentUser && (
              <FavoriteButton
                campaignId={campaign.id}
                initialIsFavoris={campaign.isFavoris || false}
                variant="card"
              />
            )}
            <Link
              href={`/campaigns/${campaign.id}`}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Voir plus
            </Link>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        campaignTitle={campaign.title}
        campaignId={campaign.id}
      />
    </div>
  );
}