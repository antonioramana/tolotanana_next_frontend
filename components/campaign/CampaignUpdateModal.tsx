'use client';

import { useState } from 'react';
import { FiX, FiSave, FiEdit } from 'react-icons/fi';
import { CampaignsApi } from '@/lib/api';

interface CampaignUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  onUpdateAdded: () => void;
  editingUpdate?: {
    id: string;
    title: string;
    content: string;
  } | null;
}

export default function CampaignUpdateModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  onUpdateAdded,
  editingUpdate = null
}: CampaignUpdateModalProps) {
  const [form, setForm] = useState({
    title: editingUpdate?.title || '',
    content: editingUpdate?.content || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingUpdate) {
        // Modifier un update existant
        await CampaignsApi.updateUpdate(campaignId, editingUpdate.id, {
          title: form.title.trim(),
          content: form.content.trim(),
        });
        alert('Actualité modifiée avec succès');
      } else {
        // Créer un nouvel update
        await CampaignsApi.createUpdate(campaignId, {
          title: form.title.trim(),
          content: form.content.trim(),
        });
        alert('Actualité ajoutée avec succès');
      }

      onUpdateAdded();
      onClose();
      setForm({ title: '', content: '' });
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ title: '', content: '' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUpdate ? 'Modifier l actualité' : 'Ajouter une actualité'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Campagne: {campaignTitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'actualité *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Progrès du projet, Nouvelle étape..."
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.title.length}/100 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'actualité *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Décrivez les progrès, les nouvelles étapes, les remerciements..."
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.content.length}/2000 caractères
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !form.title.trim() || !form.content.trim()}
                className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingUpdate ? 'Modification...' : 'Ajout...'}
                  </>
                ) : (
                  <>
                    {editingUpdate ? <FiEdit className="w-4 h-4 mr-2" /> : <FiSave className="w-4 h-4 mr-2" />}
                    {editingUpdate ? 'Modifier' : 'Ajouter'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
