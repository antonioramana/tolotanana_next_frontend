// Utilitaire pour les appels API avec authentification
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (typeof window !== 'undefined') {
    try {
      const authUser = localStorage.getItem('auth_user');
      const token = authUser ? JSON.parse(authUser).token : null;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du token:', error);
    }
  }
  
  return headers;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>)
  };
  
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });
}

export async function fetchPublic(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };
  
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });
}
