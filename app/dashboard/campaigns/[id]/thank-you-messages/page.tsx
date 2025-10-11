'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { CampaignThankYouMessagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ThankYouMessage {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  campaign: {
    id: string;
    title: string;
  };
}

export default function CampaignThankYouMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const campaignId = params.id as string;

  const [messages, setMessages] = useState<ThankYouMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ThankYouMessage | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, [campaignId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await CampaignThankYouMessagesApi.list(campaignId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages de remerciement.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await CampaignThankYouMessagesApi.create({
        campaignId,
        message: newMessage.trim(),
      });
      setNewMessage('');
      setShowCreateModal(false);
      await loadMessages();
      toast({
        title: 'Succès',
        description: 'Message de remerciement créé avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le message de remerciement.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingMessage || !editMessage.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await CampaignThankYouMessagesApi.update(editingMessage.id, {
        message: editMessage.trim(),
      });
      setEditMessage('');
      setEditingMessage(null);
      setShowEditModal(false);
      await loadMessages();
      toast({
        title: 'Succès',
        description: 'Message de remerciement mis à jour avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le message de remerciement.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message de remerciement ?')) {
      return;
    }

    try {
      await CampaignThankYouMessagesApi.remove(id);
      await loadMessages();
      toast({
        title: 'Succès',
        description: 'Message de remerciement supprimé avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le message de remerciement.',
        variant: 'destructive',
      });
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await CampaignThankYouMessagesApi.setActive(id);
      await loadMessages();
      toast({
        title: 'Succès',
        description: 'Message de remerciement défini comme actif.',
      });
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer ce message de remerciement.',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (message: ThankYouMessage) => {
    setEditingMessage(message);
    setEditMessage(message.message);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages de remerciement</h1>
              <p className="text-gray-600 mt-2">
                Gérez les messages de remerciement personnalisés pour votre campagne
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Nouveau message
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FiPlus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun message de remerciement
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre premier message de remerciement personnalisé pour votre campagne.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Créer un message
              </button>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  message.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">Message de remerciement</h3>
                      {message.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Actif
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Créé le {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!message.isActive && (
                      <button
                        onClick={() => handleSetActive(message.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Définir comme actif"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(message)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouveau message de remerciement</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message de remerciement
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                    placeholder="Ex: Merci infiniment pour votre générosité ! Votre don nous aide énormément à atteindre notre objectif."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newMessage.length}/500 caractères
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreate}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Créer le message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Modifier le message</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message de remerciement
                  </label>
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                    placeholder="Ex: Merci infiniment pour votre générosité ! Votre don nous aide énormément à atteindre notre objectif."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editMessage.length}/500 caractères
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}














