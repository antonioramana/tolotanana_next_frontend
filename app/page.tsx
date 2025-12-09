'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CampaignCard from '@/components/ui/campaign-card';
import { FiArrowRight, FiShield, FiTrendingUp, FiUsers, FiHeart, FiStar, FiMessageSquare } from 'react-icons/fi';
import { getStoredUser } from '@/lib/auth-client';
import { CatalogApi, PublicTestimonialsApi } from '@/lib/api';
import { PublicTestimonial } from '@/types';
import StatsSkeleton from '@/components/ui/StatsSkeleton';
import CampaignCardSkeleton from '@/components/ui/CampaignCardSkeleton';
import TestimonialSkeleton from '@/components/ui/TestimonialSkeleton';
import LoadingDots from '@/components/ui/LoadingDots';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [stats, setStats] = useState<{ label: string; value: string; icon: any }[]>([
    { label: 'Fonds collectés', value: '—', icon: FiTrendingUp },
    { label: 'Campagnes actives', value: '—', icon: FiHeart },
    { label: 'Donateurs', value: '—', icon: FiUsers },
    { label: 'Taux de réussite', value: '—', icon: FiShield },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Récupérer toutes les campagnes pour calculer les stats et les témoignages
        const [campaigns, testimonialsData] = await Promise.all([
          CatalogApi.campaigns(''),
          PublicTestimonialsApi.getHighlighted().catch(() => []) // Fallback en cas d'erreur
        ]);
        if (!cancelled) {
          const normalizedCampaigns = Array.isArray(campaigns) ? campaigns : [];
          setFeaturedCampaigns(normalizedCampaigns.filter(c => c.status === 'active').slice(0, 3));
          setTestimonials(testimonialsData || []);
          
          // Calculer les stats à partir des campagnes
          const totalRaised = normalizedCampaigns.reduce((sum, c) => {
            const amount = typeof c.currentAmount === 'string' ? parseFloat(c.currentAmount) : c.currentAmount || 0;
            return sum + amount;
          }, 0);
          
          const activeCount = normalizedCampaigns.filter(c => c.status === 'active').length;
          const completedCount = normalizedCampaigns.filter(c => c.status === 'completed').length;
          const totalDonors = normalizedCampaigns.reduce((sum, c) => sum + (c.totalDonors || 0), 0);
          const successRate = normalizedCampaigns.length > 0 ? (completedCount / normalizedCampaigns.length) * 100 : 0;
          
          setStats([
            { label: 'Fonds collectés', value: formatAmount(totalRaised), icon: FiTrendingUp },
            { label: 'Campagnes actives', value: String(activeCount), icon: FiHeart },
            { label: 'Donateurs', value: totalDonors > 0 ? formatNumber(totalDonors) : '0', icon: FiUsers },
            { label: 'Taux de réussite', value: `${Math.round(successRate)}%`, icon: FiShield },
          ]);
        }
      } catch (e) {
        console.error('Failed to load home data', e);
        if (!cancelled) {
          setFeaturedCampaigns([]);
          setStats([
            { label: 'Fonds collectés', value: '0 Ar', icon: FiTrendingUp },
            { label: 'Campagnes actives', value: '0', icon: FiHeart },
            { label: 'Donateurs', value: '0', icon: FiUsers },
            { label: 'Taux de réussite', value: '0%', icon: FiShield },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function formatAmount(amount: number) {
    if (!amount || isNaN(amount)) return '0 Ar';
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}G Ar`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M Ar`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K Ar`;
    return `${amount} Ar`;
  }

  function formatNumber(n: number) {
    if (n >= 10_000) return `${(n / 1000).toFixed(0)}K+`;
    return String(n);
  }

  const ratingCount = testimonials.length;
  const averageRating = ratingCount > 0
    ? testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / ratingCount
    : 0;
  const hasRatings = ratingCount > 0 && averageRating > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Ensemble, créons
              <span className="block text-orange-200">l'impact qui compte</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-orange-100">
              TOLOTANANA connecte les cœurs généreux aux causes qui ont besoin d'aide. 
              Chaque don compte, chaque geste fait la différence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/campaigns"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Explorer les campagnes
              </Link>
              <Link
                href="/dashboard/create-campaign"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-200"
              >
                Créer une campagne
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <stat.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Campagnes en vedette
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les campagnes qui font la différence dans nos communautés
            </p>
          </div>
          
          {loading ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/campaigns"
                  className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Voir toutes les campagnes
                  <FiArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-xl text-gray-600">
              Trois étapes simples pour faire la différence
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Créez votre campagne</h3>
              <p className="text-gray-600">
                Partagez votre histoire, définissez votre objectif et ajoutez des photos pour toucher le cœur des donateurs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Partagez avec vos proches</h3>
              <p className="text-gray-600">
                Diffusez votre campagne sur les réseaux sociaux et mobilisez votre entourage pour votre cause.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Recevez les fonds</h3>
              <p className="text-gray-600">
                Suivez vos dons en temps réel et retirez les fonds collectés pour réaliser votre projet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les témoignages de ceux qui ont transformé leurs vies grâce à TOLOTANANA
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <TestimonialSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Aucun témoignage disponible pour le moment.</p>
                </div>
              ) : (
                testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        {testimonial.avatar ? (
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <FiUsers className="w-6 h-6 text-orange-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-orange-600 font-medium">{testimonial.role}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <FiMessageSquare className="w-4 h-4 text-orange-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500 font-medium">
                        Campagne : {testimonial.campaign || 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <FiStar className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {hasRatings ? `Note moyenne de ${averageRating.toFixed(1)}/5` : 'Des utilisateurs satisfaits'}
            </h3>
            <p className="text-gray-600">
              {hasRatings
                ? `Basée sur ${formatNumber(ratingCount)} avis vérifiés`
                : 'Partagez votre expérience pour aider la communauté.'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à faire la différence ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-orange-100">
            Rejoignez des milliers de personnes qui utilisent TOLOTANANA pour transformer leurs idées en réalité.
          </p>
          <Link
            href={currentUser ? "/campaigns" : "/register"}
            className="inline-flex items-center bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            Commencer maintenant
            <FiArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}