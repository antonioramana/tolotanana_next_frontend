'use client';
import { useState, useEffect } from 'react';
import StatsCard from '@/components/ui/stats-card';
import CampaignCard from '@/components/ui/campaign-card';
import { FiDollarSign, FiTrendingUp, FiUsers, FiCalendar, FiPlus, FiClock } from 'react-icons/fi';
import Link from 'next/link';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CampaignsApi, DonationsApi, UsersApi } from '@/lib/api';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [profileData, campaignsData, donationsData] = await Promise.all([
        UsersApi.getProfile(),
        CampaignsApi.myCampaigns('?page=1&limit=10'),
        UsersApi.getMyDonations('?page=1&limit=10')
      ]);

      setProfile(profileData);
      
      const campaignsList = Array.isArray(campaignsData?.data) ? campaignsData.data : [];
      setCampaigns(campaignsList);

      const donationsList = Array.isArray(donationsData?.data) ? donationsData.data : [];
      setDonations(donationsList);

      // Calculate stats from the loaded data
      setStats({
        monthlyGrowth: calculateMonthlyGrowth(campaignsList),
        totalCampaigns: campaignsList.length,
        totalDonations: donationsList.length
      });
    } catch (e) {
      setError('Erreur de chargement des données');
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0, // car l'Ariary n’a pas de sous-unité
      maximumFractionDigits: 0,
    }).format(num || 0);
  };
  

  // Calculate stats from real data
  const totalRaised = campaigns.reduce((sum, c) => sum + (parseFloat(c.currentAmount) || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalDonors = campaigns.reduce((sum, c) => sum + (c._count?.donations || 0), 0);
  
  // Find next deadline
  const upcomingCampaigns = campaigns
    .filter(c => c.status === 'active' && new Date(c.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  const nextDeadline = upcomingCampaigns[0];
  const daysUntilDeadline = nextDeadline 
    ? Math.ceil((new Date(nextDeadline.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Generate chart data from real data
  const monthlyData = generateMonthlyData(campaigns);
  const categoryData = generateCategoryData(campaigns);

  // Helper functions for calculations
  function calculateMonthlyGrowth(campaigns: any[]) {
    if (campaigns.length === 0) return 0;
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const lastMonthCampaigns = campaigns.filter(c => {
      const created = new Date(c.createdAt);
      return created >= lastMonth && created < thisMonth;
    });
    
    const thisMonthCampaigns = campaigns.filter(c => {
      const created = new Date(c.createdAt);
      return created >= thisMonth;
    });
    
    const lastMonthTotal = lastMonthCampaigns.reduce((sum, c) => sum + (parseFloat(c.currentAmount) || 0), 0);
    const thisMonthTotal = thisMonthCampaigns.reduce((sum, c) => sum + (parseFloat(c.currentAmount) || 0), 0);
    
    if (lastMonthTotal === 0) return thisMonthTotal > 0 ? 100 : 0;
    
    return Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);
  }

  // Helper functions for chart data
  function generateMonthlyData(campaigns: any[]) {
    const monthlyTotals: { [key: string]: number } = {};
    
    campaigns.forEach(campaign => {
      const month = new Date(campaign.createdAt).toLocaleDateString('fr-FR', { month: 'short' });
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += parseFloat(campaign.currentAmount) || 0;
    });

    return Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    }));
  }

  function generateCategoryData(campaigns: any[]) {
    const categoryTotals: { [key: string]: { value: number; color: string } } = {};
    const colors = ['#FF6B35', '#F7931E', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    let colorIndex = 0;

    campaigns.forEach(campaign => {
      const categoryName = campaign.category?.name || 'Autre';
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          value: 0,
          color: colors[colorIndex % colors.length]
        };
        colorIndex++;
      }
      categoryTotals[categoryName].value += parseFloat(campaign.currentAmount) || 0;
    });

    return Object.entries(categoryTotals).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color
    }));
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue {profile?.firstName || 'Utilisateur'} ! Voici un aperçu de vos campagnes.
          </p>
        </div>
        <Link
          href="/dashboard/create-campaign"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Nouvelle campagne
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total collecté"
          value={formatAmount(totalRaised)}
          change={stats?.monthlyGrowth ? `+${stats.monthlyGrowth}% ce mois` : "—"}
          changeType="positive"
          icon={<FiDollarSign />}
          description="Toutes campagnes confondues"
        />
        <StatsCard
          title="Campagnes actives"
          value={activeCampaigns.toString()}
          change={campaigns.length > 0 ? `${campaigns.length} au total` : "Aucune campagne"}
          changeType="neutral"
          icon={<FiTrendingUp />}
          description="En cours de collecte"
        />
        <StatsCard
          title="Total donateurs"
          value={totalDonors.toString()}
          change={donations.length > 0 ? `${donations.length} dons reçus` : "Aucun don"}
          changeType="positive"
          icon={<FiUsers />}
          description="Personnes qui vous soutiennent"
        />
        <StatsCard
          title="Prochaine échéance"
          value={daysUntilDeadline ? `${daysUntilDeadline} jours` : "—"}
          change={nextDeadline ? nextDeadline.title : "Aucune échéance"}
          changeType={daysUntilDeadline && daysUntilDeadline < 7 ? "negative" : "neutral"}
          icon={<FiCalendar />}
          description="Jusqu'à la fin"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des collectes
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-gray-600">Graphique temporairement indisponible</p>
              <p className="text-sm text-gray-500 mt-2">
                {monthlyData.length > 0 ? `${monthlyData.length} mois de données` : 'Aucune donnée'}
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition par catégorie
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600">Graphique temporairement indisponible</p>
              <p className="text-sm text-gray-500 mt-2">
                {categoryData.length > 0 ? `${categoryData.length} catégories` : 'Aucune catégorie'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes campagnes</h2>
          <Link
            href="/dashboard/campaigns"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Voir toutes →
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune campagne</h3>
            <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de campagne</p>
            <Link
              href="/dashboard/create-campaign"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Créer ma première campagne
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 3).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Derniers dons reçus
        </h3>
        {donations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Aucun don reçu pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.slice(0, 5).map((donation) => {
              const donorName = donation.donor 
                ? `${donation.donor.firstName || ''} ${donation.donor.lastName || ''}`.trim()
                : donation.donorName || 'Donateur Anonyme';
              const isAnonymous = donation.isAnonymous || !donation.donor;
              
              return (
                <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {isAnonymous ? 'Donateur anonyme' : donorName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {donation.campaign?.title || 'Campagne inconnue'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatAmount(donation.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}