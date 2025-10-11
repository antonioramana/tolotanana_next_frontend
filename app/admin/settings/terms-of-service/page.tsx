'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiFileText, FiSave, FiLoader } from 'react-icons/fi';
import { TermsOfServiceApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TermsOfService {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TermsOfServicePage() {
  const [terms, setTerms] = useState<TermsOfService[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<TermsOfService | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    version: '1.0',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TermsOfServiceApi.list();
      setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des politiques:', err);
      setError('Erreur lors du chargement des politiques d\'utilisation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre et le contenu sont obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingTerm) {
        await TermsOfServiceApi.update(editingTerm.id, formData);
        toast({
          title: 'Succès',
          description: 'Politique d\'utilisation mise à jour avec succès.',
        });
      } else {
        await TermsOfServiceApi.create(formData);
        toast({
          title: 'Succès',
          description: 'Politique d\'utilisation créée avec succès.',
        });
      }
      
      setShowModal(false);
      setEditingTerm(null);
      setFormData({ title: '', content: '', version: '1.0' });
      loadTerms();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la sauvegarde de la politique d\'utilisation.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (term: TermsOfService) => {
    setEditingTerm(term);
    setFormData({
      title: term.title,
      content: term.content,
      version: term.version,
    });
    setShowModal(true);
  };

  const handleActivate = async (id: string) => {
    try {
      await TermsOfServiceApi.activate(id);
      toast({
        title: 'Succès',
        description: 'Politique d\'utilisation activée avec succès.',
      });
      loadTerms();
    } catch (err: any) {
      console.error('Erreur lors de l\'activation:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'activation de la politique d\'utilisation.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette politique d\'utilisation ?')) {
      return;
    }

    try {
      await TermsOfServiceApi.delete(id);
      toast({
        title: 'Succès',
        description: 'Politique d\'utilisation supprimée avec succès.',
      });
      loadTerms();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression de la politique d\'utilisation.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-300 mt-2">Chargement des politiques d'utilisation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={loadTerms} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Politiques d'utilisation</h1>
          <p className="text-gray-200">Gérez les conditions d'utilisation de la plateforme.</p>
        </div>
        <button
          onClick={() => {
            setEditingTerm(null);
            setFormData({ title: '', content: '', version: '1.0' });
            setShowModal(true);
          }}
          className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Nouvelle politique
        </button>
      </div>

      {/* Terms List */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Liste des politiques</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Créée le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-200">
              {terms.map((term) => (
                <tr key={term.id} className="hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{term.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      v{term.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {term.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(term.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(term)}
                        className="text-gray-200 hover:text-white p-1 rounded"
                        title="Modifier"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      {!term.isActive && (
                        <button
                          onClick={() => handleActivate(term.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Activer"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      {!term.isActive && (
                        <button
                          onClick={() => handleDelete(term.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FiFileText className="w-6 h-6 text-orange-500 mr-3" />
                  <h2 className="text-2xl font-bold text-white">
                    {editingTerm ? 'Modifier la politique' : 'Nouvelle politique d\'utilisation'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTerm(null);
                    setFormData({ title: '', content: '', version: '1.0' });
                  }}
                  className="text-gray-300 hover:text-gray-200 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600"
                    placeholder="Ex: Conditions d'utilisation - Version 1.0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600"
                    placeholder="1.0"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                    Contenu *
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600"
                    placeholder="1. Acceptation des conditions...
2. Utilisation de la plateforme...
3. Responsabilités des utilisateurs..."
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTerm(null);
                      setFormData({ title: '', content: '', version: '1.0' });
                    }}
                    className="px-6 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 text-gray-300 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <FiSave className="w-5 h-5 mr-2" />
                    {submitting ? (editingTerm ? 'Modification...' : 'Création...') : (editingTerm ? 'Modifier' : 'Créer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
