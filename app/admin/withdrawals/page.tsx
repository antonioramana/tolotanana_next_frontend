'use client';
import { useEffect, useState } from 'react';
import { FiEye, FiCheck, FiX, FiSearch, FiFilter, FiDollarSign, FiUser, FiCalendar, FiClock, FiAlertCircle } from 'react-icons/fi';
import { WithdrawalsApi, CatalogApi } from '@/lib/api';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadWithdrawals();
    loadCampaigns();
  }, [searchTerm, statusFilter, campaignFilter, currentPage]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (campaignFilter) params.append('campaignId', campaignFilter);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
      const res = await fetch(`${apiBase}/withdrawal-requests?${params.toString()}`, { 
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user') as string)?.token || '' : ''}`
        }
      });
      const data = await res.json();
      setWithdrawals(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      
      // Update pagination info
      if (data?.meta) {
        setTotalPages(data.meta.totalPages || 1);
        setTotalWithdrawals(data.meta.total || 0);
      }
    } catch (e) {
      setError('Erreur de chargement des demandes de retrait');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await CatalogApi.campaigns('?page=1&limit=100');
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading campaigns:', e);
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return (new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0)) + " Ar";
  };
  

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="w-3 h-3 mr-1" />
            Approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiX className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      await WithdrawalsApi.updateStatus(withdrawalId, { status: action, notes });
      alert(`Demande ${action === 'approved' ? 'approuvée' : 'rejetée'} avec succès`);
      await loadWithdrawals();
    } catch (e) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    if (filterType === 'search') setSearchTerm(value);
    if (filterType === 'status') setStatusFilter(value);
    if (filterType === 'campaign') setCampaignFilter(value);
  };

  const getCampaignTitle = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title || 'Campagne inconnue';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des retraits</h1>
        <p className="text-gray-600">Validez et gérez toutes les demandes de retrait</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total demandes</p>
              <p className="text-2xl font-bold text-gray-900">{totalWithdrawals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {withdrawals.filter(w => w.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-gray-900">
                {withdrawals.filter(w => w.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
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
               placeholder="Rechercher par demandeur, campagne ou justification..."
              value={searchTerm}
               onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:flex-1 lg:min-w-[360px]">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>

            <select
              value={campaignFilter}
              onChange={(e) => handleFilterChange('campaign', e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Toutes les campagnes</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1400px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '200px' }}>
                  Demandeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '200px' }}>
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '200px' }}>
                  Compte bancaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Date demande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                  Date traitement
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => {
                const requesterName = withdrawal.requester 
                  ? `${withdrawal.requester.firstName || ''} ${withdrawal.requester.lastName || ''}`.trim()
                  : 'Utilisateur inconnu';
                
                return (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <FiUser className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{requesterName}</div>
                          <div className="text-sm text-gray-500">{withdrawal.requester?.email}</div>
                        </div>
                      </div>
                  </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getCampaignTitle(withdrawal.campaignId)}
                    </div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {withdrawal.bankInfo?.provider} - {withdrawal.bankInfo?.accountNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(withdrawal.createdAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                          onClick={() => {/* View details */}}
                          className="text-orange-600 hover:text-orange-900"
                          title="Voir les détails"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {withdrawal.status === 'pending' && (
                        <>
                          <button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            title="Approuver"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            title="Rejeter"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement des demandes...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadWithdrawals}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && withdrawals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande de retrait</h3>
          <p className="text-gray-600">Aucune demande de retrait trouvée avec ces critères</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && withdrawals.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalWithdrawals)} sur {totalWithdrawals} demandes
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}