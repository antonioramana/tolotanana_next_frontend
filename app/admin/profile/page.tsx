'use client';
import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { UsersApi } from '@/lib/api';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await UsersApi.getProfile();
        setProfile(data);
      } catch (e) {
        setError('Erreur de chargement du profil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil administrateur</h1>
        <p className="text-gray-600">Informations de votre compte</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div>
                <div className="text-sm text-gray-500">Prénom</div>
                <div className="text-gray-900 font-medium">{profile?.firstName || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Nom</div>
                <div className="text-gray-900 font-medium">{profile?.lastName || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900 font-medium flex items-center"><FiMail className="w-4 h-4 mr-2 text-gray-400" />{profile?.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Téléphone</div>
                <div className="text-gray-900 font-medium flex items-center"><FiPhone className="w-4 h-4 mr-2 text-gray-400" />{profile?.phone || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rôle</div>
                <div className="text-gray-900 font-medium">Administrateur</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Membre depuis</div>
                <div className="text-gray-900 font-medium flex items-center"><FiCalendar className="w-4 h-4 mr-2 text-gray-400" />{new Date(profile?.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


