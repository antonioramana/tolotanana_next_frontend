'use client';
import { useEffect, useState } from 'react';
import { FiEye, FiCheck, FiX, FiSearch, FiFilter, FiDollarSign, FiUser, FiCalendar, FiClock, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { WithdrawalsApi, CatalogApi } from '@/lib/api';
import SimplePagination from '@/components/ui/simple-pagination';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

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

  // États pour les actions de retrait
  const [validatingWithdrawals, setValidatingWithdrawals] = useState<Set<string>>(new Set());
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [validationAction, setValidationAction] = useState<'approved' | 'rejected' | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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

  const handleWithdrawalAction = (withdrawalId: string, action: 'approved' | 'rejected') => {
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (withdrawal) {
      setSelectedWithdrawal(withdrawal);
      setValidationAction(action);
      setShowValidationModal(true);
      setCaptchaToken(null);
    }
  };

  const confirmValidation = async () => {
    if (!selectedWithdrawal || !validationAction || !captchaToken) {
      alert('Veuillez compléter la vérification reCAPTCHA');
      return;
    }

    try {
      setValidatingWithdrawals(prev => new Set(prev).add(selectedWithdrawal.id));
      
      const response = await fetch(`/api/admin/withdrawals/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user') as string)?.token || '' : ''}`
        },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal.id,
          action: validationAction,
          captchaToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la validation');
      }

      alert(`Demande ${validationAction === 'approved' ? 'approuvée' : 'rejetée'} avec succès`);
      await loadWithdrawals();
      setShowValidationModal(false);
      setSelectedWithdrawal(null);
      setValidationAction(null);
      setCaptchaToken(null);
    } catch (error: any) {
      console.error('Erreur validation retrait:', error);
      alert(error.message || 'Erreur lors de la validation');
    } finally {
      setValidatingWithdrawals(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedWithdrawal.id);
        return newSet;
      });
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des retraits</h1>
        <p className="text-gray-100">Validez et gérez toutes les demandes de retrait</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-100">Total demandes</p>
              <p className="text-2xl font-bold text-white">{totalWithdrawals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-100">En attente</p>
              <p className="text-2xl font-bold text-white">
                {withdrawals.filter(w => w.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-100">Approuvées</p>
              <p className="text-2xl font-bold text-white">
                {withdrawals.filter(w => w.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-100">Montant total</p>
              <p className="text-2xl font-bold text-white">
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
      <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-full overflow-hidden">
  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center w-full">

    {/* Champ de recherche */}
    <div className="relative w-full lg:flex-1 min-w-0">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200" />
      <input
        type="text"
        placeholder="Rechercher par demandeur, campagne ou justification..."
        value={searchTerm}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        className="pl-10 w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600 text-sm sm:text-base"
      />
    </div>

    {/* Filtres */}
    <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
      <select
        value={statusFilter}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        className="flex-1 min-w-[150px] px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600 text-sm sm:text-base"
      >
        <option value="" style={{backgroundColor: '#1f2937', color: 'white'}}>Tous les statuts</option>
        <option value="pending" style={{backgroundColor: '#1f2937', color: 'white'}}>En attente</option>
        <option value="approved" style={{backgroundColor: '#1f2937', color: 'white'}}>Approuvé</option>
        <option value="rejected" style={{backgroundColor: '#1f2937', color: 'white'}}>Rejeté</option>
      </select>

      <select
        value={campaignFilter}
        onChange={(e) => handleFilterChange('campaign', e.target.value)}
        className="flex-1 min-w-[150px] px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600 text-sm sm:text-base"
      >
        <option value="" style={{backgroundColor: '#1f2937', color: 'white'}}>Toutes les campagnes</option>
        {campaigns.map((campaign) => (
          <option key={campaign.id} value={campaign.id} style={{backgroundColor: '#1f2937', color: 'white'}}>
            {campaign.title}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>

      {/* Withdrawals Table - Desktop */}
      <div className="hidden lg:block bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Demandeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Compte bancaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Date demande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Date traitement
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => {
                const requesterName = withdrawal.requester 
                  ? `${withdrawal.requester.firstName || ''} ${withdrawal.requester.lastName || ''}`.trim()
                  : 'Utilisateur inconnu';
                
                return (
                <tr key={withdrawal.id} className="hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                          <FiUser className="w-4 h-4 text-gray-200" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{requesterName}</div>
                          <div className="text-sm text-gray-200">{withdrawal.requester?.email}</div>
                        </div>
                      </div>
                  </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {getCampaignTitle(withdrawal.campaignId)}
                    </div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatAmount(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {withdrawal.bankInfo?.provider} - {withdrawal.bankInfo?.accountNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(withdrawal.createdAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
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
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Approuver"
                              disabled={validatingWithdrawals.has(withdrawal.id)}
                            >
                              {validatingWithdrawals.has(withdrawal.id) ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiCheck className="w-4 h-4" />
                              )}
                            </button>
                          <button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Rejeter"
                              disabled={validatingWithdrawals.has(withdrawal.id)}
                            >
                              {validatingWithdrawals.has(withdrawal.id) ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiX className="w-4 h-4" />
                              )}
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

      {/* Withdrawals Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-4">
        {withdrawals.map((withdrawal) => {
          const requesterName = withdrawal.requester 
            ? `${withdrawal.requester.firstName || ''} ${withdrawal.requester.lastName || ''}`.trim()
            : 'Utilisateur inconnu';
          
          return (
            <div key={withdrawal.id} className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700">
              {/* Header avec demandeur et statut */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="w-5 h-5 text-gray-100" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{requesterName}</div>
                    <div className="text-sm text-gray-200">{withdrawal.requester?.email}</div>
                  </div>
                </div>
                {getStatusBadge(withdrawal.status)}
              </div>

              {/* Informations principales */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-100">Campagne:</span>
                  <span className="text-sm font-medium text-white truncate ml-2">
                    {getCampaignTitle(withdrawal.campaignId)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-100">Montant:</span>
                  <span className="text-sm font-bold text-white">
                    {formatAmount(withdrawal.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-100">Compte:</span>
                  <span className="text-sm text-white">
                    {withdrawal.bankInfo?.provider} - {withdrawal.bankInfo?.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-100">Date demande:</span>
                  <span className="text-sm text-white">
                    {new Date(withdrawal.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {withdrawal.processedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Date traitement:</span>
                    <span className="text-sm text-white">
                      {new Date(withdrawal.processedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => {/* View details */}}
                  className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                  title="Voir les détails"
                >
                  <FiEye className="w-5 h-5" />
                </button>
                
                {withdrawal.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleWithdrawalAction(withdrawal.id, 'approved')}
                      className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      disabled={validatingWithdrawals.has(withdrawal.id)}
                    >
                      {validatingWithdrawals.has(withdrawal.id) ? (
                        <FiLoader className="w-4 h-4 inline mr-1 animate-spin" />
                      ) : (
                        <FiCheck className="w-4 h-4 inline mr-1" />
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      disabled={validatingWithdrawals.has(withdrawal.id)}
                    >
                      {validatingWithdrawals.has(withdrawal.id) ? (
                        <FiLoader className="w-4 h-4 inline mr-1 animate-spin" />
                      ) : (
                        <FiX className="w-4 h-4 inline mr-1" />
                      )}
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-200 mt-2">Chargement des demandes...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadWithdrawals}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-white"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && withdrawals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucune demande de retrait</h3>
          <p className="text-gray-100">Aucune demande de retrait trouvée avec ces critères</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && withdrawals.length > 0 && totalPages > 1 && (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-200">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalWithdrawals)} sur {totalWithdrawals} demandes
            </div>
            <SimplePagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      )}

      {/* Modal de confirmation de validation */}
      {showValidationModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{display: showValidationModal ? 'flex' : 'none'}}>
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {validationAction === 'approved' ? 'Approuver le retrait' : 'Rejeter le retrait'}
                </h3>
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="text-gray-200 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      <FiUser className="w-4 h-4 text-gray-200" />
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {selectedWithdrawal.requester 
                          ? `${selectedWithdrawal.requester.firstName || ''} ${selectedWithdrawal.requester.lastName || ''}`.trim()
                          : 'Utilisateur inconnu'
                        }
                      </div>
                      <div className="text-sm text-gray-200">{selectedWithdrawal.requester?.email}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-100">Montant:</span>
                      <span className="font-medium">{formatAmount(selectedWithdrawal.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-100">Campagne:</span>
                      <span className="font-medium">{getCampaignTitle(selectedWithdrawal.campaignId)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <FiAlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-sm text-yellow-200">
                      {validationAction === 'approved' 
                        ? 'Êtes-vous sûr de vouloir approuver ce retrait ? Cette action est irréversible.'
                        : 'Êtes-vous sûr de vouloir rejeter ce retrait ? Cette action est irréversible.'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <ResponsiveReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onChange={(token: string | null) => setCaptchaToken(token)}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg text-gray-200 hover:bg-gray-900 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmValidation}
                  disabled={!captchaToken || validatingWithdrawals.has(selectedWithdrawal.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${
                    validationAction === 'approved'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                  } disabled:opacity-50`}
                >
                  {validatingWithdrawals.has(selectedWithdrawal.id) ? (
                    <>
                      <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                      {validationAction === 'approved' ? 'Approbation...' : 'Rejet...'}
                    </>
                  ) : (
                    validationAction === 'approved' ? 'Approuver' : 'Rejeter'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}