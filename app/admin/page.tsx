'use client';
import { useState } from 'react';
import Link from 'next/link';
import StatsCard from '@/components/ui/stats-card';
import { fakeCampaigns, fakeDonations, fakeUsers } from '@/lib/fake-data';
import { FiDollarSign, FiTrendingUp, FiUsers, FiFlag, FiAlertCircle, FiCheckCircle, FiHeart, FiCreditCard, FiUserCheck } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboardPage() {
  const totalUsers = fakeUsers.length;
  const totalCampaigns = fakeCampaigns.length;
  const activeCampaigns = fakeCampaigns.filter(c => c.status === 'active').length;
  const totalRaised = fakeCampaigns.reduce((sum, c) => sum + c.currentAmount, 0);
  const platformFees = totalRaised * 0.05; // 5% platform fee
  const pendingCampaigns = fakeCampaigns.filter(c => c.status === 'draft').length;

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M Ar`;
    }
    return `${(amount / 1000).toFixed(0)}K Ar`;
  };

  // Chart data
  const monthlyStats = [
    { month: 'Jan', campaigns: 12, users: 45, revenue: 2500000 },
    { month: 'Fév', campaigns: 18, users: 78, revenue: 4200000 },
    { month: 'Mar', campaigns: 25, users: 112, revenue: 6800000 },
    { month: 'Avr', campaigns: 32, users: 156, revenue: 8900000 },
    { month: 'Mai', campaigns: 38, users: 203, revenue: 12500000 },
  ];

  const categoryStats = [
    { name: 'Santé', campaigns: 45, amount: 125000000 },
    { name: 'Éducation', campaigns: 32, amount: 89000000 },
    { name: 'Urgence', campaigns: 28, amount: 76000000 },
    { name: 'Communauté', campaigns: 15, amount: 34000000 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administration TOLOTANANA
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de la plateforme et métriques clés
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/campaigns" className="group">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-orange-300">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <FiFlag className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Campagnes</h3>
                <p className="text-sm text-gray-600">Gérer les campagnes</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/donations" className="group">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-orange-300">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <FiHeart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dons</h3>
                <p className="text-sm text-gray-600">Valider les dons</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="group">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-orange-300">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FiUserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Utilisateurs</h3>
                <p className="text-sm text-gray-600">Gérer les utilisateurs</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/transactions" className="group">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 hover:border-orange-300">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FiCreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Transactions</h3>
                <p className="text-sm text-gray-600">Voir toutes les transactions</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total utilisateurs"
          value={totalUsers.toString()}
          change="+12% ce mois"
          changeType="positive"
          icon={<FiUsers />}
          description="Demandeurs et donateurs"
        />
        <StatsCard
          title="Campagnes actives"
          value={activeCampaigns.toString()}
          change="+5 cette semaine"
          changeType="positive"
          icon={<FiTrendingUp />}
          description="En cours de collecte"
        />
        <StatsCard
          title="Total collecté"
          value={formatAmount(totalRaised)}
          change="+23% ce mois"
          changeType="positive"
          icon={<FiDollarSign />}
          description="Toutes campagnes confondues"
        />
        <StatsCard
          title="Frais plateforme"
          value={formatAmount(platformFees)}
          change={`${((platformFees / totalRaised) * 100).toFixed(1)}% du total`}
          changeType="neutral"
          icon={<FiFlag />}
          description="Revenus générés"
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">
                Actions requises
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li>• {pendingCampaigns} campagnes en attente de validation</li>
                <li>• 2 demandes de retrait à traiter</li>
                <li>• 3 signalements utilisateur à examiner</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <FiCheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">
                Statut système
              </h3>
              <ul className="space-y-2 text-green-700">
                <li>• Plateforme opérationnelle (99.9% uptime)</li>
                <li>• Paiements traités sans incident</li>
                <li>• Sauvegardes à jour</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des revenus
          </h3>
          <div className="h-64">
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <p>Graphique des statistiques mensuelles</p>
            </div>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Campagnes par catégorie
          </h3>
          <div className="h-64">
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <p>Graphique des catégories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Activité récente
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FiFlag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nouvelle campagne créée</p>
                <p className="text-sm text-gray-600">Construction école rurale - Jean Rakotomalala</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Il y a 2h</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Don important reçu</p>
                <p className="text-sm text-gray-600">2M Ar - Aide médicale urgente</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Il y a 4h</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nouvel utilisateur inscrit</p>
                <p className="text-sm text-gray-600">Pierre Andrianaivo - Demandeur</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Il y a 6h</span>
          </div>
        </div>
      </div>
    </div>
  );
}