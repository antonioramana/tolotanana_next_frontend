import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseFavoritesProps {
  campaignId: string;
  initialIsFavoris?: boolean;
}

interface UseFavoritesReturn {
  isFavoris: boolean;
  isLoading: boolean;
  toggleFavorite: () => Promise<void>;
  addToFavorites: () => Promise<void>;
  removeFromFavorites: () => Promise<void>;
}

export const useFavorites = ({ 
  campaignId, 
  initialIsFavoris = false 
}: UseFavoritesProps): UseFavoritesReturn => {
  const [isFavoris, setIsFavoris] = useState(initialIsFavoris);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleFavorite = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await api(`/campaigns/${campaignId}/toggle-favorite`, {
        method: 'POST',
      }) as any;
      const { isFavoris: newIsFavoris, message } = response;
      
      setIsFavoris(newIsFavoris);
      
      toast({
        title: newIsFavoris ? "Ajouté aux favoris" : "Retiré des favoris",
        description: message,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erreur lors du toggle favoris:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, isLoading, toast]);

  const addToFavorites = useCallback(async () => {
    if (isLoading || isFavoris) return;
    
    setIsLoading(true);
    try {
      await api(`/campaigns/${campaignId}/favorite`, {
        method: 'POST',
      });
      setIsFavoris(true);
      
      toast({
        title: "Ajouté aux favoris",
        description: "La campagne a été ajoutée à vos favoris",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, isLoading, isFavoris, toast]);

  const removeFromFavorites = useCallback(async () => {
    if (isLoading || !isFavoris) return;
    
    setIsLoading(true);
    try {
      await api(`/campaigns/${campaignId}/favorite`, {
        method: 'DELETE',
      });
      setIsFavoris(false);
      
      toast({
        title: "Retiré des favoris",
        description: "La campagne a été retirée de vos favoris",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression des favoris:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, isLoading, isFavoris, toast]);

  return {
    isFavoris,
    isLoading,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
  };
};
