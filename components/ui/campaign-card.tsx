import Link from 'next/link';
import { Campaign } from '@/types';
import { FiCalendar, FiUsers, FiStar, FiMapPin, FiHeart } from 'react-icons/fi';
import { API_BASE } from '@/lib/api';
import { useEffect, useState } from 'react';
import { getStoredUser } from '@/lib/auth-client';
import { formatMoney } from '@/lib/utils';

interface CampaignCardProps {
  campaign: Campaign | any;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const [isFav, setIsFav] = useState<boolean>(!!campaign.isFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof campaign.isFavorite === 'boolean') setIsFav(!!campaign.isFavorite);
  }, [campaign.isFavorite]);
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className="relative">
        <img
          src={(campaign.images && campaign.images[0]) || 'https://images.pexels.com/photos/6224/hands-people-woman-working.jpg?auto=compress&cs=tinysrgb&w=800'}
          alt={campaign.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
        {campaign.isVerified && (
          <div className="absolute top-3 right-3">
            <div className="flex gap-2">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (loading) return;
                  setLoading(true);
                  try {
                    const token = JSON.parse(localStorage.getItem('auth_user') || '{}')?.token;
                    const adding = !isFav;
                    const res = await fetch(`${API_BASE}/campaigns/${campaign.id}/favorite`, {
                      method: adding ? 'POST' : 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      credentials: 'include',
                    });
                    if (res.status === 401) return; // not logged in
                    if (res.status === 403 && adding) { setIsFav(true); return; } // already favorite
                    if (res.status === 404 && !adding) { setIsFav(false); return; } // already removed
                    if (!res.ok) throw new Error(await res.text());
                    setIsFav(!isFav);
                  } catch {
                    // ignore for card
                  } finally {
                    setLoading(false);
                  }
                }}
                className={`${isFav ? 'bg-red-500' : 'bg-white/90 hover:bg-white'} p-1 rounded-full`}
                aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <FiHeart className={`w-4 h-4 ${isFav ? 'text-white fill-white' : 'text-gray-700'}`} />
              </button>
              <div className="bg-blue-500 text-white p-1 rounded-full">
                <FiStar className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
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
              {campaign.category?.name || campaign.category || '—'}
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
            <img
              src={`https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop`}
              alt={campaign.createdByName || ''}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">{campaign.createdByName || `${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim()}</span>
          </div>
          <Link
            href={`/campaigns/${campaign.id}`}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Voir plus
          </Link>
        </div>
      </div>
    </div>
  );
}