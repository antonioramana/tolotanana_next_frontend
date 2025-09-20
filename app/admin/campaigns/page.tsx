'use client';
import { useEffect, useState } from 'react';
import { FiEye, FiCheck, FiX, FiPause, FiPlay, FiFlag, FiSearch } from 'react-icons/fi';
import { CampaignsApi } from '@/lib/api';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, [searchTerm, statusFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', '1');
      params.append('limit', '50');
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
      const res = await fetch(`${apiBase}/campaigns?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setCampaigns(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
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
      if (action === 'change_status' && newStatus) {
        await CampaignsApi.updateAdminStatus(campaignId, newStatus);
        alert(`Statut changé vers: ${getStatusText(newStatus)}`);
      } else if (action === 'approve') {
        await CampaignsApi.updateAdminStatus(campaignId, 'active');
      } else if (action === 'reject') {
        await CampaignsApi.updateAdminStatus(campaignId, 'cancelled');
      } else if (action === 'pause') {
        await CampaignsApi.updateAdminStatus(campaignId, 'paused');
      } else if (action === 'resume') {
        await CampaignsApi.updateAdminStatus(campaignId, 'active');
      }
      await loadCampaigns();
    } catch (e) {
      console.error('Action failed:', e);
      alert("Action échouée");
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des campagnes</h1>
        <p className="text-gray-600">Modérez et gérez toutes les campagnes de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total campagnes</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiFlag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiPause className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actives</p>
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
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative w-full lg:w-1/2 xl:w-3/5">
             <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input
               type="text"
               placeholder="Rechercher une campagne..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
             />
           </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:flex-1 lg:min-w-[360px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="active">Active</option>
              <option value="paused">En pause</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>

            {selectedCampaigns.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-sm text-gray-600">
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '300px' }}>
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  Créateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Collecté
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                  Donateurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Date création
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
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
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {campaign.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{campaign.category?.name || campaign.category || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{`${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAmount(campaign.currentAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      sur {formatAmount(campaign.targetAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign._count?.donations || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                      <select
                        value={campaign.status}
                        onChange={(e) => handleAction('change_status', campaign.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        title="Changer le statut"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="active">Active</option>
                        <option value="paused">En pause</option>
                        <option value="completed">Terminée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                      
                      <button
                        onClick={() => alert('Signalement envoyé')}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded"
                        title="Signaler"
                      >
                        <FiFlag className="w-4 h-4" />
                      </button>
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
    </div>
  );
}