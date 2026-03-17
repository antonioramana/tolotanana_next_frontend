'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setStoredUser } from '@/lib/auth-client';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');

    if (!data) {
      setError('Aucune donnée reçue de Google.');
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(data));
      const { user, token } = parsed;

      if (!user || !token) {
        setError('Données d\'authentification invalides.');
        return;
      }

      // Bloquer les admins
      if (user.role === 'admin') {
        setError('Les administrateurs ne peuvent pas se connecter via Google.');
        return;
      }

      // Stocker l'utilisateur et le token
      setStoredUser({ ...user, token });

      // Rediriger vers le dashboard
      router.replace('/dashboard');
    } catch {
      setError('Erreur lors du traitement de l\'authentification Google.');
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/?auth=login')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Connexion avec Google en cours...</p>
      </div>
    </div>
  );
}
