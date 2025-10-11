'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiCheck } from 'react-icons/fi';
import { setStoredUser } from '@/lib/auth-client';
import { AuthApi } from '@/lib/api';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

export default function TestRegisterCaptchaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'demandeur' as 'demandeur'|'donateur'|'admin',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation des champs
    if (!form.firstName || !form.lastName || !form.email || form.password.length < 6 || form.password !== form.confirmPassword || !form.acceptTerms) {
      setError('Veuillez vérifier les champs obligatoires');
      setIsLoading(false);
      return;
    }

    // Validation du captcha
    if (!token) {
      setError('Veuillez compléter la vérification reCAPTCHA');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Test Register - Sending data:', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        phone: form.phone,
        tokenProvided: !!token,
        tokenLength: token?.length
      });

      const res = await AuthApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        token: token,
      });

      console.log('✅ Register successful:', res);
      
      const authToken = (res as any).token;
      const user = (res as any).user || {};
      setStoredUser({ ...user, token: authToken });

      setSuccess('Compte créé avec succès ! Redirection vers le dashboard...');
      
      // Réinitialiser le formulaire
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'demandeur',
        acceptTerms: false,
      });
      setToken(null);

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Register error:', err);
      setError(err.message || "Impossible de créer le compte. L'email existe peut-être déjà.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Test d'inscription avec Captcha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Testez le formulaire d'inscription avec vérification reCAPTCHA
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 mb-4">
              <div className="flex items-center space-x-2">
                <FiCheck className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Succès !</p>
                  <p>{success}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required 
                    value={form.firstName} 
                    onChange={(e) => setForm({...form, firstName: e.target.value})} 
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    placeholder="Prénom" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input 
                  type="text" 
                  required 
                  value={form.lastName} 
                  onChange={(e) => setForm({...form, lastName: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  placeholder="Nom" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  required 
                  value={form.email} 
                  onChange={(e) => setForm({...form, email: e.target.value})} 
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  placeholder="vous@email.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (optionnel)</label>
              <input 
                type="tel" 
                value={form.phone} 
                onChange={(e) => setForm({...form, phone: e.target.value})} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                placeholder="+261 34 12 345 67" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={form.password} 
                    onChange={(e) => setForm({...form, password: e.target.value})} 
                    className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    placeholder="Minimum 6 caractères" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    placeholder="Répétez le mot de passe" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <select 
                value={form.role} 
                onChange={(e) => setForm({...form, role: e.target.value as any})} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="demandeur">Demandeur</option>
                <option value="donateur">Donateur</option>
              </select>
            </div>

            <div className="flex items-center">
              <input 
                type="checkbox" 
                checked={form.acceptTerms} 
                onChange={(e) => setForm({...form, acceptTerms: e.target.checked})} 
                className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50" 
              />
              <span className="ml-2 text-sm text-gray-600">J'accepte les conditions d'utilisation</span>
            </div>

            {/* Captcha */}
            <div className="flex justify-center">
              <ResponsiveReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token: string | null) => {
                  console.log('🔍 Captcha token received:', !!token, token?.length);
                  setToken(token);
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !token} 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>

        {/* Debug info */}
        <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <div>Captcha token: {token ? `✅ ${token.length} chars` : '❌ Not provided'}</div>
          <div>Site key: {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? '✅ Set' : '❌ Not set'}</div>
          <div>Form valid: {form.firstName && form.lastName && form.email && form.password.length >= 6 && form.password === form.confirmPassword && form.acceptTerms ? '✅ Yes' : '❌ No'}</div>
        </div>
      </div>
    </div>
  );
}
