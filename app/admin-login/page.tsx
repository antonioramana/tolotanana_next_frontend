'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthApi } from '@/lib/api';
import { setStoredUser } from '@/lib/auth-client';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthApi.login(formData);
      const token = (response as any).token;
      const user = (response as any).user || {};
      
      console.log('Réponse de connexion admin:', response);
      console.log('Token:', token);
      console.log('User:', user);
      
      // Vérifier que l'utilisateur est bien un admin
      if (user.role !== 'admin') {
        toast({
          title: 'Accès refusé',
          description: 'Cette page est réservée aux administrateurs uniquement.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Sauvegarder les données utilisateur avec la même méthode que le modal
      setStoredUser({ ...user, token });
      
      console.log('Données sauvegardées:', { ...user, token });
      
      // Vider les champs du formulaire après connexion réussie
      setFormData({
        email: '',
        password: '',
      });
      
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue dans l\'espace administrateur !',
      });

      // Rediriger vers le dashboard admin
      router.push('/admin');
      
    } catch (error: any) {
      console.error('Erreur de connexion admin:', error);
      let errorMessage = 'Erreur de connexion. Vérifiez vos identifiants.';
      
      try {
        const parsed = JSON.parse(error.message);
        errorMessage = Array.isArray(parsed?.message) 
          ? parsed.message.join(', ') 
          : (parsed?.message || errorMessage);
      } catch {}
      
      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Lien de retour */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FiShield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Espace Administrateur
            </h1>
            <p className="text-gray-600">
              Connexion réservée aux administrateurs
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="admin@tolotanana.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Avertissement de sécurité */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <FiShield className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Zone sécurisée</p>
                <p>
                  Cette page est exclusivement réservée aux administrateurs de la plateforme. 
                  Toute tentative d'accès non autorisée sera enregistrée.
                </p>
              </div>
            </div>
          </div>


          {/* Lien vers connexion normale */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'êtes pas administrateur ?{' '}
              <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
                Connexion utilisateur
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 TOLOTANANA - Espace Administrateur
          </p>
        </div>
      </div>
    </div>
  );
}
