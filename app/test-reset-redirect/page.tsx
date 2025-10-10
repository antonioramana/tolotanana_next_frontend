'use client';

import { useState } from 'react';
import AuthModal from '@/components/layout/auth-modal';

export default function TestResetRedirectPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Test - Redirection après réinitialisation
          </h1>
          
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-6">
              <p><strong>Test :</strong> Vérifier que après la réinitialisation du mot de passe, l'utilisateur est redirigé vers l'onglet "Connexion" avec un message de succès.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p><strong>Étapes du test :</strong></p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Cliquez sur "Commencer le test"</li>
                <li>Allez dans "Mot de passe oublié"</li>
                <li>Saisissez un email de test</li>
                <li>Continuez vers la réinitialisation</li>
                <li>Saisissez le code et nouveau mot de passe</li>
                <li><strong>Vérifiez :</strong> Retour automatique à "Connexion" avec message de succès</li>
              </ol>
            </div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Commencer le test
            </button>
            
            <div className="text-center text-sm text-gray-500">
              <p>✅ <strong>Résultat attendu :</strong> Après réinitialisation, retour à l'onglet "Connexion" avec message vert de succès.</p>
            </div>
          </div>
        </div>
        
        <AuthModal 
          open={isOpen} 
          onClose={() => setIsOpen(false)}
          initialTab="login"
        />
      </div>
    </div>
  );
}
