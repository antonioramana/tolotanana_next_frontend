'use client';

import { useEffect, useState, useRef } from 'react';
import { getStoredToken } from '@/lib/auth-client';
import { AuthApi } from '@/lib/api';

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
  const initialLoadDone = useRef(false);

  // Charger les notifications existantes depuis la DB au montage
  useEffect(() => {
    if (initialLoadDone.current) return;
    const token = getStoredToken();
    if (!token) return;

    initialLoadDone.current = true;
    AuthApi.getNotifications()
      .then((data: { notifications: Notification[]; unreadCount: number }) => {
        if (data?.notifications?.length) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, []);

  // Connexion WebSocket
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = getStoredToken();
    if (!token) return;

    import('socket.io-client/dist/socket.io.js').then((mod: any) => {
      const io = mod.io || mod.default?.io || mod.default || mod;

      // Calculer l'URL du socket — enlever /api s'il est présent
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
      let socketUrl: string;

      if (window.location.hostname !== 'localhost') {
        socketUrl = window.location.origin;
      } else {
        socketUrl = apiBase.replace(/\/api\/?$/, '');
      }

      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        path: '/socket.io/',
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err: any) => {
        console.error('Erreur connexion WebSocket:', err.message);
      });

      // Écouter les nouvelles notifications temps réel
      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => {
          const exists = prev.some(n => n.id === notification.id);
          if (exists) return prev;
          return [notification, ...prev];
        });

        // Notification navigateur
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          });
        }
      });
    }).catch((error) => {
      console.error('Erreur chargement socket.io-client:', error);
    });

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
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
