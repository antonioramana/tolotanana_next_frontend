'use client';

import { useState } from 'react';
import { FiHeart, FiX } from 'react-icons/fi';

export default function PopupTest() {
  const [showPopup, setShowPopup] = useState(false);
  const [testMessage, setTestMessage] = useState('Ceci est un message de test pour vérifier que le popup fonctionne correctement ! 🎉');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Test du Popup de Remerciement</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message de test
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <button
            onClick={() => {
              console.log('🧪 Test: Affichage du popup');
              console.log('Message:', testMessage);
              setShowPopup(true);
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Afficher le Popup
          </button>
          
          <div className="text-sm text-gray-600">
            <p><strong>État du popup:</strong> {showPopup ? '✅ Affiché' : '❌ Masqué'}</p>
            <p><strong>Z-index:</strong> 60</p>
            <p><strong>Position:</strong> Fixed</p>
          </div>
        </div>
      </div>

      {/* Popup de test - Copie exacte du popup principal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-8 text-center shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
            {/* Bouton de fermeture */}
            <button
              onClick={() => {
                console.log('🔄 Fermeture du popup');
                setShowPopup(false);
              }}
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
              Test du Popup Réussi ! 🎉
            </h3>
            
            {/* Sous-titre */}
            <p className="text-gray-600 mb-6">
              Le popup s'affiche correctement
            </p>
            
            {/* Message de test */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <FiHeart className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Message de test :</h4>
                  <p className="text-gray-700 leading-relaxed text-left">
                    {testMessage}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Informations de débogage */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Informations de débogage :</p>
                <ul className="text-left space-y-1">
                  <li>• Popup affiché avec succès</li>
                  <li>• Z-index: 60 (au-dessus des autres éléments)</li>
                  <li>• Animation: fade-in + zoom-in</li>
                  <li>• Responsive: max-width sur mobile</li>
                </ul>
              </div>
            </div>
            
            {/* Bouton d'action */}
            <button
              onClick={() => {
                console.log('✅ Test terminé avec succès');
                setShowPopup(false);
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Réussi !
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
