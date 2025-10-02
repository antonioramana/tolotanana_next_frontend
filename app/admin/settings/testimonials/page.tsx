'use client';

import { useState, useEffect, useCallback } from 'react';
import { TestimonialsApi } from '@/lib/api';
import { Testimonial, TestimonialStats } from '@/types';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiStar, FiUser, FiMessageSquare, FiTrendingUp, FiAward } from 'react-icons/fi';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<TestimonialStats>({ total: 0, active: 0, highlighted: 0, averageRating: 0, byRole: [] });
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: 'Bénéficiaire',
    avatar: '',
    content: '',
    campaign: '',
    rating: 5,
    isActive: true,
    isHighlight: false,
  });

  const showCustomToast = (message: string, variant: 'success' | 'error') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TestimonialsApi.list(showInactive);
      setTestimonials(data);
    } catch (error) {
      console.error('Erreur lors du chargement des témoignages:', error);
      showCustomToast('Erreur lors du chargement des témoignages.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  const loadStats = useCallback(async () => {
    try {
      const data = await TestimonialsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
    loadStats();
  }, [loadTestimonials, loadStats]);

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Bénéficiaire',
      avatar: '',
      content: '',
      campaign: '',
      rating: 5,
      isActive: true,
      isHighlight: false,
    });
    setSelectedTestimonial(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      avatar: testimonial.avatar || '',
      content: testimonial.content,
      campaign: testimonial.campaign || '',
      rating: testimonial.rating,
      isActive: testimonial.isActive,
      isHighlight: testimonial.isHighlight,
    });
    setSelectedTestimonial(testimonial);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isCreating) {
        await TestimonialsApi.create(formData);
        showCustomToast('Témoignage créé avec succès !', 'success');
      } else if (isEditing && selectedTestimonial) {
        await TestimonialsApi.update(selectedTestimonial.id, formData);
        showCustomToast('Témoignage mis à jour avec succès !', 'success');
      }
      
      resetForm();
      loadTestimonials();
      loadStats();
    } catch (error: any) {
      showCustomToast(error.message || 'Une erreur est survenue.', 'error');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await TestimonialsApi.toggleActive(id);
      showCustomToast('Statut modifié avec succès !', 'success');
      loadTestimonials();
      loadStats();
    } catch (error: any) {
      showCustomToast(error.message || 'Erreur lors de la modification.', 'error');
    }
  };

  const handleToggleHighlight = async (id: string) => {
    try {
      await TestimonialsApi.toggleHighlight(id);
      showCustomToast('Mise en avant modifiée avec succès !', 'success');
      loadTestimonials();
      loadStats();
    } catch (error: any) {
      showCustomToast(error.message || 'Erreur lors de la modification.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      try {
        await TestimonialsApi.delete(id);
        showCustomToast('Témoignage supprimé avec succès !', 'success');
        loadTestimonials();
        loadStats();
      } catch (error: any) {
        showCustomToast(error.message || 'Erreur lors de la suppression.', 'error');
      }
    }
  };

  const formatFrenchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Témoignages</h1>
        <button
          onClick={handleCreate}
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center gap-2"
        >
          <FiPlus className="h-5 w-5" />
          Nouveau Témoignage
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Témoignages</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <FiMessageSquare className="h-10 w-10 text-orange-400 opacity-70" />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Témoignages Actifs</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <FiEye className="h-10 w-10 text-green-400 opacity-70" />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Mis en Avant</p>
            <p className="text-3xl font-bold text-purple-600">{stats.highlighted}</p>
          </div>
          <FiAward className="h-10 w-10 text-purple-400 opacity-70" />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Note Moyenne</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}/5</p>
          </div>
          <FiStar className="h-10 w-10 text-yellow-400 opacity-70" />
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700">Inclure les témoignages inactifs</span>
          </label>
        </div>
      </div>

      {/* Liste des témoignages */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des témoignages...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucun témoignage trouvé.</div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                testimonial.isHighlight ? 'border-purple-500' : testimonial.isActive ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{testimonial.name}</h3>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">{testimonial.role}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  {testimonial.campaign && (
                    <p className="text-sm text-gray-600 mb-2">Campagne : {testimonial.campaign}</p>
                  )}
                  <p className="text-gray-700 mb-3">{testimonial.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Créé le {formatFrenchDate(testimonial.createdAt)}</span>
                    <span>Par {testimonial.creator.firstName} {testimonial.creator.lastName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {testimonial.isHighlight && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Mis en avant</span>
                  )}
                  {!testimonial.isActive && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Inactif</span>
                  )}
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                    title="Modifier"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(testimonial.id)}
                    className={`p-2 rounded-full ${
                      testimonial.isActive ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-green-100 hover:bg-green-200 text-green-600'
                    }`}
                    title={testimonial.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {testimonial.isActive ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleHighlight(testimonial.id)}
                    className={`p-2 rounded-full ${
                      testimonial.isHighlight ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                    }`}
                    title={testimonial.isHighlight ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                  >
                    <FiAward className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                    title="Supprimer"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de création/édition */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isCreating ? 'Nouveau Témoignage' : 'Modifier le Témoignage'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Bénéficiaire">Bénéficiaire</option>
                    <option value="Créateur de campagne">Créateur de campagne</option>
                    <option value="Donatrice">Donatrice</option>
                    <option value="Donateur">Donateur</option>
                    <option value="Utilisateur">Utilisateur</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (URL)</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu du témoignage</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campagne (optionnel)</label>
                  <input
                    type="text"
                    value={formData.campaign}
                    onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (1-5 étoiles)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={1}>1 étoile</option>
                    <option value={2}>2 étoiles</option>
                    <option value={3}>3 étoiles</option>
                    <option value={4}>4 étoiles</option>
                    <option value={5}>5 étoiles</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Témoignage actif</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHighlight}
                    onChange={(e) => setFormData({ ...formData, isHighlight: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Mettre en avant</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  {isCreating ? 'Créer' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-md shadow-lg text-white ${
            toastVariant === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ zIndex: 1000 }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
