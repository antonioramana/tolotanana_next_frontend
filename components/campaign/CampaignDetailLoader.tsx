'use client';

import { useCallback, useEffect, useState } from 'react';
import CampaignDetailClient from '@/components/campaign/CampaignDetailClient';
import { CatalogApi } from '@/lib/api';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-600">
          Chargement de la campagne...
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
