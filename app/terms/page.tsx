'use client';

import { useState, useEffect } from 'react';
import { FiFileText, FiCalendar, FiTag, FiLoader } from 'react-icons/fi';
import { TermsOfServiceApi } from '@/lib/api';

interface TermsOfService {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TermsPage() {
  const [terms, setTerms] = useState<TermsOfService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveTerms();
  }, []);

  const loadActiveTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TermsOfServiceApi.getActive();
      setTerms(data);
    } catch (err) {
      console.error('Erreur lors du chargement des conditions d\'utilisation:', err);
      setError('Impossible de charger les conditions d\'utilisation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des conditions d'utilisation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Conditions d'utilisation</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadActiveTerms}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!terms) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Conditions d'utilisation</h1>
          <p className="text-gray-600">Aucune politique d'utilisation disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <FiFileText className="w-8 h-8 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">{terms.title}</h1>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <FiTag className="w-4 h-4 mr-2" />
              Version {terms.version}
            </div>
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              Dernière mise à jour : {formatDate(terms.updatedAt)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {terms.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Ces conditions d'utilisation sont effectives depuis le {formatDate(terms.createdAt)}.
          </p>
          <p className="mt-2">
            Pour toute question concernant ces conditions, veuillez nous contacter.
          </p>
        </div>
      </div>
    </div>
  );
}


