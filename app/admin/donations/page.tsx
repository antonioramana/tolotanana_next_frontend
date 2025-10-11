'use client';
import { useEffect, useState } from 'react';
import { FiEye, FiCheck, FiX, FiSearch, FiFilter, FiDollarSign, FiUser, FiCalendar, FiLoader } from 'react-icons/fi';
import { DonationsApi, CatalogApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonations, setTotalDonations] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  // États pour le chargement et reCAPTCHA
  const [validatingDonations, setValidatingDonations] = useState<Set<string>>(new Set());
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [validationStatus, setValidationStatus] = useState<'completed' | 'failed' | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadDonations();
    loadCampaigns();
  }, [searchTerm, statusFilter, campaignFilter, currentPage]);

  const loadDonations = async () => {
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
      const res = await fetch(`${apiBase}/donations?${params.toString()}`, { 
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user') as string)?.token || '' : ''}`
        }
      });
      const data = await res.json();
      setDonations(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      
      // Update pagination info
      if (data?.meta) {
        setTotalPages(data.meta.totalPages || 1);
        setTotalDonations(data.meta.total || 0);
      }
    } catch (e) {
      setError('Erreur de chargement des dons');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
      
      // Récupérer le token d'authentification
      const authUser = localStorage.getItem('auth_user');
      const token = authUser ? JSON.parse(authUser).token : null;
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(`${apiBase}/campaigns?page=1&limit=100`, { 
        cache: 'no-store',
        headers
      });
      const data = await res.json();
      setCampaigns(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      console.error('Failed to load campaigns:', e);
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('fr-FR')} Ar`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Validé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      default: return status;
    }
  };

  // No client-side filtering needed since we're using server-side pagination

  const handleValidateDonation = async (donationId: string, status: 'completed' | 'failed') => {
    // Trouver le don sélectionné
    const donation = donations.find(d => d.id === donationId);
    if (!donation) return;

    setSelectedDonation(donation);
    setValidationStatus(status);
    setShowValidationModal(true);
  };

  const confirmValidation = async () => {
    if (!selectedDonation || !validationStatus || !captchaToken) {
      toast({
        title: 'Erreur',
        description: 'Veuillez vérifier le reCAPTCHA avant de continuer.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Activer l'état de chargement global
      setIsValidating(true);
      
      // Ajouter le don à la liste des dons en cours de validation
      setValidatingDonations(prev => new Set(prev).add(selectedDonation.id));
      
      // Récupérer le token d'authentification
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      // Utiliser la nouvelle API avec protection reCAPTCHA
      const response = await fetch('/api/admin/donations/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          donationId: selectedDonation.id,
          status: validationStatus,
          token: captchaToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la validation du don');
      }

      toast({
        title: 'Succès',
        description: `Don ${validationStatus === 'completed' ? 'validé' : 'refusé'} avec succès`,
      });

      // Fermer le modal et recharger les données
      setShowValidationModal(false);
      setSelectedDonation(null);
      setValidationStatus(null);
      setCaptchaToken(null);
      await loadDonations();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la validation du don',
        variant: 'destructive',
      });
    } finally {
      // Désactiver l'état de chargement global
      setIsValidating(false);
      
      // Retirer le don de la liste des dons en cours de validation
      setValidatingDonations(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedDonation.id);
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
        <h1 className="text-3xl font-bold text-white mb-2">Validation des dons</h1>
        <p className="text-gray-200">Validez et gérez tous les dons de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total dons</p>
              <p className="text-2xl font-bold text-white">{donations.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">En attente</p>
              <p className="text-2xl font-bold text-white">
                {donations.filter(d => d.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Validés</p>
              <p className="text-2xl font-bold text-white">
                {donations.filter(d => d.status === 'completed').length}
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
              <p className="text-sm font-medium text-gray-200">Montant total</p>
              <p className="text-2xl font-bold text-white">
                {formatAmount(donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0))}
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
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
      <input
        type="text"
        placeholder="Rechercher par donateur, campagne ou message..."
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
        <option value="completed" style={{backgroundColor: '#1f2937', color: 'white'}}>Validé</option>
        <option value="failed" style={{backgroundColor: '#1f2937', color: 'white'}}>Échoué</option>
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


      {/* Donations Table - Desktop */}
      <div className="hidden lg:block bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Donateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Campagne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-200">
              {donations.map((donation) => {
                const donorName = donation.donor 
                  ? `${donation.donor.firstName || ''} ${donation.donor.lastName || ''}`.trim()
                  : donation.donorName || 'Anonyme';
                
                return (
                  <tr key={donation.id} className="hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <FiUser className="w-4 h-4 text-gray-200" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{donorName}</div>
                          {donation.isAnonymous && (
                            <div className="text-xs text-gray-300">Anonyme</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white truncate">
                        {getCampaignTitle(donation.campaignId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {formatAmount(donation.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white capitalize">
                        {donation.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                        {getStatusText(donation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white max-w-xs truncate">
                        {donation.message || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(donation.createdAt).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {donation.status === 'pending' && (
                          <>
                            {validatingDonations.has(donation.id) ? (
                              <div className="flex items-center space-x-2 bg-orange-50 px-2 py-1 rounded-lg">
                                <FiLoader className="w-4 h-4 animate-spin text-orange-500" />
                                <span className="text-xs text-orange-700 font-medium">Validation en cours...</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleValidateDonation(donation.id, 'completed')}
                                  className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                                  title="Valider le don"
                                  disabled={validatingDonations.has(donation.id)}
                                >
                                  <FiCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleValidateDonation(donation.id, 'failed')}
                                  className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                                  title="Refuser le don"
                                  disabled={validatingDonations.has(donation.id)}
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => window.open(`/campaigns/${donation.campaignId}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir la campagne"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donations Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-4">
        {donations.map((donation) => {
          const donorName = donation.donor 
            ? `${donation.donor.firstName || ''} ${donation.donor.lastName || ''}`.trim()
            : donation.donorName || 'Anonyme';
          
          return (
            <div key={donation.id} className="bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-700">
              {/* Header avec donateur et statut */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="w-5 h-5 text-gray-200" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{donorName}</div>
                    {donation.isAnonymous && (
                      <div className="text-xs text-gray-300">Anonyme</div>
                    )}
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                  {getStatusText(donation.status)}
                </span>
              </div>

              {/* Informations principales */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-200">Campagne:</span>
                  <span className="text-sm font-medium text-white truncate ml-2">
                    {getCampaignTitle(donation.campaignId)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-200">Montant:</span>
                  <span className="text-sm font-bold text-white">
                    {formatAmount(donation.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-200">Méthode:</span>
                  <span className="text-sm text-white capitalize">
                    {donation.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-200">Date:</span>
                  <span className="text-sm text-white">
                    {new Date(donation.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {donation.message && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-200">Message:</span>
                    <p className="text-sm text-white mt-1">{donation.message}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => window.open(`/campaigns/${donation.campaignId}`, '_blank')}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Voir la campagne"
                >
                  <FiEye className="w-5 h-5" />
                </button>
                
                {donation.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    {validatingDonations.has(donation.id) ? (
                      <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                        <FiLoader className="w-4 h-4 animate-spin text-orange-500" />
                        <span className="text-xs text-orange-700 font-medium">Validation en cours...</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleValidateDonation(donation.id, 'completed')}
                          className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          disabled={validatingDonations.has(donation.id)}
                        >
                          <FiCheck className="w-4 h-4 inline mr-1" />
                          Valider
                        </button>
                        <button
                          onClick={() => handleValidateDonation(donation.id, 'failed')}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          disabled={validatingDonations.has(donation.id)}
                        >
                          <FiX className="w-4 h-4 inline mr-1" />
                          Refuser
                        </button>
                      </>
                    )}
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
          <p className="text-gray-300 mt-2">Chargement des dons...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadDonations}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && donations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun don trouvé</h3>
          <p className="text-gray-200">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && donations.length > 0 && totalPages > 1 && (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalDonations)} sur {totalDonations} dons
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          : 'text-gray-100 bg-gray-800 border border-gray-300 hover:bg-gray-900'
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
                className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de chargement global */}
      {isValidating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLoader className="w-8 h-8 text-orange-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Validation en cours
              </h3>
              <p className="text-gray-200">
                Veuillez patienter pendant que nous validons le don...
              </p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de validation */}
      {showValidationModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Confirmer la validation du don
              </h3>
              
              <div className="mb-6">
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Donateur:</span>
                      <p className="font-medium">{selectedDonation.donorName || 'Anonyme'}</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Montant:</span>
                      <p className="font-medium">{formatAmount(selectedDonation.amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Campagne:</span>
                      <p className="font-medium">{getCampaignTitle(selectedDonation.campaignId)}</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Méthode:</span>
                      <p className="font-medium">{selectedDonation.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  validationStatus === 'completed' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-medium ${
                    validationStatus === 'completed' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationStatus === 'completed' 
                      ? '✅ Valider ce don' 
                      : '❌ Refuser ce don'
                    }
                  </p>
                  <p className={`text-sm mt-1 ${
                    validationStatus === 'completed' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationStatus === 'completed' 
                      ? 'Le montant sera ajouté au total de la campagne' 
                      : 'Le don sera marqué comme échoué'
                    }
                  </p>
                </div>
              </div>

              {/* reCAPTCHA */}
              <div className="flex justify-center mb-6">
                <ResponsiveReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onChange={(token: string | null) => setCaptchaToken(token)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowValidationModal(false);
                    setSelectedDonation(null);
                    setValidationStatus(null);
                    setCaptchaToken(null);
                  }}
                  disabled={isValidating}
                  className="px-4 py-2 text-gray-300 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmValidation}
                  disabled={!captchaToken || isValidating}
                  className={`px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
                    validationStatus === 'completed'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isValidating ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <span>{validationStatus === 'completed' ? 'Valider le don' : 'Refuser le don'}</span>
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
