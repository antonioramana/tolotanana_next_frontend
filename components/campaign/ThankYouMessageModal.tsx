'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiHeart } from 'react-icons/fi';
import { CampaignsApi } from '@/lib/api';

interface ThankYouMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  currentMessage?: string;
  onMessageUpdated: () => void;
}

export default function ThankYouMessageModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  currentMessage = '',
  onMessageUpdated,
}: ThankYouMessageModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMessage(currentMessage);
      setError(null);
    }
  }, [isOpen, currentMessage]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Le message de remerciement est obligatoire.');
      return;
    }
    if (message.length > 500) {
      setError('Le message ne doit pas dépasser 500 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await CampaignsApi.updateThankYouMessage(campaignId, { thankYouMessage: message });
      alert('Message de remerciement mis à jour avec succès !');
      onMessageUpdated();
      onClose();
    } catch (err: any) {
      console.error('Failed to update thank you message:', err);
      let errorMessage = 'Erreur lors de l\'enregistrement du message de remerciement.';
      try {
        const parsed = JSON.parse(err.message);
        errorMessage = Array.isArray(parsed?.message) ? parsed.message.join(', ') : (parsed?.message || errorMessage);
      } catch {}
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FiHeart className="w-6 h-6 text-pink-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                Message de remerciement
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Campagne: <span className="font-semibold">{campaignTitle}</span>
          </p>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Astuce :</strong> Ce message s'affichera automatiquement lors de l'ajout d'un don sur votre campagne. 
              Personnalisez-le pour remercier vos donateurs de manière unique !
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message de remerciement *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Ex: Merci pour votre générosité ! Votre soutien nous aide énormément à atteindre notre objectif. 🙏"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{message.length}/500</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-4 space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <FiSave className="w-5 h-5 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
