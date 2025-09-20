'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentMethods } from '@/lib/fake-data';
import { FiCreditCard, FiSmartphone, FiShield, FiLock, FiCheck } from 'react-icons/fi';
import { getStoredUser } from '@/lib/auth-client';

export default function PaymentPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);
  const [selectedMethod, setSelectedMethod] = useState('Orange Money');
  const [paymentData, setPaymentData] = useState({
    amount: '50000',
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    const payment = {
      method: selectedMethod,
      ...paymentData,
      amount: parseInt(paymentData.amount),
      timestamp: new Date().toISOString(),
    };
    
    console.log('Traitement du paiement:', payment);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      router.push('/payment/success');
    }, 3000);
  };

  const formatAmount = (amount: string) => {
    const num = parseInt(amount) || 0;
    return num.toLocaleString('fr-FR') + ' Ar';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finaliser votre don</h1>
          <p className="text-gray-600">Choisissez votre méthode de paiement préférée</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Méthodes de paiement</h2>
              
              <div className="space-y-4">
                {/* Mobile Money Options */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiSmartphone className="w-5 h-5 mr-2 text-orange-600" />
                    Mobile Money
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Orange Money', 'Mvola', 'Airtel Money'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setSelectedMethod(method)}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          selectedMethod === method
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{method}</div>
                        <div className="text-sm text-gray-500 mt-1">Mobile</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Payment */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiCreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Carte bancaire
                  </h3>
                  <button
                    onClick={() => setSelectedMethod('Carte bancaire')}
                    className={`w-full p-4 border-2 rounded-lg text-center transition-all ${
                      selectedMethod === 'Carte bancaire'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Carte Visa/Mastercard</div>
                    <div className="text-sm text-gray-500 mt-1">Paiement sécurisé</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informations de paiement - {selectedMethod}
              </h2>

              {selectedMethod.includes('Money') || selectedMethod === 'Airtel Money' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={paymentData.phoneNumber}
                      onChange={(e) => setPaymentData({...paymentData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+261 34 12 345 67"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FiShield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-800">Instructions de paiement</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Vous recevrez un SMS avec les instructions pour finaliser le paiement via {selectedMethod}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom sur la carte
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <FiLock className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800">Paiement sécurisé</h4>
                    <p className="text-sm text-green-700">
                      Vos informations sont protégées par un cryptage SSL 256 bits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Don</span>
                  <span className="font-medium">{formatAmount(paymentData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de traitement</span>
                  <span className="font-medium">0 Ar</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-orange-600 text-lg">
                      {formatAmount(paymentData.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Campagne</h4>
                <p className="text-sm text-gray-600">Aide pour les frais médicaux de ma fille</p>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Traitement...
                  </div>
                ) : (
                  `Confirmer le don de ${formatAmount(paymentData.amount)}`
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                En confirmant, vous acceptez nos conditions d'utilisation
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <FiCheck className="w-4 h-4 text-green-600 mr-3" />
                  <span className="text-gray-700">Cryptage SSL 256 bits</span>
                </div>
                <div className="flex items-center text-sm">
                  <FiCheck className="w-4 h-4 text-green-600 mr-3" />
                  <span className="text-gray-700">Données non stockées</span>
                </div>
                <div className="flex items-center text-sm">
                  <FiCheck className="w-4 h-4 text-green-600 mr-3" />
                  <span className="text-gray-700">Conformité PCI DSS</span>
                </div>
                <div className="flex items-center text-sm">
                  <FiCheck className="w-4 h-4 text-green-600 mr-3" />
                  <span className="text-gray-700">Protection anti-fraude</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}