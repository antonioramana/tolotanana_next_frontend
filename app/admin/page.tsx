'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import SimpleChart from '@/components/dashboard/SimpleChart';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiFlag, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiHeart, 
  FiCreditCard, 
  FiUserCheck,
  FiEye,
  FiCalendar,
  FiPieChart
} from 'react-icons/fi';

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await DashboardApi.getStats();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M Ar`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K Ar`;
    }
    return `${amount.toFixed(0)} Ar`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administration TOLOTANANA
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de la plateforme et métriques clés
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FiTrendingUp className="h-4 w-4" />
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Collecté"
          value={dashboardData?.generalStats.totalCollected || 0}
          subtitle="Montant total des donations"
          icon={FiDollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Frais de Plateforme"
          value={dashboardData?.generalStats.platformFees || 0}
          subtitle="Revenus de la plateforme"
          icon={FiCreditCard}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          loading={loading}
        />
        <StatsCard
          title="Campagnes Actives"
          value={dashboardData?.generalStats.activeCampaigns || 0}
          subtitle="Campagnes en cours"
          icon={FiFlag}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          loading={loading}
        />
        <StatsCard
          title="Utilisateurs Total"
          value={dashboardData?.generalStats.totalUsers || 0}
          subtitle="Utilisateurs inscrits"
          icon={FiUsers}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          loading={loading}
        />
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Donations"
          value={dashboardData?.generalStats.totalDonations || 0}
          subtitle="Nombre de donations"
          icon={FiHeart}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          loading={loading}
        />
        <StatsCard
          title="Taux de Réussite"
          value={`${dashboardData?.generalStats.successRate || 0}%`}
          subtitle="Campagnes réussies"
          icon={FiCheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          loading={loading}
        />
        <StatsCard
          title="Nouvelles Campagnes"
          value={dashboardData?.recentCampaigns.length || 0}
          subtitle="Ce mois-ci"
          icon={FiCalendar}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          loading={loading}
        />
      </div>

      {/* Graphiques */}
      {!loading && dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Évolution des revenus */}
          <SimpleChart
            type="line"
            title="Évolution des Revenus"
            data={dashboardData.revenueEvolution.map(item => ({
              label: item.monthName.split(' ')[0], // Juste le mois
              value: item.totalCollected,
            }))}
            height={300}
          />

          {/* Campagnes par catégorie */}
          <SimpleChart
            type="pie"
            title="Campagnes par Catégorie"
            data={dashboardData.campaignsByCategory.map((item, index) => ({
              label: item.categoryName,
              value: item.campaignsCount,
              color: `hsl(${(index * 360) / dashboardData.campaignsByCategory.length}, 70%, 50%)`,
            }))}
            height={300}
          />

          {/* Évolution des inscriptions */}
          <SimpleChart
            type="bar"
            title="Nouvelles Inscriptions"
            data={dashboardData.growthEvolution.slice(-6).map(item => ({
              label: item.monthName.split(' ')[0],
              value: item.usersCount,
            }))}
            height={300}
          />

          {/* Donations par mois */}
          <SimpleChart
            type="bar"
            title="Donations par Mois"
            data={dashboardData.revenueEvolution.slice(-6).map(item => ({
              label: item.monthName.split(' ')[0],
              value: item.donationsCount,
            }))}
            height={300}
          />
        </div>
      )}

      {/* Activité récente */}
      {!loading && dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donations importantes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="h-5 w-5 text-green-600" />
              Donations Importantes
            </h3>
            <div className="space-y-3">
              {dashboardData.recentLargeDonations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatAmount(donation.amount)}
                    </p>
                    <p className="text-sm text-gray-600">{donation.donorName}</p>
                    <p className="text-xs text-gray-500">{donation.campaignTitle}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(donation.createdAt)}
                  </span>
                </div>
              ))}
              {dashboardData.recentLargeDonations.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucune donation importante récente</p>
              )}
            </div>
          </div>

          {/* Nouvelles campagnes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiFlag className="h-5 w-5 text-orange-600" />
              Nouvelles Campagnes
            </h3>
            <div className="space-y-3">
              {dashboardData.recentCampaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">{campaign.title}</p>
                  <p className="text-sm text-gray-600">Par {campaign.creatorName}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {campaign.categoryName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(campaign.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {dashboardData.recentCampaigns.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucune nouvelle campagne</p>
              )}
            </div>
          </div>

          {/* Nouveaux utilisateurs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUserCheck className="h-5 w-5 text-purple-600" />
              Nouveaux Utilisateurs
            </h3>
            <div className="space-y-3">
              {dashboardData.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                      {user.role}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              ))}
              {dashboardData.recentUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucun nouvel utilisateur</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/campaigns"
            className="flex items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <FiFlag className="h-5 w-5 mr-2" />
            Campagnes
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FiUsers className="h-5 w-5 mr-2" />
            Utilisateurs
          </Link>
          <Link
            href="/admin/contact"
            className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FiAlertCircle className="h-5 w-5 mr-2" />
            Messages
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FiEye className="h-5 w-5 mr-2" />
            Paramètres
          </Link>
        </div>
      </div>
    </div>
  );
}