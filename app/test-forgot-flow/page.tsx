'use client';

import { useState } from 'react';
import AuthModal from '@/components/layout/auth-modal';

export default function TestForgotPasswordFlowPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Test - Flux Mot de passe oublié
          </h1>
          
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-6">
              <p>Testez le flux complet de réinitialisation de mot de passe :</p>
              <ol className="text-left mt-2 space-y-1">
                <li>1. Demande de réinitialisation</li>
                <li>2. Saisie du code de vérification</li>
                <li>3. Nouveau mot de passe</li>
              </ol>
            </div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Commencer le test
            </button>
            
            <div className="text-center text-sm text-gray-500">
              <p>💡 <strong>Note :</strong> En mode développement, le code de vérification sera affiché dans la console et dans l'interface.</p>
            </div>
          </div>
        </div>
        
        <AuthModal 
          open={isOpen} 
          onClose={() => setIsOpen(false)}
          initialTab="forgot-password"
        />
      </div>
    </div>
  );
}
