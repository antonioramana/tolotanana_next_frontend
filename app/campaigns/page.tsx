'use client';
import { useState, useMemo, useEffect } from 'react';
import CampaignCard from '@/components/ui/campaign-card';
import CampaignCardSkeleton from '@/components/ui/CampaignCardSkeleton';
import LoadingDots from '@/components/ui/LoadingDots';
import { FiSearch, FiFilter, FiGrid, FiList, FiTrendingUp, FiClock, FiDollarSign } from 'react-icons/fi';
import { CatalogApi } from '@/lib/api';

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      setLoading(true);
      try {
        const [cats] = await Promise.all([
          CatalogApi.categories(),
        ]);
        if (!cancelled) {
          const normCats = Array.isArray(cats)
            ? cats.map((c: any) => ({ id: c.id ?? c.value ?? String(c), name: c.name ?? c.title ?? String(c) }))
            : [];
          setCategories(normCats);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadInitial();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCampaigns() {
      setLoadingCampaigns(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('categoryId', selectedCategory);
        const res = await CatalogApi.campaigns(params.toString());
        const normalized = (Array.isArray(res) ? res : []).map((c: any) => ({
          ...c,
          currentAmount: typeof c.currentAmount === 'string' ? parseFloat(c.currentAmount) : c.currentAmount,
          targetAmount: typeof c.targetAmount === 'string' ? parseFloat(c.targetAmount) : c.targetAmount,
          rating: typeof c.rating === 'string' ? parseFloat(c.rating) : c.rating,
        }));
        if (!cancelled) setCampaigns(normalized);
      } catch (e) {
        console.error('Failed to load campaigns', e);
        if (!cancelled) setCampaigns([]);
      } finally {
        if (!cancelled) setLoadingCampaigns(false);
      }
    }
    loadCampaigns();
    return () => { cancelled = true; };
  }, [searchTerm, selectedCategory]);

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.totalDonors || 0) - (a.totalDonors || 0));
        break;
      case 'amount':
        filtered.sort((a, b) => (b.currentAmount || 0) - (a.currentAmount || 0));
        break;
      case 'ending':
        filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
    }
    return filtered;
  }, [campaigns, sortBy]);

  const formatAmount = (amount: number) => {
    if (!amount || isNaN(amount)) return '0K Ar';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M Ar`;
    }
    return `${(amount / 1000).toFixed(0)}K Ar`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Découvrez les campagnes
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Explorez les projets qui ont besoin de votre soutien et faites la différence dans la vie des autres
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
{/* Search and Filters */}
<div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full max-w-full overflow-hidden">
  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center w-full">

    {/* Search */}
    <div className="relative w-full lg:flex-1 min-w-0">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Rechercher une campagne..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
      />
    </div>

    {/* Filters */}
    <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="flex-1 min-w-[150px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="flex-1 min-w-[150px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
      >
        <option value="recent">Plus récentes</option>
        <option value="popular">Plus populaires</option>
        <option value="amount">Montant collecté</option>
        <option value="ending">Fin bientôt</option>
      </select>

      {/* View Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-center lg:shrink-0">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'grid'
              ? 'bg-white shadow-sm text-orange-600'
              : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          <FiGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'list'
              ? 'bg-white shadow-sm text-orange-600'
              : 'text-gray-600 hover:text-orange-500'
          }`}
        >
          <FiList className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
              <FiTrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{filteredCampaigns.length}</div>
            <div className="text-gray-600">Campagnes trouvées</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatAmount(filteredCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0))}
            </div>
            <div className="text-gray-600">Total collecté</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredCampaigns.filter(c => c.status === 'active').length}
            </div>
            <div className="text-gray-600">Campagnes actives</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <FiFilter className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredCampaigns.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-gray-600">Objectifs atteints</div>
          </div>
        </div>

        {/* Campaigns Grid/List */}
        {loadingCampaigns ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {[...Array(3)].map((_, index) => (
                <CampaignCardSkeleton key={index} />
              ))}
            </div>
            <div className="text-center py-8">
              <LoadingDots size="lg" color="orange" />
              <p className="text-gray-600 mt-4 text-sm">Chargement des campagnes...</p>
            </div>
          </>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}

            {!loadingCampaigns && filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune campagne trouvée</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Aucune campagne disponible pour le moment'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}