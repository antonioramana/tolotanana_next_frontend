'use client';

import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';
import { CampaignsApi } from '@/lib/api';

interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

interface CampaignUpdatesListProps {
  campaignId: string;
  onEditUpdate: (update: CampaignUpdate) => void;
  onDeleteUpdate: (updateId: string) => void;
}

export default function CampaignUpdatesList({
  campaignId,
  onEditUpdate,
  onDeleteUpdate
}: CampaignUpdatesListProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUpdates();
  }, [campaignId]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CampaignsApi.getUpdates(campaignId, 'page=1&limit=20');
      const updatesData = Array.isArray(data) ? data : (data?.data || []);
      
      // S'assurer que chaque update a les propriétés nécessaires
      const safeUpdates = updatesData.map((update: any) => ({
        id: update.id || '',
        title: update.title || '',
        content: update.content || '',
        createdAt: update.createdAt || new Date().toISOString(),
        updatedAt: update.updatedAt || new Date().toISOString(),
        author: update.author ? {
          id: update.author.id || '',
          firstName: update.author.firstName || '',
          lastName: update.author.lastName || ''
        } : undefined
      }));
      
      setUpdates(safeUpdates);
    } catch (err) {
      console.error('Erreur lors du chargement des updates:', err);
      setError('Erreur lors du chargement des mises à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mise à jour ?')) {
      return;
    }

    try {
      await CampaignsApi.deleteUpdate(campaignId, updateId);
      alert('Mise à jour supprimée avec succès');
      // Recharger la liste des updates
      loadUpdates();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      let errorMessage = 'Erreur lors de la suppression de la mise à jour';
      
      // Essayer de parser le message d'erreur
      try {
        if (err.message) {
          const parsed = JSON.parse(err.message);
          if (parsed.statusCode === 404) {
            errorMessage = 'Fonctionnalité de suppression temporairement indisponible. Veuillez redémarrer le backend.';
          } else {
            errorMessage = parsed.message || errorMessage;
          }
        }
      } catch (parseError) {
        // Si on ne peut pas parser, utiliser le message original
        if (err.message && err.message.includes('404')) {
          errorMessage = 'Fonctionnalité de suppression temporairement indisponible. Veuillez redémarrer le backend.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }
      
      alert(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCalendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mise à jour</h3>
        <p className="text-gray-500">Cette campagne n'a pas encore de mises à jour.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <div key={update.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {update.title || 'Titre non disponible'}
              </h3>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-1" />
                  {update.author ? `${update.author.firstName || ''} ${update.author.lastName || ''}`.trim() : 'Auteur inconnu'}
                </div>
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-1" />
                  {formatDate(update.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onEditUpdate(update)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                title="Modifier"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(update.id)}
                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Supprimer"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {update.content || 'Contenu non disponible'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
