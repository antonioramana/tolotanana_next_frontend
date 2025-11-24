'use client';

import { useEffect, useState } from 'react';
import { getStoredUser } from '@/lib/auth-client';
import { api } from '@/lib/api';

export default function DebugAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenPayload, setTokenPayload] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    
    if (storedUser?.token) {
      setToken(storedUser.token);
      
      // Parser le token JWT
      try {
        const base64Url = storedUser.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        setTokenPayload(payload);
      } catch (error) {
        console.error('Erreur parsing token:', error);
      }
    }
  }, []);

  const testApiCall = async () => {
    setLoading(true);
    try {
      const response = await api('/campaigns?page=1&limit=5') as any;
      setApiTest({ success: true, data: response });
    } catch (error: any) {
      setApiTest({ 
        success: false, 
        error: error.message,
        status: error.status || 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  const testUserMe = async () => {
    setLoading(true);
    try {
      const response = await api('/users/me') as any;
      setApiTest({ success: true, data: response, endpoint: '/users/me' });
    } catch (error: any) {
      setApiTest({ 
        success: false, 
        error: error.message,
        status: error.status || 'Unknown',
        endpoint: '/users/me'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    setTokenPayload(null);
    setApiTest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Authentification</h1>
        
        {/* Informations utilisateur */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations utilisateur</h2>
          <div className="space-y-2">
            <div>
              <strong>Utilisateur connecté:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user ? 'Oui' : 'Non'}
              </span>
            </div>
            {user && (
              <>
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Rôle:</strong> {user.role}</div>
                <div><strong>Nom:</strong> {user.firstName} {user.lastName}</div>
              </>
            )}
          </div>
        </div>

        {/* Informations token */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations token JWT</h2>
          <div className="space-y-2">
            <div>
              <strong>Token présent:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {token ? 'Oui' : 'Non'}
              </span>
            </div>
            {token && (
              <>
                <div><strong>Longueur token:</strong> {token.length} caractères</div>
                <div><strong>Format:</strong> {token.split('.').length === 3 ? 'Valide' : 'Invalide'}</div>
                {tokenPayload && (
                  <>
                    <div><strong>Subject (ID):</strong> {tokenPayload.sub}</div>
                    <div><strong>Expiration:</strong> {new Date(tokenPayload.exp * 1000).toLocaleString()}</div>
                    <div><strong>Expiré:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        tokenPayload.exp * 1000 > Date.now() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tokenPayload.exp * 1000 > Date.now() ? 'Non' : 'Oui'}
                      </span>
                    </div>
                    <div><strong>Issued at:</strong> {new Date(tokenPayload.iat * 1000).toLocaleString()}</div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Test API */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={testApiCall}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Test...' : 'Test /campaigns'}
              </button>
              <button
                onClick={testUserMe}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Test...' : 'Test /users/me'}
              </button>
              <button
                onClick={clearAuth}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Effacer auth
              </button>
            </div>
            
            {apiTest && (
              <div className={`p-4 rounded ${
                apiTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  {apiTest.success ? '✅ Succès' : '❌ Erreur'} - {apiTest.endpoint || '/campaigns'}
                </h3>
                {apiTest.success ? (
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(apiTest.data, null, 2)}
                  </pre>
                ) : (
                  <div>
                    <p><strong>Message:</strong> {apiTest.error}</p>
                    <p><strong>Status:</strong> {apiTest.status}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Instructions de diagnostic</h3>
          <ol className="text-yellow-800 text-sm space-y-1">
            <li>1. Vérifiez que l'utilisateur est bien connecté</li>
            <li>2. Vérifiez que le token JWT est présent et valide</li>
            <li>3. Vérifiez que le token n'est pas expiré</li>
            <li>4. Testez les appels API pour identifier le problème</li>
            <li>5. Si nécessaire, effacez l'auth et reconnectez-vous</li>
          </ol>
        </div>
      </div>
    </div>
  );
}







