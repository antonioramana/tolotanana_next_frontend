'use client';

import { useEffect, useState } from 'react';
import { UsersApi } from '@/lib/api';
import SimplePagination from '@/components/ui/simple-pagination';
import CampaignCard from '@/components/ui/campaign-card';
import { FiHeart } from 'react-icons/fi';

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await UsersApi.getUserFavorites(page, itemsPerPage);
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const campaigns = data.map((fav: any) => fav?.campaign ?? fav).filter(Boolean);
        if (!cancelled) setItems(campaigns);
        if ((res as any)?.meta?.totalPages) setTotalPages((res as any).meta.totalPages);
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <FiHeart className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 py-20">Chargement des favoris...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Aucune campagne en favori</h2>
            <p className="text-gray-600 mt-1">Ajoutez des campagnes à vos favoris en cliquant sur le coeur.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((c) => (
              <CampaignCard key={c.id} campaign={c} />)
            )}
          </div>
        )}

        {!loading && items.length > 0 && totalPages > 1 && (
          <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}


