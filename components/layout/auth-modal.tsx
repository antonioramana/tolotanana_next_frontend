'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiShield, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { setStoredUser } from '@/lib/auth-client';
import { AuthApi } from '@/lib/api';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

type Tab = 'login' | 'register' | 'forgot-password' | 'reset-password';

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
  const [captchaKey, setCaptchaKey] = useState(0);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    role: 'demandeur',
    acceptTerms: false,
  });

  useEffect(() => {
    setActiveTab(initialTab);
    // Restaurer les données de formulaire sauvegardées
    const savedFormData = localStorage.getItem('auth_form_data');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setForm(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Erreur lors de la restauration des données de formulaire:', error);
      }
    }
  }, [initialTab]);

  // Sauvegarder les données de formulaire à chaque changement
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('auth_form_data', JSON.stringify(form));
    }, 500); // Délai pour éviter trop de sauvegardes
    return () => clearTimeout(timeoutId);
  }, [form]);

  if (!open) return null;

  const close = () => {
    onClose();
    // Réinitialiser les états
    setResetSuccess(false);
    setError('');
    setForgotPasswordEmail('');
    // Vider les champs du formulaire
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
      role: 'demandeur',
      acceptTerms: false,
    });
    // Supprimer les données sauvegardées
    localStorage.removeItem('auth_form_data');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Veuillez cocher la case reCAPTCHA pour confirmer que vous n'êtes pas un robot.");
      // Forcer un nouveau rendu du reCAPTCHA
      setCaptchaKey((k) => k + 1);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Utiliser la nouvelle API avec protection reCAPTCHA
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          token: token
        }),
      });

      // Tenter de lire la réponse JSON (même en cas d'erreur HTTP)
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // Pas de corps JSON, on reste avec null
      }

      if (!response.ok) {
        const backendMessage: string = data?.message || '';
        let userMessage = 'Impossible de vous connecter pour le moment. Veuillez réessayer.';

        if (response.status === 400) {
          // Erreurs de saisie ou de reCAPTCHA
          if (backendMessage.includes('Email et mot de passe requis')) {
            userMessage = 'Veuillez saisir votre email et votre mot de passe.';
          } else if (
            backendMessage.includes('Vérification reCAPTCHA requise') ||
            backendMessage.toLowerCase().includes('recaptcha')
          ) {
            userMessage = "La vérification reCAPTCHA a échoué. Veuillez cocher à nouveau la case reCAPTCHA.";
            // Réinitialiser le token côté état et re-render le widget
            setToken(null);
            setCaptchaKey((k) => k + 1);
          } else {
            userMessage = 'Certains champs sont invalides. Vérifiez vos informations et réessayez.';
          }
        } else if (response.status === 401) {
          // Identifiants invalides
          userMessage = 'Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.';
        } else if (response.status === 403) {
          userMessage = "Vous n'avez pas l'autorisation de vous connecter avec ces identifiants.";
        } else if (response.status === 429) {
          userMessage =
            'Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.';
        } else if (response.status >= 500) {
          userMessage =
            'Un problème technique est survenu sur le serveur. Réessayez dans quelques instants.';
        }

        setError(userMessage);
        setIsLoading(false);
        return;
      }

      const res = data;
      const authToken = (res as any).token;
      const user = (res as any).user || {};
      
      // Bloquer les administrateurs - ils doivent utiliser /admin/login
      if (user.role === 'admin') {
        setError('admin_redirect');
        setIsLoading(false);
        return;
      }
      
      setStoredUser({ ...user, token: authToken });
      // Vider les champs avant la redirection
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
        role: 'demandeur',
        acceptTerms: false,
      });
      // Supprimer les données sauvegardées
      localStorage.removeItem('auth_form_data');
      router.push('/dashboard');
      close();
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validation
    if (!form.verificationCode.trim() || form.verificationCode.length !== 6) {
      setError('Le code de vérification doit contenir exactement 6 chiffres');
      setIsLoading(false);
      return;
    }
    
    if (!form.password.trim() || form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setIsLoading(false);
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }
    
    try {
      await AuthApi.resetPassword({
        email: forgotPasswordEmail,
        verificationCode: form.verificationCode,
        password: form.password,
      });
      
      // Réinitialiser le formulaire
      setForm(prev => ({ ...prev, verificationCode: '', password: '', confirmPassword: '' }));
      setError('');
      
      // Passer à l'onglet de connexion et afficher un message de succès
      setActiveTab('login');
      setResetSuccess(true);
      setError(''); // Effacer les erreurs
      
      // Effacer le message de succès après 5 secondes
      setTimeout(() => {
        setResetSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error('Erreur réinitialisation mot de passe:', err);
      
      let errorMessage = 'Impossible de réinitialiser le mot de passe';
      
      if (err.message) {
        if (err.message.includes('Code de vérification incorrect')) {
          errorMessage = 'Le code de vérification est incorrect';
        } else if (err.message.includes('Code de vérification expiré')) {
          errorMessage = 'Le code de vérification a expiré. Demandez un nouveau code.';
        } else if (err.message.includes('Aucun code de vérification trouvé')) {
          errorMessage = 'Aucun code de vérification trouvé. Demandez un nouveau code.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
    if (!token) {
      setError('Veuillez compléter la vérification reCAPTCHA');
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
        token: token,
      });
      const authToken = (res as any).token;
      const user = (res as any).user || {};
      setStoredUser({ ...user, token: authToken });
      // Vider les champs avant la redirection
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
        role: 'demandeur',
        acceptTerms: false,
      });
      // Supprimer les données sauvegardées
      localStorage.removeItem('auth_form_data');
      setToken(null); // Réinitialiser le token captcha
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
              {activeTab === 'forgot-password' && (
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-700"
                >
                  Mot de passe oublié
                </button>
              )}
              {activeTab === 'reset-password' && (
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-700"
                >
                  Nouveau mot de passe
                </button>
              )}
            </div>
            <button onClick={close} className="p-2 rounded hover:bg-gray-100">
              <FiX />
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="px-6 py-6 space-y-4">
              {resetSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Mot de passe réinitialisé !</p>
                      <p>Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.</p>
                    </div>
                  </div>
                </div>
              )}
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
                <div className="relative mb-4">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Votre mot de passe" />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <ResponsiveReCAPTCHA
                    key={captchaKey}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={(token: string | null) => setToken(token)}
                  />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
              
              {/* Lien mot de passe oublié */}
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setActiveTab('forgot-password')}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              
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
          ) : activeTab === 'forgot-password' ? (
            <div className="px-6 py-6">
              <ForgotPasswordForm 
                onBack={() => setActiveTab('login')}
                onSuccess={(email, code) => {
                  setForgotPasswordEmail(email);
                  setActiveTab('reset-password');
                }}
              />
            </div>
          ) : activeTab === 'reset-password' ? (
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nouveau mot de passe
                  </h3>
                  <p className="text-sm text-gray-600">
                    Entrez votre nouveau mot de passe pour {forgotPasswordEmail}
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code de vérification</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        required 
                        value={form.verificationCode} 
                        onChange={(e) => setForm({...form, verificationCode: e.target.value})} 
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                        placeholder="Entrez le code à 6 chiffres"
                        maxLength={6}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={form.password} 
                        onChange={(e) => setForm({...form, password: e.target.value})} 
                        className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                        placeholder="Minimum 8 caractères"
                        disabled={isLoading}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={form.confirmPassword} 
                        onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
                        className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                        placeholder="Répétez le mot de passe"
                        disabled={isLoading}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading || !form.verificationCode.trim() || !form.password.trim() || !form.confirmPassword.trim()} 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setActiveTab('forgot-password')}
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                      disabled={isLoading}
                    >
                      ← Retour à la demande
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
              <div className="flex items-start">
                <input 
                  type="checkbox" 
                  checked={form.acceptTerms} 
                  onChange={(e)=>setForm({...form, acceptTerms: e.target.checked})} 
                  className="mt-0.5 rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" 
                  required
                />
                <span className="ml-2 text-sm text-gray-600">
                  J'accepte les{' '}
                  <Link 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    conditions d'utilisation
                  </Link>
                </span>
              </div>
              
              {/* Captcha pour l'inscription */}
              <div className="flex justify-center">
                <ResponsiveReCAPTCHA
                  key={captchaKey}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onChange={(token: string | null) => setToken(token)}
                />
              </div>
              
              <button type="submit" disabled={isLoading || !token} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                {isLoading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


