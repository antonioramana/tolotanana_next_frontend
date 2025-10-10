'use client';

import { useState } from 'react';
import { AuthApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function TestNotificationsPage() {
  const { notifications, unreadCount, addNotification, isConnected } = useSocket();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendTestNotification = async () => {
    setIsLoading(true);
    try {
      const response = await AuthApi.sendTestNotification();
      console.log('Notification de test envoyée:', response);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocalNotification = () => {
    addNotification({
      id: Date.now().toString(),
      userId: 'test-user',
      title: 'Notification locale',
      message: 'Ceci est une notification ajoutée localement pour tester l\'affichage',
      type: 'info',
      read: false,
      createdAt: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Test du système de notifications
          </h1>

          {/* Statut de connexion */}
          <div className="mb-8 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Statut de connexion</h2>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                WebSocket: {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
              <span className="text-sm text-gray-500">
                Notifications: {notifications.length} | Non lues: {unreadCount}
              </span>
            </div>
          </div>

          {/* Composant de notification */}
          <div className="mb-8 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Composant de notification</h2>
            <div className="flex justify-center">
              <NotificationBell />
            </div>
          </div>

          {/* Actions de test */}
          <div className="mb-8 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Actions de test</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSendTestNotification}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isLoading ? 'Envoi...' : 'Envoyer notification serveur'}
              </button>
              
              <button
                onClick={handleAddLocalNotification}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Ajouter notification locale
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Notifications actuelles</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune notification</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          notification.type === 'success' ? 'bg-green-100 text-green-800' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          notification.type === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions de test :</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Vérifiez que le WebSocket est connecté (point vert)</li>
              <li>2. Cliquez sur "Envoyer notification serveur" pour tester l'API</li>
              <li>3. Cliquez sur "Ajouter notification locale" pour tester l'affichage</li>
              <li>4. Cliquez sur l'icône de cloche pour voir le dropdown</li>
              <li>5. Testez le marquage des notifications comme lues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



