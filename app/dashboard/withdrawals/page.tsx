'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiDollarSign, FiCalendar, FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';
import { WithdrawalsApi, CatalogApi, BankApi, CampaignsApi } from '@/lib/api';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

export default function UserWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [bankInfos, setBankInfos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadWithdrawals();
    loadCampaigns();
    loadBankInfos();
  }, [page]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(itemsPerPage));
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');
      const data = await WithdrawalsApi.myRequests(`?${params.toString()}`);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setWithdrawals(list);
      if ((data as any)?.meta?.totalPages) setTotalPages((data as any).meta.totalPages);
    } catch (e) {
      setError('Erreur de chargement des demandes de retrait');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      // Load all user campaigns, not just active ones
      const data = await CampaignsApi.myCampaigns('?page=1&limit=100');
      console.log('Campaigns API response:', data);
      console.log('Campaigns data structure:', JSON.stringify(data, null, 2));
      
      // Try different ways to access the data
      let campaignsData = [];
      if (Array.isArray(data)) {
        campaignsData = data;
      } else if (Array.isArray(data?.data)) {
        campaignsData = data.data;
      } else if (Array.isArray(data?.campaigns)) {
        campaignsData = data.campaigns;
      }
      
      console.log('Extracted campaigns:', campaignsData);
      
      // Filter campaigns that have some amount available for withdrawal
      const availableCampaigns = campaignsData.filter((campaign: any) => {
        const currentAmount = parseFloat(campaign.currentAmount) || 0;
        return currentAmount > 0;
      });
      setCampaigns(availableCampaigns);
      console.log('All campaigns loaded:', campaignsData.length);
      console.log('Available campaigns for withdrawal:', availableCampaigns.length);
    } catch (e) {
      console.error('Error loading campaigns:', e);
    }
  };

  const loadBankInfos = async () => {
    try {
      const data = await BankApi.list();
      console.log('Bank infos API response:', data);
      console.log('Bank infos data structure:', JSON.stringify(data, null, 2));
      
      // BankApi.list() returns an array directly
      const bankInfosData = Array.isArray(data) ? data : [];
      
      console.log('Extracted bank infos:', bankInfosData);
      setBankInfos(bankInfosData);
      console.log('Bank infos loaded:', bankInfosData.length);
    } catch (e) {
      console.error('Error loading bank infos:', e);
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

  const handleDeleteWithdrawal = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande de retrait ?')) return;
    
    try {
      await WithdrawalsApi.delete(id);
      await loadWithdrawals();
    } catch (e) {
      alert('Erreur lors de la suppression de la demande');
    }
  };

  const getCampaignTitle = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title || 'Campagne inconnue';
  };

  const getBankInfoTitle = (bankInfoId: string) => {
    const bankInfo = bankInfos.find(b => b.id === bankInfoId);
    if (!bankInfo) return 'Informations bancaires inconnues';
    return `${bankInfo.provider} - ${bankInfo.accountNumber}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes demandes de retrait</h1>
          <p className="text-gray-600">Gérez vos demandes de retrait de fonds</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              loadCampaigns();
              loadBankInfos();
            }}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🔄 Recharger
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Nouvelle demande
          </button>
        </div>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total demandes</p>
              <p className="text-2xl font-bold text-gray-900">{withdrawals.length}</p>
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
                {formatAmount(withdrawals.reduce((sum: number, w: any) => sum + (parseFloat(w.amount) || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement des demandes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={loadWithdrawals}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Réessayer
            </button>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande de retrait</h3>
            <p className="text-gray-600 mb-4">Vous n'avez pas encore fait de demande de retrait</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Créer une demande
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50">
                <tr>
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
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getCampaignTitle(withdrawal.campaignId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getBankInfoTitle(withdrawal.bankInfoId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(withdrawal.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleDateString('fr-FR') : '—'}
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
                              onClick={() => {/* Edit */}}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWithdrawal(withdrawal.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && withdrawals.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} sur {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Withdrawal Modal */}
      {showCreateForm && (
        <CreateWithdrawalModal
          campaigns={campaigns}
          bankInfos={bankInfos}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadWithdrawals();
          }}
        />
      )}
    </div>
  );
}

// Create Withdrawal Modal Component
function CreateWithdrawalModal({ campaigns, bankInfos, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    campaignId: '',
    amount: '',
    bankInfoId: '',
    justification: '',
    documents: [] as string[],
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const selectedCampaign = campaigns.find((c: any) => c.id === formData.campaignId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.campaignId || !formData.amount || !formData.bankInfoId || !formData.justification) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!captchaToken) {
      setError('Veuillez vérifier le reCAPTCHA avant de soumettre la demande');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Récupérer le token d'authentification
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      if (!token) {
        setError('Vous devez être connecté pour effectuer cette action');
        return;
      }

      // Utiliser la nouvelle API avec protection reCAPTCHA
      const response = await fetch('/api/withdrawals/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          token: captchaToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la demande');
      }

      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nouvelle demande de retrait</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campagne *
            </label>
            <select
              value={formData.campaignId}
              onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner une campagne ({campaigns.length} disponibles)</option>
              {campaigns.length === 0 ? (
                <option value="" disabled>Aucune campagne avec des fonds disponibles</option>
              ) : (
                campaigns.map((campaign: any) => (
                  <option key={campaign.id} value={campaign.id}>
                  {campaign.title} - {new Intl.NumberFormat("fr-FR", { 
                      style: "currency", 
                      currency: "MGA", 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 0 
                    }).format(parseFloat(campaign.currentAmount) || 0)} disponible
                </option>                
                ))
              )}
            </select>
            {campaigns.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                ⚠️ Aucune campagne avec des fonds disponibles. Créez d'abord une campagne et attendez des dons.
              </p>
            )}
          </div>

          {selectedCampaign && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
              <strong>Montant disponible :</strong>{' '}
                  {new Intl.NumberFormat('fr-MG', {
                    style: 'currency',
                    currency: 'MGA',
                    currencyDisplay: 'code',
                  }).format(parseFloat(selectedCampaign.currentAmount) || 0).replace('MGA', 'Ar')}
                </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à retirer (Ar) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={selectedCampaign ? parseFloat(selectedCampaign.currentAmount) : undefined}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compte bancaire *
            </label>
            <select
              value={formData.bankInfoId}
              onChange={(e) => setFormData({ ...formData, bankInfoId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un compte ({bankInfos.length} disponibles)</option>
              {bankInfos.length === 0 ? (
                <option value="" disabled>Aucun compte bancaire configuré</option>
              ) : (
                bankInfos.map((bankInfo: any) => (
                  <option key={bankInfo.id} value={bankInfo.id}>
                    {bankInfo.provider} - {bankInfo.accountNumber} {bankInfo.isDefault && '(Par défaut)'}
                  </option>
                ))
              )}
            </select>
            {bankInfos.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                ⚠️ Aucun compte bancaire configuré. <a href="/dashboard/settings" className="text-orange-600 hover:underline">Ajoutez vos informations bancaires</a> d'abord.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justification *
            </label>
            <textarea
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
              placeholder="Expliquez l'utilisation prévue des fonds..."
              required
            />
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ResponsiveReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token: string | null) => setCaptchaToken(token)}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Création...' : 'Créer la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}