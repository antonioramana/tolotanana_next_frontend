'use client';
import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit3, FiSave, FiX, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { UsersApi, DonationsApi, CampaignsApi } from '@/lib/api';

export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: ''
  });
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalCampaigns: 0,
    totalAmountDonated: 0,
    totalAmountRaised: 0
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UsersApi.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        avatar: data.avatar || ''
      });
    } catch (e) {
      setError('Erreur de chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load user's donations
      const donationsData = await UsersApi.getMyDonations('?page=1&limit=1000');
      const donations = Array.isArray(donationsData?.data) ? donationsData.data : (Array.isArray(donationsData) ? donationsData : []);
      
      // Load user's campaigns
      const campaignsData = await CampaignsApi.myCampaigns('?page=1&limit=1000');
      const campaigns = Array.isArray(campaignsData?.data) ? campaignsData.data : (Array.isArray(campaignsData) ? campaignsData : []);

      const totalDonations = donations.length;
      const totalCampaigns = campaigns.length;
      const totalAmountDonated = donations.reduce((sum: number, donation: any) => sum + (parseFloat(donation.amount) || 0), 0);
      const totalAmountRaised = campaigns.reduce((sum: number, campaign: any) => sum + (parseFloat(campaign.currentAmount) || 0), 0);

      setStats({
        totalDonations,
        totalCampaigns,
        totalAmountDonated,
        totalAmountRaised
      });
    } catch (e) {
      console.error('Error loading stats:', e);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar || ''
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined
      };

      const updatedProfile = await UsersApi.updateProfile(updateData);
      setProfile(updatedProfile);
      setEditing(false);
      
      // Update stored user data
      const storedUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const updatedUser = { ...storedUser, ...updatedProfile };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(num || 0);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadProfile}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
    </div>
  );
}

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FiEdit3 className="w-4 h-4 mr-2" />
            Modifier
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Votre prénom"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.firstName || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.lastName || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                    {profile?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+33 1 23 45 67 89"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                      {profile?.phone || '—'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <p className="text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile?.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile?.role === 'admin' ? 'Administrateur' : 'Demandeur'}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <p className="text-gray-900 flex items-center">
                    {profile?.isVerified ? (
                      <>
                        <FiCheck className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-green-600">Vérifié</span>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="text-yellow-600">En attente de vérification</span>
                      </>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membre depuis
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(profile?.createdAt)}
                  </p>
                </div>

                {editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.firstName || !formData.lastName}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mes dons</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mes campagnes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant donné</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalAmountDonated)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiUser className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant collecté</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalAmountRaised)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <FiAlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}