'use client';

import { useEffect, useState } from 'react';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

export default function DebugCaptchaPage() {
  const [token, setToken] = useState<string | null>(null);
  const [envVar, setEnvVar] = useState<string>('');

  useEffect(() => {
    setEnvVar(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'NON_DEFINI');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Captcha</h1>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Variables d'environnement</h2>
          <div className="space-y-2">
            <div>
              <strong>NEXT_PUBLIC_RECAPTCHA_SITE_KEY:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                envVar && envVar !== 'NON_DEFINI' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {envVar && envVar !== 'NON_DEFINI' ? `${envVar.substring(0, 10)}...` : 'NON_DEFINI'}
              </span>
            </div>
            <div>
              <strong>Token captcha:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {token ? `${token.substring(0, 20)}...` : 'NON_DEFINI'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Composant ResponsiveReCAPTCHA</h2>
          <ResponsiveReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token: string | null) => {
              console.log('🔍 Token captcha reçu:', token);
              setToken(token);
            }}
          />
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Test de soumission</h2>
          <button 
            disabled={!token}
            className={`px-4 py-2 rounded-lg font-medium ${
              token 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => {
              if (token) {
                alert('Token captcha valide ! Soumission autorisée.');
              } else {
                alert('Token captcha manquant ! Soumission bloquée.');
              }
            }}
          >
            {token ? 'Soumettre (Token valide)' : 'Soumettre (Token manquant)'}
          </button>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>État du bouton:</strong> {token ? '✅ Actif' : '❌ Désactivé'}</p>
            <p><strong>Raison:</strong> {token ? 'Token captcha présent' : 'Token captcha manquant'}</p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions de test</h3>
          <ol className="text-blue-800 text-sm space-y-1">
            <li>1. Vérifiez que la clé reCAPTCHA est définie</li>
            <li>2. Complétez le captcha ci-dessus</li>
            <li>3. Vérifiez que le token est généré</li>
            <li>4. Testez le bouton de soumission</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
