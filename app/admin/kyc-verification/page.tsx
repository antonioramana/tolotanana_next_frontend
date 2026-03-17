'use client';

import { useState, useEffect } from 'react';
import { FiShield, FiEye, FiCheck, FiX, FiSearch, FiFilter, FiClock, FiUser, FiHome, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { KycApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import SecureImage from '@/components/ui/secure-image';
import UserAvatar from '@/components/ui/user-avatar';

export default function AdminKycVerificationPage() {
  const { toast } = useToast();
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        KycApi.list({ status: statusFilter || undefined, page, limit: 10 }),
        KycApi.stats(),
      ]);
      setKycRequests(listRes.data || []);
      setTotalPages(listRes.totalPages || 1);
      setStats(statsRes);
    } catch (err) {
      console.error('Erreur chargement KYC:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (kycId: string) => {
    try {
      const detail = await KycApi.getById(kycId);
      setSelectedKyc(detail);
      setShowDetailModal(true);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les détails', variant: 'destructive' });
    }
  };

  const handleApprove = async (kycId: string) => {
    setProcessing(true);
    try {
      await KycApi.review(kycId, { action: 'approved' });
      toast({ title: 'Succès', description: 'Demande approuvée. L\'utilisateur est maintenant vérifié.' });
      setShowDetailModal(false);
      loadData();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors de l\'approbation', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectionReason.trim()) {
      toast({ title: 'Champ requis', description: 'Veuillez saisir la raison du rejet', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    try {
      await KycApi.review(kycId, { action: 'rejected', rejectionReason });
      toast({ title: 'Succès', description: 'Demande rejetée. L\'utilisateur a été notifié.' });
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      loadData();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors du rejet', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">En attente</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approuvé</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejeté</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FiShield className="w-7 h-7 text-orange-500" />
            Vérifications KYC
          </h1>
          <p className="text-sm text-gray-600 mt-1">Gérez les demandes de vérification d'identité</p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <FiClock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-xs text-yellow-600">En attente</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <FiCheck className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
            <p className="text-xs text-green-600">Approuvés</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <FiX className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-xs text-red-600">Rejetés</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <FiShield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-xs text-blue-600">Total</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <FiFilter className="w-4 h-4 text-gray-500" />
        {['', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => { setStatusFilter(f); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === '' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Rejetés'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : kycRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiShield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune demande de vérification trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nom sur le document</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kycRequests.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={kyc.user?.avatar} alt={`${kyc.user?.firstName} ${kyc.user?.lastName}`} size="md" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {kyc.user?.firstName} {kyc.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{kyc.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm">
                        {kyc.type === 'personal' ? <FiUser className="w-3.5 h-3.5" /> : <FiHome className="w-3.5 h-3.5" />}
                        {kyc.type === 'personal' ? 'CIN' : 'NIF/STAT'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{kyc.fullName}</td>
                    <td className="px-4 py-3">{statusBadge(kyc.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(kyc.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(kyc.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
              >
                <FiChevronLeft className="w-4 h-4" /> Précédent
              </button>
              <span className="text-sm text-gray-600">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50"
              >
                Suivant <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedKyc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiShield className="w-6 h-6 text-orange-500" />
                  Détail de la vérification
                </h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <UserAvatar src={selectedKyc.user?.avatar} alt={`${selectedKyc.user?.firstName} ${selectedKyc.user?.lastName}`} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedKyc.user?.firstName} {selectedKyc.user?.lastName}</p>
                    <p className="text-sm text-gray-600">{selectedKyc.user?.email}</p>
                    <p className="text-xs text-gray-500">
                      {selectedKyc.user?.phone || 'Pas de téléphone'} | Rôle : {selectedKyc.user?.role} | Inscrit le {new Date(selectedKyc.user?.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="ml-auto">{statusBadge(selectedKyc.status)}</div>
                </div>
              </div>

              {/* KYC Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Type</p>
                  <p className="font-medium">{selectedKyc.type === 'personal' ? 'Personnel (CIN)' : 'Organisation (NIF/STAT)'}</p>
                </div>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Numéro de document</p>
                  <p className="font-medium font-mono">{selectedKyc.documentNumber}</p>
                </div>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Nom sur le document</p>
                  <p className="font-medium">{selectedKyc.fullName}</p>
                </div>
                {selectedKyc.organizationName && (
                  <div className="bg-white border rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Organisation</p>
                    <p className="font-medium">{selectedKyc.organizationName}</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Documents soumis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedKyc.documentFront && (
                    <div className="border rounded-xl overflow-hidden">
                      <p className="text-xs text-center py-1 bg-gray-50 font-medium text-gray-600">
                        {selectedKyc.type === 'personal' ? 'CIN Recto' : 'NIF/STAT'}
                      </p>
                      <SecureImage
                        src={selectedKyc.documentFront}
                        alt="Document recto"
                        className="w-full h-48 object-contain bg-gray-100 cursor-pointer"
                      />
                    </div>
                  )}
                  {selectedKyc.documentBack && (
                    <div className="border rounded-xl overflow-hidden">
                      <p className="text-xs text-center py-1 bg-gray-50 font-medium text-gray-600">
                        {selectedKyc.type === 'personal' ? 'CIN Verso' : 'Document complémentaire'}
                      </p>
                      <SecureImage
                        src={selectedKyc.documentBack}
                        alt="Document verso"
                        className="w-full h-48 object-contain bg-gray-100 cursor-pointer"
                      />
                    </div>
                  )}
                  {selectedKyc.selfiePhoto && (
                    <div className="border rounded-xl overflow-hidden">
                      <p className="text-xs text-center py-1 bg-gray-50 font-medium text-gray-600">Selfie avec document</p>
                      <SecureImage
                        src={selectedKyc.selfiePhoto}
                        alt="Selfie"
                        className="w-full h-48 object-contain bg-gray-100 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason if already rejected */}
              {selectedKyc.status === 'rejected' && selectedKyc.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-red-800">Raison du rejet :</p>
                  <p className="text-sm text-red-700">{selectedKyc.rejectionReason}</p>
                  {selectedKyc.reviewer && (
                    <p className="text-xs text-red-600 mt-2">Par {selectedKyc.reviewer.firstName} {selectedKyc.reviewer.lastName}</p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {selectedKyc.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedKyc.id)}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <FiCheck className="w-5 h-5" />
                    Approuver
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <FiX className="w-5 h-5" />
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedKyc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Raison du rejet</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-400"
              placeholder="Expliquez pourquoi la demande est rejetée..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(selectedKyc.id)}
                disabled={processing}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
