'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheckCircle, FiClock, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function CampaignVerificationPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [lastVerification, setLastVerification] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api('/campaigns/verification/stats');
      setStats(response);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualVerification = async () => {
    try {
      setLoading(true);
      await api('/campaigns/verification/manual', { method: 'POST' });
      setLastVerification(new Date().toLocaleString('fr-FR'));
      await loadStats(); // Recharger les stats après vérification
    } catch (error) {
      console.error('Erreur lors de la vérification manuelle:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vérification des Campagnes</h1>
          <p className="text-gray-600 mt-2">Gestion automatique du statut des campagnes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={triggerManualVerification}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            <FiCheckCircle className="w-4 h-4" />
            Vérification Manuelle
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Vérification Automatique</h3>
              <p className="text-sm text-gray-600">Toutes les heures</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Objectif Atteint</h3>
              <p className="text-sm text-gray-600">Statut → Terminé</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Date Dépassée</h3>
              <p className="text-sm text-gray-600">Statut → Terminé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques des Campagnes</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.data?.total || 0}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.data?.byStatus?.active || 0}</div>
              <div className="text-sm text-gray-600">Actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.data?.byStatus?.completed || 0}</div>
              <div className="text-sm text-gray-600">Terminées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.data?.byStatus?.draft || 0}</div>
              <div className="text-sm text-gray-600">Brouillons</div>
            </div>
          </div>
        </div>
      )}

      {/* Last Verification */}
      {lastVerification && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">
              Dernière vérification manuelle : {lastVerification}
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Comment ça fonctionne ?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <FiClock className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
            <div>
              <strong>Vérification automatique :</strong> Le système vérifie toutes les campagnes toutes les heures
            </div>
          </div>
          <div className="flex items-start">
            <FiCheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
            <div>
              <strong>Objectif atteint :</strong> Les campagnes dont le montant collecté ≥ objectif sont marquées comme "terminées"
            </div>
          </div>
          <div className="flex items-start">
            <FiAlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
            <div>
              <strong>Date dépassée :</strong> Les campagnes dont la date limite est dépassée sont marquées comme "terminées"
            </div>
          </div>
          <div className="flex items-start">
            <FiRefreshCw className="w-4 h-4 text-orange-500 mt-1 mr-2 flex-shrink-0" />
            <div>
              <strong>Vérification manuelle :</strong> Vous pouvez déclencher une vérification immédiate avec le bouton ci-dessus
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

