'use client';

import { useEffect, useState } from 'react';

export default function TestSocketConnection() {
  const [status, setStatus] = useState('Chargement...');

  useEffect(() => {
    // Test simple pour vérifier que socket.io-client peut être importé
    import('socket.io-client').then(({ io }) => {
      setStatus('✅ socket.io-client importé avec succès');
      
      // Test de création d'une connexion (sans se connecter réellement)
      try {
        const testSocket = io('http://localhost:4750', {
          autoConnect: false, // Ne pas se connecter automatiquement
        });
        setStatus('✅ Connexion Socket.IO créée avec succès');
        testSocket.disconnect();
      } catch (error) {
        setStatus(`❌ Erreur lors de la création de la connexion: ${error}`);
      }
    }).catch((error) => {
      setStatus(`❌ Erreur lors de l'import: ${error}`);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Test Socket.IO
        </h1>
        <div className="text-center">
          <p className="text-lg">{status}</p>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Instructions :</strong></p>
          <ul className="list-disc list-inside mt-2">
            <li>Si vous voyez ✅, Socket.IO fonctionne correctement</li>
            <li>Si vous voyez ❌, il y a un problème avec l'installation</li>
            <li>Assurez-vous que le backend est démarré sur le port 4750</li>
          </ul>
        </div>
      </div>
    </div>
  );
}












