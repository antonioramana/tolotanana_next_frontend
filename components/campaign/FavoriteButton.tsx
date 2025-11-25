import React from 'react';
import { FiHeart } from 'react-icons/fi';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { getStoredUser } from '@/lib/auth-client';
import { useState, useEffect } from 'react';

interface FavoriteButtonProps {
  campaignId: string;
  initialIsFavoris?: boolean;
  variant?: 'sidebar' | 'card' | 'header';
  className?: string;
  // Props optionnelles pour synchronisation externe
  isFavoris?: boolean;
  onToggle?: () => void;
  isLoading?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  campaignId, 
  initialIsFavoris = false,
  variant = 'sidebar',
  className = '',
  isFavoris: externalIsFavoris,
  onToggle: externalOnToggle,
  isLoading: externalIsLoading
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  // Utiliser les props externes si fournies, sinon utiliser le hook interne
  const internalFavorites = useFavorites({
    campaignId,
    initialIsFavoris
  });

  const isFavoris = externalIsFavoris !== undefined ? externalIsFavoris : internalFavorites.isFavoris;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalFavorites.isLoading;
  const toggleFavorite = externalOnToggle || internalFavorites.toggleFavorite;

  const getVariantStyles = () => {
    switch (variant) {
      case 'sidebar':
        return {
          base: 'flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors',
          favori: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300',
          normal: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          disabled: 'opacity-50 cursor-not-allowed'
        };
      case 'card':
        return {
          base: 'flex items-center justify-center space-x-1 py-1 px-2 rounded-md transition-colors text-sm',
          favori: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300',
          normal: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          disabled: 'opacity-50 cursor-not-allowed'
        };
      case 'header':
        return {
          base: 'flex items-center justify-center space-x-2 py-1 px-3 rounded-lg transition-colors text-sm',
          favori: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300',
          normal: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          disabled: 'opacity-50 cursor-not-allowed'
        };
      default:
        return {
          base: 'flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors',
          favori: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300',
          normal: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
          disabled: 'opacity-50 cursor-not-allowed'
        };
    }
  };

  const styles = getVariantStyles();

  // Si onToggle externe est fourni, l'utiliser même si l'utilisateur n'est pas connecté
  // (le composant parent gère la vérification de connexion)
  if (!currentUser && !externalOnToggle) {
    return (
      <button 
        onClick={() => {
          toast({
            title: 'Connexion requise',
            description: 'Veuillez vous connecter pour ajouter aux favoris',
            variant: 'destructive',
          });
        }}
        className={`${styles.base} ${styles.normal} ${className}`}
      >
        <FiHeart className="w-4 h-4" />
        <span>Suivre</span>
      </button>
    );
  }

  return (
    <button 
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`${styles.base} ${
        isFavoris ? styles.favori : styles.normal
      } ${isLoading ? styles.disabled : ''} ${className}`}
    >
      <FiHeart className={`w-4 h-4 ${isFavoris ? 'fill-current' : ''}`} />
      <span>{isFavoris ? 'Favori' : 'Suivre'}</span>
    </button>
  );
};

export default FavoriteButton;
