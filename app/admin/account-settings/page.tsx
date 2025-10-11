'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiTrash2, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { useToast } from '@/hooks/use-toast';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

export default function AdminAccountSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'password' | 'delete'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  // États pour les formulaires
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmation: '',
  });
  
  // États pour reCAPTCHA
  const [emailCaptchaToken, setEmailCaptchaToken] = useState<string | null>(null);
  const [passwordCaptchaToken, setPasswordCaptchaToken] = useState<string | null>(null);
  const [deleteCaptchaToken, setDeleteCaptchaToken] = useState<string | null>(null);
  
  // États pour affichage des mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      if (!token) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750'}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil');
      }

      const data = await response.json();
      setProfile(data);
      setEmailForm(prev => ({ ...prev, newEmail: data.email || '' }));
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du chargement du profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailCaptchaToken) {
      toast({
        title: 'Vérification requise',
        description: 'Veuillez vérifier le reCAPTCHA avant de continuer.',
        variant: 'destructive',
      });
      return;
    }

    if (!emailForm.newEmail || !emailForm.currentPassword) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      const response = await fetch('/api/admin/account/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...emailForm,
          token: emailCaptchaToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement d\'email');
      }

      toast({
        title: 'Succès',
        description: 'Email modifié avec succès',
      });

      setEmailForm({
        newEmail: '',
        currentPassword: '',
      });
      setEmailCaptchaToken(null);
      await loadProfile();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du changement d\'email',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordCaptchaToken) {
      toast({
        title: 'Vérification requise',
        description: 'Veuillez vérifier le reCAPTCHA avant de continuer.',
        variant: 'destructive',
      });
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les nouveaux mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      const response = await fetch('/api/admin/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...passwordForm,
          token: passwordCaptchaToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de mot de passe');
      }

      toast({
        title: 'Succès',
        description: 'Mot de passe modifié avec succès',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordCaptchaToken(null);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du changement de mot de passe',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deleteCaptchaToken) {
      toast({
        title: 'Vérification requise',
        description: 'Veuillez vérifier le reCAPTCHA avant de continuer.',
        variant: 'destructive',
      });
      return;
    }

    if (!deleteForm.password || !deleteForm.confirmation) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive',
      });
      return;
    }

    if (deleteForm.confirmation !== 'SUPPRIMER') {
      toast({
        title: 'Erreur',
        description: 'Veuillez taper "SUPPRIMER" en majuscules pour confirmer.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte administrateur ? Cette action est irréversible !')) {
      return;
    }

    try {
      setSaving(true);
      
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      const response = await fetch('/api/admin/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...deleteForm,
          token: deleteCaptchaToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du compte');
      }

      toast({
        title: 'Compte supprimé',
        description: 'Votre compte administrateur a été supprimé avec succès',
      });

      // Rediriger vers la page de connexion
      localStorage.removeItem('auth_user');
      window.location.href = '/admin-login';
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la suppression du compte',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres du compte</h1>
          <p className="text-gray-200">Gérez vos informations personnelles et la sécurité de votre compte</p>
        </div>

        {/* Onglets */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Profil', icon: FiUser },
                { id: 'email', label: 'Email', icon: FiMail },
                { id: 'password', label: 'Mot de passe', icon: FiLock },
                { id: 'delete', label: 'Supprimer le compte', icon: FiTrash2 },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-10 h-10 text-gray-300" />
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                      <div className="text-sm text-gray-300">Prénom</div>
                      <div className="text-white font-medium">{profile?.firstName || '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Nom</div>
                      <div className="text-white font-medium">{profile?.lastName || '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Email</div>
                      <div className="text-white font-medium flex items-center">
                        <FiMail className="w-4 h-4 mr-2 text-gray-300" />
                        {profile?.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Rôle</div>
                      <div className="text-white font-medium">Administrateur</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Email */}
            {activeTab === 'email' && (
              <form onSubmit={handleChangeEmail} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Changer l'adresse email</h3>
                  <p className="text-sm text-gray-200 mb-6">
                    Entrez votre nouveau email et votre mot de passe actuel pour confirmer le changement.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Nouvel email
                  </label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="nouveau@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={emailForm.currentPassword}
                      onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-10 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Votre mot de passe actuel"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-200"
                    >
                      {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <ResponsiveReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={(token: string | null) => setEmailCaptchaToken(token)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Modification...' : 'Modifier l\'email'}
                </button>
              </form>
            )}

            {/* Onglet Mot de passe */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Changer le mot de passe</h3>
                  <p className="text-sm text-gray-200 mb-6">
                    Entrez votre mot de passe actuel et votre nouveau mot de passe.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-10 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Votre mot de passe actuel"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-200"
                    >
                      {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-10 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nouveau mot de passe (min. 8 caractères)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-200"
                    >
                      {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-10 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Confirmez le nouveau mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-200"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <ResponsiveReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={(token: string | null) => setPasswordCaptchaToken(token)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </form>
            )}

            {/* Onglet Suppression */}
            {activeTab === 'delete' && (
              <form onSubmit={handleDeleteAccount} className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Supprimer le compte administrateur</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePassword ? 'text' : 'password'}
                      value={deleteForm.password}
                      onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                      className="w-full px-4 py-3 pr-10 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Votre mot de passe actuel"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-200"
                    >
                      {showDeletePassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    Tapez "SUPPRIMER" pour confirmer
                  </label>
                  <input
                    type="text"
                    value={deleteForm.confirmation}
                    onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="SUPPRIMER"
                    required
                  />
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <ResponsiveReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={(token: string | null) => setDeleteCaptchaToken(token)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Suppression...' : 'Supprimer le compte'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

