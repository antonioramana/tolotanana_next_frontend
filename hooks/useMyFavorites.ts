import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  totalRaised: number;
  categoryId: string;
  images: string[];
  video?: string;
  deadline: string;
  status: string;
  createdBy: string;
  rating: number;
  totalDonors: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  category?: any;
  creator?: any;
  isFavoris: boolean;
}

interface UseMyFavoritesReturn {
  favorites: Campaign[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
}

export const useMyFavorites = (): UseMyFavoritesReturn => {
  const [favorites, setFavorites] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchFavorites = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });
      
      const response = await api(`/favorites/my-favorites?${params.toString()}`) as any;

      const { data, meta } = response;
      
      if (append) {
        setFavorites(prev => [...prev, ...data]);
      } else {
        setFavorites(data);
      }
      
      setHasNextPage(meta.hasNextPage);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des favoris:', err);
      setError(err.message || 'Erreur lors de la récupération des favoris');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchFavorites(1, false);
  }, [fetchFavorites]);

  const loadMore = useCallback(async () => {
    if (hasNextPage && !isLoading) {
      await fetchFavorites(page + 1, true);
    }
  }, [hasNextPage, isLoading, page, fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isLoading,
    error,
    refetch,
    hasNextPage,
    loadMore,
  };
};
