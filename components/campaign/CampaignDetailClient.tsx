'use client';

import { useEffect, useState, useRef } from 'react';
import { getStoredUser } from '@/lib/auth-client';
import { FiShare2, FiCalendar, FiUsers, FiTrendingUp, FiClock, FiX, FiPlay, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { DonationsApi, BankApi, CampaignThankYouMessagesApi, PublicPlatformFeesApi, API_BASE } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { formatMoney } from '@/lib/utils';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';
import FavoriteToggle from '@/components/campaign/FavoriteToggle';
import FavoriteButton from '@/components/campaign/FavoriteButton';
import ShareModal from '@/components/campaign/ShareModal';
import { useFavorites } from '@/hooks/useFavorites';

interface CampaignDetailClientProps {
  campaign: any;
  onRefetch?: () => void;
}

export default function CampaignDetailClient({ campaign, onRefetch }: CampaignDetailClientProps) {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedMedia, setSelectedMedia] = useState<null | { kind: 'image' | 'video'; src: string }>(null);
  const [adminBankInfos, setAdminBankInfos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState<string>('Merci pour votre don ! Votre contribution a été enregistrée.');
  const [platformFees, setPlatformFees] = useState<{ percentage: number; description?: string }>({ percentage: 5.0 });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [optimisticAmount, setOptimisticAmount] = useState(0);
  const [optimisticDonors, setOptimisticDonors] = useState(0);
  const [selectedMobileProvider, setSelectedMobileProvider] = useState<'orange' | 'airtel' | 'mvola'>('orange');
  const [currentDonationsPage, setCurrentDonationsPage] = useState(1);
  const [currentUpdatesPage, setCurrentUpdatesPage] = useState(1);
  const [currentLatestDonationsPage, setCurrentLatestDonationsPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // Utiliser le hook useFavorites
  const favorites = useFavorites({
    campaignId: campaign.id,
    initialIsFavoris: campaign.isFavoris || false
  });

  useEffect(() => {
    setCurrentUser(getStoredUser());
    loadPlatformFees();
  }, [campaign.id]);

  // Charger les informations bancaires de l'admin
  useEffect(() => {
    const loadAdminBankInfos = async () => {
      try {
        const bankInfos = await BankApi.getAdminInfo();
        setAdminBankInfos(Array.isArray(bankInfos) ? bankInfos : []);
      } catch (error) {
        console.error('Erreur lors du chargement des informations bancaires de l\'admin:', error);
      }
    };
    loadAdminBankInfos();
  }, []);

  // Charger le message de remerciement personnalisé
  useEffect(() => {
    const loadThankYouMessage = async () => {
      try {
        const message = await CampaignThankYouMessagesApi.getActive(campaign.id);
        if (message && message.message) {
          setThankYouMessage(message.message);
        } else {
          setThankYouMessage('Merci pour votre don ! Votre contribution a été enregistrée avec succès. 🙏');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du message de remerciement:', error);
        setThankYouMessage('Merci pour votre don ! Votre contribution a été enregistrée avec succès. 🙏');
      }
    };
    
    if (campaign.id) {
      loadThankYouMessage();
    }
  }, [campaign.id]);

  const loadPlatformFees = async () => {
    try {
      const fees = await PublicPlatformFeesApi.getActive();
      setPlatformFees(fees);
    } catch (error) {
      console.error('Erreur lors du chargement des frais:', error);
      // Garder les frais par défaut de 5% en cas d'erreur
    }
  };

  useEffect(() => {
    if (currentUser) {
      const full = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
      setDonorName(full || '');
    }
  }, [currentUser]);



  // Debug: log raw campaign data
  useEffect(() => {
    // Deep copy to avoid proxies and circular structures when logging
    try {
      const safe = JSON.parse(JSON.stringify(campaign));
      // eslint-disable-next-line no-console
      console.log('[CampaignDetail] campaign payload:', safe);
      // eslint-disable-next-line no-console
      console.log('[CampaignDetail] donations:', safe?.donations);
      // eslint-disable-next-line no-console
      console.log('[CampaignDetail] category:', safe?.category);
      // eslint-disable-next-line no-console
      console.log('[CampaignDetail] creator:', safe?.creator);
      // eslint-disable-next-line no-console
      console.log('[CampaignDetail] stats:', safe?.stats, 'counts:', safe?._count);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('[CampaignDetail] campaign (raw):', campaign);
    }
  }, [campaign]);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M Ar`;
    }
    return `${(amount / 1000).toFixed(0)}K Ar`;
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'mobile_money': return 'Mobile money';
      case 'bank_account': return 'Virement bancaire';
      case 'espece': return 'Espèces';
      case 'card': return 'Carte bancaire';
      default: return method || '—';
    }
  };

  const baseCurrentAmount = typeof campaign.currentAmount === 'string' ? parseFloat(campaign.currentAmount) : campaign.currentAmount || 0;
  const baseTotalRaised = typeof campaign.totalRaised === 'string' ? parseFloat(campaign.totalRaised) : campaign.totalRaised || baseCurrentAmount;
  const displayCurrentAmount = baseCurrentAmount + optimisticAmount;
  const displayTotalRaised = baseTotalRaised + optimisticAmount;
  const displayTotalDonors = (campaign.totalDonors || 0) + optimisticDonors;
  const targetAmount = typeof campaign.targetAmount === 'string' ? parseFloat(campaign.targetAmount) : campaign.targetAmount || 0;
  const rating = typeof campaign.rating === 'string' ? parseFloat(campaign.rating) : (campaign.rating || 0);
  const deadlineDate = new Date(campaign.deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = deadlineDate < new Date();
  const isInactive = campaign.status !== 'active' || isExpired;
  const progressPercentage = targetAmount > 0 ? Math.min((displayTotalRaised / targetAmount) * 100, 100) : 0;

  const otherImages = Array.isArray(campaign.images) ? campaign.images.slice(1) : [];
  const hasVideo = Boolean((campaign as any).video);
  const videoSrc: string | undefined = (campaign as any).video;

  const getVideoEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const id = new URL(url).searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Fonction pour filtrer les informations bancaires selon la méthode de paiement
  const getFilteredBankInfos = () => {
    if (!adminBankInfos.length) return [];
    
    switch (paymentMethod) {
      case 'mobile_money':
        return adminBankInfos.filter(info => info.type === 'mobile_money');
      case 'bank_account':
        return adminBankInfos.filter(info => info.type === 'bank_account');
      case 'espece':
        // Pour les espèces, on peut afficher des instructions spéciales
        return [];
      default:
        return adminBankInfos;
    }
  };

  const handleDonation = async () => {
    
    setIsSubmitting(true);
    
    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: 'Montant invalide', description: 'Veuillez saisir un montant valide supérieur à 0.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }
    if (isInactive) {
      toast({ title: 'Campagne indisponible', description: 'Cette campagne est terminée ou inactive.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      toast({ title: 'Nom requis', description: 'Veuillez saisir votre nom pour le don.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (!captchaToken) {
      toast({ title: 'Vérification requise', description: 'Veuillez vérifier le reCAPTCHA avant de continuer.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }
    try {
      const finalIsAnonymous = isAnonymous;
      const donationData = {
        campaignId: campaign.id,
        amount: amountNum,
        message: donationMessage || undefined,
        donorName: finalIsAnonymous ? undefined : donorName.trim(),
        isAnonymous: finalIsAnonymous,
        paymentMethod,
        token: captchaToken
      };
      
      // Récupérer le token d'authentification (optionnel pour les dons)
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      // Utiliser la nouvelle API avec protection reCAPTCHA
      const response = await fetch('/api/donations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du don');
      }

      const result = await response.json();
      
      if (!result || !result.id) {
        throw new Error('Donation non créée');
      }
      
      // Fermer le modal de don
      setShowDonationModal(false);
      setDonationAmount('');
      setDonationMessage('');
      setDonorName(currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : '');
      setIsAnonymous(false);
      
      // Afficher le popup de remerciement
      setShowThankYouPopup(true);

      // Mettre à jour l'affichage local sans rechargement
      setOptimisticAmount(prev => prev + amountNum);
      setOptimisticDonors(prev => prev + 1);
      
      setIsSubmitting(false);
      
      // Afficher un toast de succès également
      toast({
        title: 'Don effectué avec succès !',
        description: 'Votre contribution a été enregistrée. Merci pour votre générosité !',
        variant: 'default',
      });
    } catch (e: any) {
      console.error('Erreur lors de la création du don:', e);
      toast({ title: 'Echec du don', description: 'Impossible de créer le don. Réessayez.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  // La fonction toggleFavorite est maintenant gérée par le hook useFavorites

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={campaign.images?.[0] || '/placeholder.png'}
                  alt={campaign.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {campaign.category?.name || campaign.category || '—'}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <FavoriteToggle
                    isFavoris={favorites.isFavoris}
                    onToggle={currentUser ? favorites.toggleFavorite : () => {
                      toast({
                        title: 'Connexion requise',
                        description: 'Veuillez vous connecter pour suivre cette campagne',
                        variant: 'destructive',
                      });
                    }}
                    isLoading={favorites.isLoading}
                    size="md"
                    className="shadow-lg"
                  />
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Partager"
                  >
                    <FiShare2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                {isInactive && (
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-gray-800/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Campagne terminée ou inactive
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                <div className="text-sm text-gray-500 mb-4">
                  Publié le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')} par {campaign.createdByName || `${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim()}
                </div>

                <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <FiUsers className="w-4 h-4 mr-1" />
                    <span>{displayTotalDonors} donateurs</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    <span>Échéance {new Date(campaign.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="w-4 h-4 mr-1" />
                    <span className={daysLeft > 0 ? 'text-green-600' : 'text-red-600'}>
                      {daysLeft > 0 ? `${daysLeft} jours restants` : 'Campagne terminée'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    <span>Note: {rating}/5</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progression</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
          <div className="flex justify-between text-lg font-semibold mt-3">
            <span className="text-orange-600">{formatMoney(displayTotalRaised)}</span>
            <span className="text-gray-600">sur {formatMoney(targetAmount)}</span>
          </div>
                  {displayTotalRaised > displayCurrentAmount && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="text-green-600">Disponible: {formatMoney(displayCurrentAmount)}</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">Total collecté: {formatMoney(displayTotalRaised)}</span>
                    </div>
                  )}
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
                </div>
              </div>
            </div>

            {(otherImages.length > 0 || hasVideo) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Galerie médias</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {hasVideo && videoSrc && (
                    <button
                      type="button"
                      onClick={() => setSelectedMedia({ kind: 'video', src: videoSrc })}
                      className="relative group aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-white transition-colors flex items-center justify-center shadow">
                          <FiPlay className="w-6 h-6 text-orange-600 ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 left-2 text-xs font-medium bg-black/50 text-white px-2 py-0.5 rounded">Vidéo</span>
                    </button>
                  )}
                  {otherImages.map((src: string, idx: number) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedMedia({ kind: 'image', src })}
                      className="relative group aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
                    >
                      <img
                        src={src}
                        alt={`Image ${idx + 2} de la campagne`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {campaign.updates && campaign.updates.length > 0 && (() => {
              const updatesPerPage = 3;
              const sortedUpdates = [...campaign.updates]
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              const totalPages = Math.ceil(sortedUpdates.length / updatesPerPage);
              const startIndex = (currentUpdatesPage - 1) * updatesPerPage;
              const endIndex = startIndex + updatesPerPage;
              const paginatedUpdates = sortedUpdates.slice(startIndex, endIndex);

              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Actualités</h2>
                  <div className="space-y-6 mb-4">
                    {paginatedUpdates.map((update: any) => (
                      <div key={update.id} className="border-l-4 border-orange-500 pl-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(update.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-gray-700">{update.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setCurrentUpdatesPage(prev => Math.max(1, prev - 1))}
                        disabled={currentUpdatesPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        Précédent
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Page <span className="font-semibold">{currentUpdatesPage}</span> sur <span className="font-semibold">{totalPages}</span>
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setCurrentUpdatesPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentUpdatesPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {Array.isArray(campaign.donations) && campaign.donations.length > 0 && (() => {
              const donationsPerPage = 3;
              const sortedLatestDonations = [...campaign.donations]
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              const totalPages = Math.ceil(sortedLatestDonations.length / donationsPerPage);
              const startIndex = (currentLatestDonationsPage - 1) * donationsPerPage;
              const endIndex = startIndex + donationsPerPage;
              const paginatedLatestDonations = sortedLatestDonations.slice(startIndex, endIndex);

              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Derniers dons</h2>
                  <div className="space-y-4 mb-4">
                    {paginatedLatestDonations.map((donation: any) => {
                      const amount = typeof donation.amount === 'string' ? parseFloat(donation.amount) : donation.amount || 0;
                      const donorName = donation.isAnonymous ? 'Donateur Anonyme' : (donation.donorName || `${donation.donor?.firstName || ''} ${donation.donor?.lastName || ''}`.trim() || 'Donateur');
                      return (
                        <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                               <FiHeart className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{donorName}</p>
                              {donation.message && (
                                <p className="text-sm text-gray-600">"{donation.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatMoney(amount)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(donation.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setCurrentLatestDonationsPage(prev => Math.max(1, prev - 1))}
                        disabled={currentLatestDonationsPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        Précédent
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Page <span className="font-semibold">{currentLatestDonationsPage}</span> sur <span className="font-semibold">{totalPages}</span>
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setCurrentLatestDonationsPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentLatestDonationsPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatMoney(displayCurrentAmount)}
                </div>
                <div className="text-gray-600">collectés sur {formatMoney(targetAmount)}</div>
                {campaign.stats?.pendingAmount > 0 && (
                  <div className="text-sm text-yellow-700 mt-1">{formatMoney(campaign.stats.pendingAmount)} en attente de validation</div>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  {displayTotalDonors} donateurs • {daysLeft > 0 ? `${daysLeft} jours restants` : 'Terminée'}
                </div>
              </div>

              <button
                onClick={() => setShowDonationModal(true)}
                disabled={isInactive}
                className={`w-full text-white font-semibold py-4 px-6 rounded-lg transition-colors mb-4 ${isInactive ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {isInactive ? 'Campagne indisponible' : 'Faire un don'}
              </button>



              <div className="grid grid-cols-2 gap-3 text-center">
                <FavoriteButton
                  campaignId={campaign.id}
                  initialIsFavoris={campaign.isFavoris || false}
                  variant="sidebar"
                  isFavoris={favorites.isFavoris}
                  onToggle={favorites.toggleFavorite}
                  isLoading={favorites.isLoading}
                />
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span>Partager</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organisateur</h3>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={campaign.creator?.avatar || '/placeholder-avatar.png'}
                  alt={campaign.createdByName || `${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim()}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{campaign.createdByName || `${campaign.creator?.firstName || ''} ${campaign.creator?.lastName || ''}`.trim()}</p>
                  <p className="text-sm text-gray-600">Organisateur</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FiTrendingUp className="w-4 h-4 mr-2" />
                <span>Note: {rating}/5</span>
              </div>
              {campaign.isVerified && (
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Profil vérifié</span>
                </div>
              )}
            </div>

            {(campaign.stats || campaign._count) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chiffres clés</h3>
                <div className="space-y-3 text-sm">
                  {campaign.stats?.totalDonations !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Total des dons</span><span className="font-medium">{campaign.stats.totalDonations}</span></div>
                  )}
                  {campaign.stats?.averageDonation !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Don moyen</span><span className="font-medium">{formatMoney(campaign.stats.averageDonation)}</span></div>
                  )}
                  {campaign.stats?.totalRaised !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Montant total</span><span className="font-medium">{formatMoney(campaign.stats.totalRaised)}</span></div>
                  )}
                  {campaign._count?.donations !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Nombre de dons</span><span className="font-medium">{campaign._count.donations}</span></div>
                  )}
                  {campaign._count?.favorites !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Favoris</span><span className="font-medium">{campaign._count.favorites}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Donations list under stats */}
            {Array.isArray(campaign.donations) && campaign.donations.length > 0 && (() => {
              const donationsPerPage = 3;
              const sortedDonations = [...campaign.donations]
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              const totalPages = Math.ceil(sortedDonations.length / donationsPerPage);
              const startIndex = (currentDonationsPage - 1) * donationsPerPage;
              const endIndex = startIndex + donationsPerPage;
              const paginatedDonations = sortedDonations.slice(startIndex, endIndex);

              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tous les dons</h3>
                  <div className="space-y-3 mb-4">
                    {paginatedDonations.map((donation: any) => {
                      const amount = typeof donation.amount === 'string' ? parseFloat(donation.amount) : donation.amount || 0;
                      const isAnon = donation.isAnonymous;
                      const donorName = isAnon ? 'Donateur Anonyme' : (donation.donorName || `${donation.donor?.firstName || ''} ${donation.donor?.lastName || ''}`.trim() || 'Donateur');
                      const avatar = donation.donor?.avatar || '/placeholder-avatar.png';
                      return (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={avatar} alt={donorName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{donorName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(donation.createdAt).toLocaleString('fr-FR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })} · {getPaymentMethodText(donation.paymentMethod)}
                              </p>
                              {donation.message && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">"{donation.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-3 flex-shrink-0">
                            <p className="font-semibold text-gray-900">{formatMoney(amount)}</p>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                donation.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : donation.status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {donation.status === 'completed'
                                ? 'Validé'
                                : donation.status === 'failed'
                                  ? 'Rejeté'
                                  : 'En attente'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setCurrentDonationsPage(prev => Math.max(1, prev - 1))}
                        disabled={currentDonationsPage === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        Précédent
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Page <span className="font-semibold">{currentDonationsPage}</span> sur <span className="font-semibold">{totalPages}</span>
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setCurrentDonationsPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentDonationsPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden">
            <button
              aria-label="Fermer"
              className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow"
              onClick={() => setSelectedMedia(null)}
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="bg-black">
              {selectedMedia.kind === 'image' ? (
                <img src={selectedMedia.src} alt="Aperçu média" className="max-h-[80vh] w-full object-contain" />
              ) : (
                videoSrc && (videoSrc.includes('youtu') ? (
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      src={getVideoEmbedUrl(videoSrc)}
                      title="Vidéo de la campagne"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video controls src={videoSrc} className="w-full max-h-[80vh]" />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl shadow-orange-200 border border-orange-100">
            <button
              aria-label="Fermer"
              onClick={() => setShowDonationModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <FiX className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Faire un don</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Montant du don (Ar)
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder-gray-400"
                  placeholder="Ex: 50 000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder-gray-400"
                  rows={3}
                  placeholder="Laissez un message d'encouragement..."
                />
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Nom du donateur
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-400 placeholder-gray-400"
                    placeholder={currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Ex: Jean Dupont'}
                  />
                </div>
              )}
              <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                              />
                              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                                Don anonyme
                              </label>
                            </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Méthode de paiement
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { id: 'mobile_money', label: 'Mobile Money', desc: 'Orange / Airtel / MVola', color: 'from-orange-500 to-yellow-400' },
                    { id: 'bank_account', label: 'Virement bancaire', desc: 'Compte bancaire', color: 'from-blue-500 to-indigo-500' },
                    { id: 'espece', label: 'Espèces', desc: 'Paiement en main propre', color: 'from-gray-500 to-gray-600' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        paymentMethod === m.id
                          ? 'border-orange-500 shadow-lg shadow-orange-100 bg-gradient-to-r ' + m.color + ' text-white'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>{m.label}</span>
                      </div>
                      <div className={`text-xs mt-1 ${paymentMethod === m.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {m.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Infos de paiement */}
            {(() => {
              const filteredBankInfos = getFilteredBankInfos();
              
              if (paymentMethod === 'espece') {
                return (
                  <div className="space-y-4 mt-6">
                    <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <FiHeart className="w-4 h-4 text-blue-600" />
                        Paiement en espèces
                      </h4>
                      <div className="text-sm text-gray-700">
                        <p className="mb-2">Pour effectuer un don en espèces, veuillez :</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Contacter directement l'organisateur de la campagne</li>
                          <li>Ou nous contacter via les coordonnées de l'administrateur</li>
                          <li>Prévoir un reçu de don pour votre contribution</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              }

              if (filteredBankInfos.length > 0) {
                return (
                  <div className="space-y-4 mt-6">
                    <div className="border rounded-xl p-4 bg-orange-50 border-orange-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <FiHeart className="w-4 h-4 text-orange-600" />
                        Informations de paiement - {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Virement bancaire'}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                        {filteredBankInfos.map((bankInfo, index) => (
                          <div key={bankInfo.id || index} className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <div className="space-y-0.5">
                                <div className="text-gray-600 text-[12px] uppercase tracking-wide">
                                  {bankInfo.type === 'mobile_money' ? 'Mobile Money' : 'Compte bancaire'}
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {bankInfo.bankName || (bankInfo.type === 'mobile_money' ? 'Compte Mobile' : 'Compte bancaire')}
                                </div>
                              </div>
                              {bankInfo.isDefault && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[11px] rounded-full">
                                  Par défaut
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Titulaire</span>
                                <span className="font-medium text-gray-900">{bankInfo.accountName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">{bankInfo.type === 'mobile_money' ? 'Numéro' : 'IBAN / RIB'}</span>
                                <span className="font-semibold text-gray-900 font-mono">{bankInfo.accountNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">{bankInfo.type === 'mobile_money' ? 'Opérateur' : 'Banque'}</span>
                                <span className="font-medium text-gray-900">{bankInfo.provider || '—'}</span>
                              </div>
                              {bankInfo.instructions && (
                                <div className="text-[11px] text-gray-500 mt-1">Note : {bankInfo.instructions}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        💡 Utilisez ces informations pour effectuer votre paiement vers l'administrateur.
                      </p>
                    </div>
                  </div>
                );
              }

              if (adminBankInfos.length > 0) {
                return (
                  <div className="space-y-4 mt-6">
                    <div className="border rounded-xl p-4 bg-yellow-50 border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <FiHeart className="w-4 h-4 text-yellow-600" />
                        Aucune information disponible
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Aucune information de paiement disponible pour la méthode sélectionnée. 
                        Veuillez choisir une autre méthode de paiement ou contacter l'administrateur.
                      </p>
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            {adminBankInfos.length === 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p>⚠️ Aucune information de paiement configurée. Contactez l'administrateur pour plus d'informations.</p>
              </div>
            )}

            {/* Informations importantes sur le processus */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">ℹ️ Informations importantes</h4>
              <div className="text-xs text-blue-800 space-y-1.5">
                <p>• Votre don est <strong>ajouté immédiatement</strong>.</p>
                <p>• Le total de la campagne est mis à jour en <strong>temps réel</strong>.</p>
                <p>• Des <strong>frais de plateforme de {platformFees.percentage}%</strong> sont appliqués.</p>
                <p>• Vous recevrez une confirmation par email.</p>
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center mt-6">
              <ResponsiveReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token: string | null) => setCaptchaToken(token)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDonation}
                disabled={!donationAmount || isInactive || isSubmitting || !captchaToken}
                className={`flex-1 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isInactive ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {isSubmitting ? 'Traitement...' : 'Continuer'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Popup de remerciement */}
      {showThankYouPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 text-center shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
            {/* Bouton de fermeture */}
            <button
              onClick={() => setShowThankYouPopup(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
            
            {/* Icône de succès animée */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-pulse">
              <FiHeart className="h-10 w-10 text-green-600" />
            </div>
            
            {/* Titre */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Don effectué avec succès ! 🎉
            </h3>
            
            {/* Sous-titre */}
            <p className="text-gray-600 mb-6">
              Merci pour votre générosité envers cette campagne
            </p>
            
            {/* Message personnalisé de la campagne */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <FiHeart className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Message de l'organisateur :</h4>
                  <p className="text-gray-700 leading-relaxed text-left">
                    {thankYouMessage || 'Merci pour votre don ! Votre contribution a été enregistrée avec succès. 🙏'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Informations supplémentaires */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Prochaines étapes :</p>
                <ul className="text-left space-y-1">
                  <li>• Votre don est actuellement <strong>en attente de validation</strong></li>
                  <li>• L'administrateur va vérifier et valider votre don</li>
                  <li>• Une fois validé, le montant sera ajouté au total de la campagne</li>
                  
                </ul>
                <div className="mt-3 pt-2 border-t border-blue-300">
                  <p className="text-xs text-blue-700">
                    <strong>Note :</strong> Des frais de plateforme ({platformFees.percentage}%) sont appliqués pour couvrir les coûts de fonctionnement.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowThankYouPopup(false)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Parfait !
              </button>
              <button
                onClick={() => {
                  setShowThankYouPopup(false);
                  // Optionnel : rediriger vers d'autres campagnes
                  router.push('/campaigns');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Voir d'autres campagnes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        campaignTitle={campaign.title}
        campaignId={campaign.id}
      />
    </div>
  );
}
