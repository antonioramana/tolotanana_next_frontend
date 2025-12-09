'use client';

import { useCallback, useEffect, useState } from 'react';
import CampaignDetailClient from '@/components/campaign/CampaignDetailClient';
import { CatalogApi } from '@/lib/api';
import LoadingDots from '@/components/ui/LoadingDots';

interface CampaignDetailLoaderProps {
  id: string;
}

export default function CampaignDetailLoader({ id }: CampaignDetailLoaderProps) {
  const [campaign, setCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CatalogApi.campaignById(id);
      setCampaign(data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load campaign:', e);
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image skeleton */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-64 md:h-80 bg-gray-200 relative">
                  <div className="absolute top-4 left-4">
                    <div className="h-6 w-20 bg-gray-300 rounded-full" />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                  </div>
                </div>

                {/* Contenu skeleton */}
                <div className="p-6">
                  <div className="h-8 bg-gray-200 rounded-lg mb-4 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded mb-6 w-1/2" />
                  
                  <div className="flex items-center flex-wrap gap-6 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-4 bg-gray-200 rounded w-28" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                      <div className="h-4 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3" />
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-32" />
                      <div className="h-6 bg-gray-200 rounded w-40" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              </div>

              {/* Description skeleton */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-40" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 animate-pulse">
                <div className="text-center mb-6">
                  <div className="h-10 bg-gray-200 rounded-lg mb-2 w-32 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-40 mx-auto" />
                </div>

                <div className="h-12 bg-gray-200 rounded-lg mb-6" />

                <div className="space-y-4">
                  <div className="h-16 bg-gray-200 rounded-lg" />
                  <div className="h-16 bg-gray-200 rounded-lg" />
                  <div className="h-16 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="text-center py-8">
            <LoadingDots size="lg" color="orange" />
            <p className="text-gray-600 mt-4 text-sm">Chargement de la campagne...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campagne non trouvée</h2>
          <a href="/campaigns" className="text-orange-600 hover:text-orange-700">Retour aux campagnes</a>
        </div>
      </div>
    );
  }

  return <CampaignDetailClient campaign={campaign} onRefetch={loadCampaign} />;
}
