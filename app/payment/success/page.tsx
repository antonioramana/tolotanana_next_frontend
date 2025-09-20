'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiDownload, FiShare2, FiHeart, FiHome } from 'react-icons/fi';
import { getStoredUser } from '@/lib/auth-client';

export default function PaymentSuccessPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const transactionDetails = {
    id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    amount: 50000,
    campaign: 'Aide pour les frais médicaux de ma fille',
    method: 'Orange Money',
    date: new Date().toLocaleString('fr-FR'),
    reference: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' Ar';
  };

  const handleDownloadReceipt = () => {
    console.log('Téléchargement du reçu:', transactionDetails);
    alert('Le reçu sera téléchargé (fonctionnalité simulée)');
  };

  const handleShare = () => {
    console.log('Partage du don:', transactionDetails);
    alert('Partage sur les réseaux sociaux (fonctionnalité simulée)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <FiCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Don effectué avec succès !</h1>
          <p className="text-xl text-gray-600">
            Merci pour votre générosité. Votre contribution fait la différence.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails de la transaction</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Montant du don</span>
              <span className="font-semibold text-2xl text-green-600">
                {formatAmount(transactionDetails.amount)}
              </span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Campagne</span>
              <span className="font-medium text-gray-900 text-right max-w-xs">
                {transactionDetails.campaign}
              </span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Méthode de paiement</span>
              <span className="font-medium text-gray-900">{transactionDetails.method}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Date et heure</span>
              <span className="font-medium text-gray-900">{transactionDetails.date}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">ID de transaction</span>
              <span className="font-mono text-sm text-gray-900">{transactionDetails.id}</span>
            </div>
            
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Référence</span>
              <span className="font-mono text-sm text-gray-900">{transactionDetails.reference}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            <span>Télécharger le reçu</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FiShare2 className="w-5 h-5" />
            <span>Partager mon don</span>
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiHeart className="w-5 h-5 text-orange-600 mr-2" />
            Et maintenant ?
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>• Vous recevrez un email de confirmation dans quelques minutes</p>
            <p>• Le créateur de la campagne sera notifié de votre don</p>
            <p>• Vous pouvez suivre l'évolution de la campagne dans votre tableau de bord</p>
            <p>• Un reçu fiscal vous sera envoyé si applicable</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/campaigns"
            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FiHeart className="w-5 h-5" />
            <span>Découvrir d'autres campagnes</span>
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FiHome className="w-5 h-5" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-12 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Merci de faire partie de la communauté TOLOTANANA
          </h3>
          <p className="text-gray-600">
            Votre générosité aide à transformer des vies et à réaliser des rêves. 
            Ensemble, nous construisons un avenir meilleur pour Madagascar.
          </p>
        </div>
      </div>
    </div>
  );
}