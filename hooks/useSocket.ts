'use client';

import { useEffect, useState, useRef } from 'react';
import { getStoredToken } from '@/lib/auth-client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  data?: any;
}

interface UseSocketReturn {
  socket: any | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<any | null>(null);

  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }

    const token = getStoredToken();
    
    if (!token) {
      return;
    }

    // Import dynamique de socket.io-client pour éviter les erreurs SSR et forcer le build navigateur
    import('socket.io-client/dist/socket.io.js').then((mod: any) => {
      const io = mod.io || mod.default?.io || mod.default || mod;
      // Créer la connexion Socket.IO
      const newSocket = io(process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750', {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Événements de connexion
      newSocket.on('connect', () => {
        console.log('Connecté aux notifications en temps réel');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Déconnecté des notifications');
        setIsConnected(false);
      });

      newSocket.on('connected', (data: unknown) => {
        console.log('Connexion WebSocket établie:', data);
      });

      // Écouter les nouvelles notifications
      newSocket.on('notification', (notification: Notification) => {
        console.log('Nouvelle notification reçue:', notification);
        
        setNotifications(prev => {
          // Éviter les doublons
          const exists = prev.some(n => n.id === notification.id);
          if (exists) return prev;
          
          return [notification, ...prev];
        });

        // Afficher une notification toast si disponible
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            });
          }
        }
      });
    }).catch((error) => {
      console.error('Erreur lors du chargement de socket.io-client:', error);
    });

    // Nettoyage à la déconnexion
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );

    // Envoyer au serveur
    if (socket) {
      socket.emit('mark_notification_read', { notificationId });
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    socket,
    isConnected,
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
