'use client';

import { useState, useEffect } from 'react';
import { CampaignThankYouMessagesApi } from '@/lib/api';

export default function TestThankYouPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState('');

  const testGetActive = async () => {
    if (!campaignId.trim()) {
      setError('Veuillez saisir un ID de campagne');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Test de l\'API getActive pour la campagne:', campaignId);
      const message = await CampaignThankYouMessagesApi.getActive(campaignId);
      console.log('Résultat de l\'API:', message);
      setResult(message);
    } catch (err: any) {
      console.error('Erreur lors du test:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test - Messages de remerciement
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test de l'API getActive</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de la campagne
              </label>
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: clp123abc456def"
              />
            </div>

            <button
              onClick={testGetActive}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Tester l\'API'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold">Erreur :</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold">Résultat :</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <h3 className="font-bold">Instructions :</h3>
          <ul className="mt-2 text-sm list-disc list-inside">
            <li>Ouvrez la console du navigateur (F12) pour voir les logs détaillés</li>
            <li>Utilisez un ID de campagne existant</li>
            <li>Vérifiez que le serveur backend est démarré sur le port 3000</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
