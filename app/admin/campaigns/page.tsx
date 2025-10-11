'use client';
import { useEffect, useState } from 'react';
import { FiEye, FiCheck, FiX, FiPause, FiPlay, FiFlag, FiSearch, FiLoader } from 'react-icons/fi';
import SimplePagination from '@/components/ui/simple-pagination';
import { CampaignsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // États pour le chargement des actions
  const [updatingCampaigns, setUpdatingCampaigns] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCampaigns();
  }, [searchTerm, statusFilter, page]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '50');
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
      
      // Récupérer le token d'authentification
      const authUser = localStorage.getItem('auth_user');
      const token = authUser ? JSON.parse(authUser).token : null;
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(`${apiBase}/campaigns?${params.toString()}`, { 
        cache: 'no-store',
        headers
      });
      const data = await res.json();
      const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setCampaigns(items);
      if (data?.meta?.totalPages) setTotalPages(data.meta.totalPages);
    } catch (e) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('fr-FR')} Ar`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Terminée';
      case 'paused': return 'En pause';
      case 'draft': return 'Brouillon';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const creatorName = `${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim();
    const matchesSearch = (campaign.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (action: string, campaignId: string, newStatus?: string) => {
    try {
      // Ajouter la campagne à la liste des campagnes en cours de mise à jour
      setUpdatingCampaigns(prev => new Set(prev).add(campaignId));
      
      if (action === 'change_status' && newStatus) {
        // Récupérer le token d'authentification
        const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
          ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
          : '';

        // Appeler l'API backend pour changer le statut (endpoint admin)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
        const response = await fetch(`${apiBase}/campaigns/${campaignId}/admin-status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors du changement de statut');
        }

        toast({
          title: 'Succès',
          description: `Statut de la campagne modifié en "${getStatusText(newStatus)}"`,
        });
      } else if (action === 'approve') {
        await CampaignsApi.updateAdminStatus(campaignId, 'active');
        toast({
          title: 'Succès',
          description: 'Campagne approuvée avec succès',
        });
      } else if (action === 'reject') {
        await CampaignsApi.updateAdminStatus(campaignId, 'cancelled');
        toast({
          title: 'Succès',
          description: 'Campagne rejetée avec succès',
        });
      } else if (action === 'pause') {
        await CampaignsApi.updateAdminStatus(campaignId, 'paused');
        toast({
          title: 'Succès',
          description: 'Campagne mise en pause',
        });
      } else if (action === 'resume') {
        await CampaignsApi.updateAdminStatus(campaignId, 'active');
        toast({
          title: 'Succès',
          description: 'Campagne reprise',
        });
      }
      
      await loadCampaigns();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'action',
        variant: 'destructive',
      });
    } finally {
      // Retirer la campagne de la liste des campagnes en cours de mise à jour
      setUpdatingCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    for (const id of selectedCampaigns) {
      await handleAction(action, id);
    }
    setSelectedCampaigns([]);
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedCampaigns(
      selectedCampaigns.length === filteredCampaigns.length 
        ? [] 
        : filteredCampaigns.map(c => c.id)
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des campagnes</h1>
        <p className="text-gray-200">Modérez et gérez toutes les campagnes de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total campagnes</p>
              <p className="text-2xl font-bold text-white">{campaigns.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiFlag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">En attente</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.filter(c => c.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiPause className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Actives</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiPlay className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Terminées</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative w-full lg:w-1/2 xl:w-3/5">
             <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
             <input
               type="text"
               placeholder="Rechercher une campagne..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600"
             />
           </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:flex-1 lg:min-w-[360px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600"
            >
              <option value="" style={{backgroundColor: '#1f2937', color: 'white'}}>Tous les statuts</option>
              <option value="draft" style={{backgroundColor: '#1f2937', color: 'white'}}>Brouillon</option>
              <option value="active" style={{backgroundColor: '#1f2937', color: 'white'}}>Active</option>
              <option value="paused" style={{backgroundColor: '#1f2937', color: 'white'}}>En pause</option>
              <option value="completed" style={{backgroundColor: '#1f2937', color: 'white'}}>Terminée</option>
              <option value="cancelled" style={{backgroundColor: '#1f2937', color: 'white'}}>Annulée</option>
            </select>

            {selectedCampaigns.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-sm text-gray-200">
                  {selectedCampaigns.length} sélectionnée(s)
                </span>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '300px' }}>
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  Créateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '140px' }}>
                  Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                  Donateurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Date création
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={() => toggleCampaignSelection(campaign.id)}
                      className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={campaign.images?.[0] || '/placeholder-image.jpg'}
                        alt={campaign.title}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {campaign.title}
                        </div>
                        <div className="text-sm text-gray-300 truncate">{campaign.category?.name || campaign.category || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{`${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {formatAmount(campaign.totalRaised || campaign.currentAmount)}
                    </div>
                    <div className="text-xs text-gray-300">
                      sur {formatAmount(campaign.targetAmount)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                        style={{ 
                          width: `${Math.min(
                            ((campaign.totalRaised || campaign.currentAmount) / campaign.targetAmount) * 100, 
                            100
                          )}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {Math.round(((campaign.totalRaised || campaign.currentAmount) / campaign.targetAmount) * 100)}%
                    </div>
                    {campaign.totalRaised > campaign.currentAmount && (
                      <div className="text-xs text-blue-600 mt-1">
                        Disponible: {formatAmount(campaign.currentAmount)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {campaign._count?.donations || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`/campaigns/${campaign.id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Voir détails"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      
                      {/* Sélecteur de statut */}
                      {updatingCampaigns.has(campaign.id) ? (
                        <div className="flex items-center space-x-2">
                          <FiLoader className="w-4 h-4 animate-spin text-orange-500" />
                          <span className="text-xs text-gray-300">Mise à jour...</span>
                        </div>
                      ) : (
                        <select
                          value={campaign.status}
                          onChange={(e) => handleAction('change_status', campaign.id, e.target.value)}
                          className="text-xs border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded px-2 py-1 bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600 disabled:opacity-50"
                          title="Changer le statut"
                          disabled={updatingCampaigns.has(campaign.id)}
                        >
                          <option value="draft" style={{backgroundColor: '#1f2937', color: 'white'}}>Brouillon</option>
                          <option value="active" style={{backgroundColor: '#1f2937', color: 'white'}}>Active</option>
                          <option value="paused" style={{backgroundColor: '#1f2937', color: 'white'}}>En pause</option>
                          <option value="completed" style={{backgroundColor: '#1f2937', color: 'white'}}>Terminée</option>
                          <option value="cancelled" style={{backgroundColor: '#1f2937', color: 'white'}}>Annulée</option>
                        </select>
                      )}
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCampaigns.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx充分"></div>
        </div>
      )}

      <SimplePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}