'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiShield } from 'react-icons/fi';
import Link from 'next/link';
import { setStoredUser } from '@/lib/auth-client';
import { AuthApi } from '@/lib/api';

type Tab = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
}

export default function AuthModal({ open, onClose, initialTab = 'login' }: AuthModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'demandeur',
    acceptTerms: false,
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!open) return null;

  const close = () => {
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await AuthApi.login({ email: form.email, password: form.password });
      const token = (res as any).token;
      const user = (res as any).user || {};
      
      // Bloquer les administrateurs - ils doivent utiliser /admin/login
      if (user.role === 'admin') {
        setError('admin_redirect');
        setIsLoading(false);
        return;
      }
      
      setStoredUser({ ...user, token });
      router.push('/dashboard');
      close();
    } catch (err: any) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!form.firstName || !form.lastName || !form.email || form.password.length < 6 || form.password !== form.confirmPassword || !form.acceptTerms) {
      setError('Veuillez vérifier les champs obligatoires');
      setIsLoading(false);
      return;
    }
    try {
      const res = await AuthApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role as any,
        phone: form.phone || undefined,
      });
      const token = (res as any).token;
      const user = (res as any).user || {};
      setStoredUser({ ...user, token });
      router.push('/dashboard');
      close();
    } catch (err: any) {
      setError("Impossible de créer le compte. L'email existe peut-être déjà.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'login' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('login')}
              >
                Connexion
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'register' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('register')}
              >
                Inscription
              </button>
            </div>
            <button onClick={close} className="p-2 rounded hover:bg-gray-100">
              <FiX />
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="px-6 py-6 space-y-4">
              {error && (
                <div className={`border rounded-lg p-3 text-sm ${
                  error === 'admin_redirect' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {error === 'admin_redirect' ? (
                    <div className="flex items-start space-x-2">
                      <FiShield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Accès administrateur</p>
                        <p className="mb-2">Les administrateurs doivent utiliser la page de connexion dédiée.</p>
                        <Link 
                          href="/admin-login"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          onClick={close}
                        >
                          <FiShield className="w-4 h-4 mr-1" />
                          Connexion administrateur
                        </Link>
                      </div>
                    </div>
                  ) : (
                    error
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="vous@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Votre mot de passe" />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
              
              {/* Lien vers connexion admin */}
              <div className="text-center pt-4 border-t border-gray-200">
                {/* <p className="text-xs text-gray-500 mb-2">Vous êtes administrateur ?</p>
                <Link 
                  href="/admin-login"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
                  onClick={close}
                >
                  <FiShield className="w-4 h-4 mr-1" />
                  Connexion administrateur
                </Link> */}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="px-6 py-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" required value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Prénom" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input type="text" required value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Nom" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="vous@email.com" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <input type="password" required value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Minimum 6 caractères" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                  <input type="password" required value={form.confirmPassword} onChange={(e)=>setForm({...form, confirmPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Répétez le mot de passe" />
                </div>
              </div>
              <div className="flex items-center">
                <input type="checkbox" checked={form.acceptTerms} onChange={(e)=>setForm({...form, acceptTerms: e.target.checked})} className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" />
                <span className="ml-2 text-sm text-gray-600">J'accepte les conditions d'utilisation</span>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                {isLoading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


