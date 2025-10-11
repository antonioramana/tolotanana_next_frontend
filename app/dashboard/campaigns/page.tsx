'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CampaignsApi, CatalogApi } from '@/lib/api';
import { FiPlus, FiEdit, FiEye, FiPause, FiPlay, FiTrash2, FiTrendingUp, FiCalendar, FiDollarSign, FiSearch, FiFilter, FiMessageSquare, FiX, FiHeart } from 'react-icons/fi';
import CampaignUpdateModal from '@/components/campaign/CampaignUpdateModal';
import CampaignUpdatesList from '@/components/campaign/CampaignUpdatesList';
import ThankYouMessageModal from '@/components/campaign/ThankYouMessageModal';

export default function MyCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  // Updates modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdatesList, setShowUpdatesList] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any>(null);
  
  // Thank you message modal state
  const [showThankYouMessageModal, setShowThankYouMessageModal] = useState(false);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    categoryId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [categories, setCategories] = useState<any[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadCampaigns();
    loadCategories();
  }, [filters]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());

      const response = await CampaignsApi.myCampaigns(queryParams.toString());
      setCampaigns(response.data || []);
      setPagination(response.meta || { total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Erreur lors du chargement des campagnes');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await CatalogApi.categories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toLocaleString('fr-FR')} Ar`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Terminée';
      case 'paused': return 'En pause';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const handleAction = async (action: string, campaignId: string) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/campaigns/${campaignId}`);
          break;
        case 'edit':
          router.push(`/dashboard/campaigns/${campaignId}/edit`);
          break;
        case 'updates':
          setSelectedCampaign(campaignId);
          setShowUpdatesList(true);
          break;
        case 'add_update':
          setSelectedCampaign(campaignId);
          setEditingUpdate(null);
          setShowUpdateModal(true);
          break;
        case 'thank_you':
          router.push(`/dashboard/campaigns/${campaignId}/thank-you-messages`);
          break;
        case 'pause':
          await CampaignsApi.updateStatus(campaignId, 'paused');
          alert('Campagne mise en pause');
          loadCampaigns();
          break;
        case 'resume':
          await CampaignsApi.updateStatus(campaignId, 'active');
          alert('Campagne reprise');
          loadCampaigns();
          break;
        case 'delete':
          if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
            await CampaignsApi.delete(campaignId);
            alert('Campagne supprimée');
            loadCampaigns();
          }
          break;
        default:
          console.log(`Action ${action} sur la campagne ${campaignId}`);
      }
    } catch (err) {
      console.error(`Failed to ${action} campaign:`, err);
      alert(`Erreur lors de l'action "${action}"`);
    }
  };

  const handleEditUpdate = (update: any) => {
    setShowUpdatesList(false);
    setEditingUpdate(update);
    setShowUpdateModal(true);
  };

  const handleDeleteUpdate = (updateId: string) => {
    // La suppression est gérée dans CampaignUpdatesList
    // On peut juste fermer la liste si nécessaire
  };

  const handleUpdateAdded = () => {
    // Recharger les campagnes si nécessaire
    loadCampaigns();
    // Rouvrir la modal des updates après ajout/modification
    setShowUpdateModal(false);
    setEditingUpdate(null);
    setShowUpdatesList(true);
  };

  const handleThankYouMessageUpdated = () => {
    // Recharger les campagnes pour afficher le message mis à jour
    loadCampaigns();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes campagnes</h1>
          <p className="text-gray-600">Gérez toutes vos campagnes de collecte de fonds</p>
        </div>
        <Link
          href="/dashboard/create-campaign"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Nouvelle campagne
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Rechercher par titre ou description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="active">Active</option>
              <option value="paused">En pause</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
          
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc', page: 1 }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Plus récent</option>
              <option value="createdAt-asc">Plus ancien</option>
              <option value="target_amount-desc">Montant cible (décroissant)</option>
              <option value="target_amount-asc">Montant cible (croissant)</option>
              <option value="current_amount-desc">Montant collecté (décroissant)</option>
              <option value="current_amount-asc">Montant collecté (croissant)</option>
              <option value="deadline-asc">Échéance (proche)</option>
              <option value="deadline-desc">Échéance (lointaine)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total campagnes</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campagnes actives</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiPlay className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total collecté</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(campaigns.reduce((sum, c) => sum + (parseFloat(c.currentAmount) || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Objectifs atteints</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des campagnes</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement des campagnes...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={loadCampaigns}
              className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '300px' }}>
                      Campagne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                      Progression
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                      Collecté
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                      Donateurs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                      Échéance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => {
                    const currentAmount = parseFloat(campaign.currentAmount) || 0;
                    const targetAmount = parseFloat(campaign.targetAmount) || 1;
                    const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
                    const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={campaign.images?.[0] || '/placeholder-image.jpg'}
                              alt={campaign.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {campaign.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {campaign.category?.name || campaign.category || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{progressPercentage.toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatAmount(currentAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            sur {formatAmount(targetAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign._count?.donations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(campaign.deadline).toLocaleDateString('fr-FR')}
                          </div>
                          <div className={`text-xs ${daysLeft > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {daysLeft > 0 ? `${daysLeft} jours restants` : 'Échue'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleAction('view', campaign.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Voir"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('edit', campaign.id)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded"
                              title="Modifier"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('updates', campaign.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Actualités"
                            >
                              <FiMessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('thank_you', campaign.id)}
                              className="text-pink-600 hover:text-pink-900 p-1 rounded"
                              title="Message de remerciement"
                            >
                              <FiHeart className="w-4 h-4" />
                            </button>
                            {campaign.status === 'active' ? (
                              <button
                                onClick={() => handleAction('pause', campaign.id)}
                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                                title="Mettre en pause"
                              >
                                <FiPause className="w-4 h-4" />
                              </button>
                            ) : campaign.status === 'paused' ? (
                              <button
                                onClick={() => handleAction('resume', campaign.id)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Reprendre"
                              >
                                <FiPlay className="w-4 h-4" />
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleAction('delete', campaign.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Supprimer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Affichage de {((filters.page - 1) * filters.limit) + 1} à {Math.min(filters.page * filters.limit, pagination.total)} sur {pagination.total} campagnes
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <span className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md">
                      {filters.page}
                    </span>
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!loading && !error && campaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrendingUp className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune campagne trouvée</h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status || filters.categoryId 
              ? 'Aucune campagne ne correspond à vos critères de recherche'
              : 'Commencez par créer votre première campagne de collecte de fonds'
            }
          </p>
          <Link
            href="/dashboard/create-campaign"
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Créer ma première campagne
          </Link>
        </div>
      )}

      {/* Campaign Updates Modal */}
      {showUpdateModal && selectedCampaign && (
        <CampaignUpdateModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setEditingUpdate(null);
          }}
          campaignId={selectedCampaign}
          campaignTitle={campaigns.find(c => c.id === selectedCampaign)?.title || ''}
          onUpdateAdded={handleUpdateAdded}
          editingUpdate={editingUpdate}
        />
      )}

      {/* Campaign Updates List Modal */}
      {showUpdatesList && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Actualités de la campagne
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {campaigns.find(c => c.id === selectedCampaign)?.title || ''}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowUpdatesList(false);
                      setEditingUpdate(null);
                      setShowUpdateModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Ajouter une actualité
                  </button>
                  <button
                    onClick={() => setShowUpdatesList(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <CampaignUpdatesList
                campaignId={selectedCampaign}
                onEditUpdate={handleEditUpdate}
                onDeleteUpdate={handleDeleteUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Thank You Message Modal */}
      {showThankYouMessageModal && selectedCampaign && (
        <ThankYouMessageModal
          isOpen={showThankYouMessageModal}
          onClose={() => {
            setShowThankYouMessageModal(false);
            setSelectedCampaign(null);
          }}
          campaignId={selectedCampaign}
          campaignTitle={campaigns.find(c => c.id === selectedCampaign)?.title || ''}
          currentMessage={campaigns.find(c => c.id === selectedCampaign)?.thankYouMessage || ''}
          onMessageUpdated={handleThankYouMessageUpdated}
        />
      )}
    </div>
  );
}