'use client';
import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit3, FiSave, FiX, FiUpload } from 'react-icons/fi';
import { UsersApi, UploadApi } from '@/lib/api';
import { getStoredUser, setStoredUser } from '@/lib/auth-client';
import { useToast } from '@/hooks/use-toast';
import UserAvatar from '@/components/ui/user-avatar';
import VerifiedBadge from '@/components/ui/verified-badge';

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await UsersApi.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        avatar: data.avatar || '',
      });
    } catch {
      toast({ title: 'Erreur', description: 'Erreur de chargement du profil', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await UploadApi.uploadFile(file);
      setFormData(prev => ({ ...prev, avatar: url }));
    } catch {
      toast({ title: 'Erreur', description: "Erreur lors du televersement de l'image", variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined,
      };
      const updatedProfile = await UsersApi.updateProfile(updateData);
      setProfile(updatedProfile);
      setEditing(false);
      const storedUser = getStoredUser() || {};
      setStoredUser({ ...storedUser, ...updatedProfile });
      toast({ title: 'Profil mis a jour avec succes' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message || 'Erreur lors de la mise a jour', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar || '',
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil administrateur</h1>
          <p className="text-gray-600">Informations de votre compte</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FiEdit3 className="w-4 h-4" />
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FiX className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                {editing ? (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-1 ring-gray-200">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <UserAvatar src={profile?.avatar} alt="Avatar" size="lg" className="w-24 h-24" />
                    {profile?.isVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5">
                        <VerifiedBadge size="md" />
                      </span>
                    )}
                  </div>
                )}
              </div>
              {editing && (
                <div className="mt-3">
                  <label className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <FiUpload className="w-4 h-4 mr-2" />
                    {uploading ? 'Televersement...' : 'Changer la photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Info fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Prenom</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900 font-medium">{profile?.firstName || '—'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nom</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900 font-medium">{profile?.lastName || '—'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <div className="text-gray-900 font-medium flex items-center">
                  <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                  {profile?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Telephone</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Numero de telephone"
                  />
                ) : (
                  <div className="text-gray-900 font-medium flex items-center">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                    {profile?.phone || '—'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Role</label>
                <div className="text-gray-900 font-medium">Administrateur</div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Membre depuis</label>
                <div className="text-gray-900 font-medium flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(profile?.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
