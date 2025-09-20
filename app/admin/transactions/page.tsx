'use client';
import { useEffect, useState } from 'react';
import { DonationsApi, WithdrawalsApi } from '@/lib/api';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';
import { formatMoney } from '@/lib/utils';

export default function AdminTransactionsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'donations' | 'withdrawals'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
  
      
      const [donationsResponse, withdrawalsResponse] = await Promise.all([
        DonationsApi.list('?page=1&limit=100'),
        WithdrawalsApi.all('?page=1&limit=100')
      ]);

    

      // Essayer différentes structures possibles
      let donationsList = [];
      let withdrawalsList = [];

      if (Array.isArray(donationsResponse)) {
        donationsList = donationsResponse;
      } else if ((donationsResponse as any)?.data && Array.isArray((donationsResponse as any).data)) {
        donationsList = (donationsResponse as any).data;
      } else if ((donationsResponse as any)?.list && Array.isArray((donationsResponse as any).list)) {
        donationsList = (donationsResponse as any).list;
      }

      if (Array.isArray(withdrawalsResponse)) {
        withdrawalsList = withdrawalsResponse;
      } else if ((withdrawalsResponse as any)?.data && Array.isArray((withdrawalsResponse as any).data)) {
        withdrawalsList = (withdrawalsResponse as any).data;
      } else if ((withdrawalsResponse as any)?.list && Array.isArray((withdrawalsResponse as any).list)) {
        withdrawalsList = (withdrawalsResponse as any).list;
      }

     
      setDonations(donationsList);
      setWithdrawals(withdrawalsList);

      // Si pas de données, afficher un message informatif
      if (donationsList.length === 0 && withdrawalsList.length === 0) {
        setError('Aucune donnée trouvée. Créez d\'abord des campagnes et des dons.');
      }
    } catch (e) {
      setError('Erreur de chargement des données');
      console.error('❌ Transactions load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate stats
  const totalDonations = donations.length;
  const totalWithdrawals = withdrawals.length;
  const totalDonationAmount = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalWithdrawalAmount = withdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  const netAmount = totalDonationAmount - totalWithdrawalAmount;

  // Combine and sort transactions
  const allTransactions = [
    ...donations.map(d => ({
      ...d,
      type: 'donation',
      transactionType: 'Entrée',
      icon: FiTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    })),
    ...withdrawals.map(w => ({
      ...w,
      type: 'withdrawal',
      transactionType: 'Sortie',
      icon: FiTrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredTransactions = activeTab === 'all' 
    ? allTransactions 
    : activeTab === 'donations' 
    ? allTransactions.filter(t => t.type === 'donation')
    : allTransactions.filter(t => t.type === 'withdrawal');

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FiRefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">Gestion de toutes les transactions financières</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FiRefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dons</p>
                <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiTrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Retraits</p>
                <p className="text-2xl font-bold text-gray-900">{totalWithdrawals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Montant Net</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(netAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entrées</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(totalDonationAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Toutes ({allTransactions.length})
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'donations'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dons ({totalDonations})
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'withdrawals'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Retraits ({totalWithdrawals})
              </button>
            </nav>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={`${transaction.type}-${transaction.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${transaction.bgColor}`}>
                          <transaction.icon className={`w-4 h-4 ${transaction.color}`} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.transactionType}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.type === 'donation' ? 'Don' : 'Retrait'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.donor?.firstName && transaction.donor?.lastName
                          ? `${transaction.donor.firstName} ${transaction.donor.lastName}`
                          : transaction.requester?.firstName && transaction.requester?.lastName
                          ? `${transaction.requester.firstName} ${transaction.requester.lastName}`
                          : 'Anonyme'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.donor?.email || transaction.requester?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        transaction.type === 'donation' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'donation' ? '+' : '-'}{formatMoney(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' || transaction.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Complété' :
                         transaction.status === 'approved' ? 'Approuvé' :
                         transaction.status === 'pending' ? 'En attente' :
                         transaction.status === 'failed' ? 'Échoué' :
                         transaction.status === 'rejected' ? 'Rejeté' : transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewDetails(transaction)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedTransactions.length === 0 && (
            <div className="text-center py-12">
              <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'all' 
                  ? 'Aucune transaction trouvée.'
                  : activeTab === 'donations'
                  ? 'Aucun don trouvé.'
                  : 'Aucun retrait trouvé.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredTransactions.length)} sur {filteredTransactions.length} transactions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {showDetailsModal && selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedTransaction(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Transaction Details Modal Component
function TransactionDetailsModal({ transaction, onClose }: { transaction: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Détails de la transaction
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="mt-1 text-sm text-gray-900">{transaction.transactionType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Montant</label>
              <p className={`mt-1 text-sm font-medium ${
                transaction.type === 'donation' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'donation' ? '+' : '-'}{formatMoney(transaction.amount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Statut</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                transaction.status === 'completed' || transaction.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : transaction.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {transaction.status === 'completed' ? 'Complété' :
                 transaction.status === 'approved' ? 'Approuvé' :
                 transaction.status === 'pending' ? 'En attente' :
                 transaction.status === 'failed' ? 'Échoué' :
                 transaction.status === 'rejected' ? 'Rejeté' : transaction.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {transaction.donor && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Donateur</label>
              <div className="mt-1 flex items-center">
                <img
                  className="h-8 w-8 rounded-full mr-3"
                  src={transaction.donor.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                  alt=""
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.donor.firstName} {transaction.donor.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.donor.email}</p>
                </div>
              </div>
            </div>
          )}

          {transaction.requester && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Demandeur</label>
              <div className="mt-1 flex items-center">
                <img
                  className="h-8 w-8 rounded-full mr-3"
                  src={transaction.requester.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                  alt=""
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.requester.firstName} {transaction.requester.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.requester.email}</p>
                </div>
              </div>
            </div>
          )}

          {transaction.campaign && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Campagne</label>
              <div className="mt-1">
                <p className="text-sm font-medium text-gray-900">{transaction.campaign.title}</p>
                <p className="text-sm text-gray-500">ID: {transaction.campaign.id}</p>
              </div>
            </div>
          )}

          {transaction.paymentMethod && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
              <p className="mt-1 text-sm text-gray-900">
                {transaction.paymentMethod === 'bank_transfer' ? 'Virement bancaire' :
                 transaction.paymentMethod === 'card' ? 'Carte bancaire' :
                 transaction.paymentMethod === 'mobile_money' ? 'Mobile Money' :
                 transaction.paymentMethod === 'cash' ? 'Espèces' : transaction.paymentMethod}
              </p>
            </div>
          )}

          {transaction.message && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <p className="mt-1 text-sm text-gray-900">{transaction.message}</p>
            </div>
          )}

          {transaction.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="mt-1 text-sm text-gray-900">{transaction.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
