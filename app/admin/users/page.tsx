'use client';
import React, { useEffect, useState } from 'react';
import { UsersApi, AuthApi, UploadApi } from '@/lib/api';
import { FiUsers, FiUserPlus, FiEdit, FiTrash2, FiRefreshCw, FiSearch, FiFilter, FiLoader, FiImage } from 'react-icons/fi';
import { formatMoney } from '@/lib/utils';
import SimplePagination from '@/components/ui/simple-pagination';
import { useToast } from '@/hooks/use-toast';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';
import { getStoredToken } from '@/lib/auth-client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'demandeur' | 'donateur'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      const response = await UsersApi.getAll(`?${query}`);
      const usersData = Array.isArray(response?.data) ? response.data : [];
      
      setUsers(usersData);
      setTotalPages(response?.meta?.totalPages || 1);
    } catch (e) {
      setError('Erreur de chargement des utilisateurs');
      console.error('Users load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const demandeurUsers = users.filter(u => u.role === 'demandeur').length;
  const donateurUsers = users.filter(u => u.role === 'donateur').length;
  const verifiedUsers = users.filter(u => u.isVerified).length;

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedData: any, captchaToken: string, adminPassword?: string) => {
    try {
      // Récupérer le token d'authentification
      const token = getStoredToken() || '';

      // Utiliser la nouvelle API avec protection reCAPTCHA
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: editingUser.id,
          userData: updatedData,
          token: captchaToken,
          adminPassword: adminPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification de l\'utilisateur');
      }

      toast({
        title: 'Succès',
        description: 'Utilisateur modifié avec succès',
      });

      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la modification de l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await UsersApi.delete(userId);
        loadUsers();
      } catch (e) {
        console.error('Delete user error:', e);
      }
    }
  };

  const handleBulkAction = async (action: 'delete' | 'verify') => {
    if (selectedUsers.length === 0) return;
    
    if (action === 'delete' && window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
      try {
        await Promise.all(selectedUsers.map(id => UsersApi.delete(id)));
        setSelectedUsers([]);
        loadUsers();
      } catch (e) {
        console.error('Bulk delete error:', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadUsers}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FiRefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
            <p className="text-gray-200 mt-2">Administration de tous les utilisateurs de la plateforme</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <FiUserPlus className="w-4 h-4" />
              Ajouter un utilisateur
            </button>
            <button
              onClick={loadUsers}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FiRefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-white">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiUserPlus className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Administrateurs</p>
                <p className="text-2xl font-bold text-white">{adminUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Demandeurs</p>
                <p className="text-2xl font-bold text-white">{demandeurUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-200">Donateurs</p>
                <p className="text-2xl font-bold text-white">{donateurUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-800 text-white border-gray-600 bg-gray-800 text-white border-gray-600"
              >
                <option value="all" style={{backgroundColor: '#1f2937', color: 'white'}}>Tous les rôles</option>
                <option value="admin" style={{backgroundColor: '#1f2937', color: 'white'}}>Administrateurs</option>
                <option value="demandeur" style={{backgroundColor: '#1f2937', color: 'white'}}>Demandeurs</option>
                <option value="donateur" style={{backgroundColor: '#1f2937', color: 'white'}}>Donateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-800">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-1 bg-gray-9000 text-white text-sm rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Campagnes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                          alt=""
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-300">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'demandeur'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' :
                         user.role === 'demandeur' ? 'Demandeur' : 'Donateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isVerified 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Vérifié' : 'Non vérifié'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user._count?.campaigns || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user._count?.donations || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-white">Aucun utilisateur</h3>
              <p className="mt-1 text-sm text-gray-300">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Aucun utilisateur ne correspond aux critères de recherche.'
                  : 'Aucun utilisateur trouvé.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-300">
              Page {currentPage} sur {totalPages}
            </div>
            <SimplePagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
            onSave={handleUpdateUser}
          />
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onSave={async (data, captchaToken, avatarFile) => {
              try {
                let avatarUrl: string | undefined;
                if (avatarFile) {
                  avatarUrl = await UploadApi.uploadFile(avatarFile);
                }
                const payload = {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  email: data.email,
                  password: data.password,
                  phone: data.phone || undefined,
                  role: data.role,
                  token: captchaToken,
                  avatar: avatarUrl,
                };
                await AuthApi.register(payload as any);
                toast({ title: 'Utilisateur créé', description: 'Le compte a été ajouté avec succès.' });
                setShowAddModal(false);
                await loadUsers();
              } catch (err: any) {
                toast({
                  title: 'Erreur',
                  description: err?.message || 'Impossible de créer l’utilisateur',
                  variant: 'destructive',
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSave }: { user: any; onClose: () => void; onSave: (data: any, captchaToken: string, adminPassword?: string) => void }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'donateur',
    isVerified: user.isVerified || false,
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Détecter si le rôle a changé
  const roleChanged = formData.role !== user.role;
  
  // Afficher le champ mot de passe si le rôle change
  useEffect(() => {
    setShowPasswordField(roleChanged);
    if (!roleChanged) {
      setAdminPassword('');
    }
  }, [roleChanged]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      alert('Veuillez vérifier le reCAPTCHA avant de continuer.');
      return;
    }

    // Vérifier le mot de passe si le rôle change
    if (roleChanged && !adminPassword.trim()) {
      alert('Veuillez saisir votre mot de passe pour modifier le rôle.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Envoyer le mot de passe admin seulement si le rôle change
      await onSave(formData, captchaToken, roleChanged ? adminPassword : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-white mb-4">Modifier l'utilisateur</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Prénom</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Nom</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Téléphone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="donateur" style={{backgroundColor: '#1f2937', color: 'white'}}>Donateur</option>
              <option value="demandeur" style={{backgroundColor: '#1f2937', color: 'white'}}>Demandeur</option>
              <option value="admin" style={{backgroundColor: '#1f2937', color: 'white'}}>Administrateur</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVerified"
              checked={formData.isVerified}
              onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="isVerified" className="ml-2 block text-sm text-white">
              Compte vérifié
            </label>
          </div>

          {/* Champ mot de passe admin - affiché seulement si le rôle change */}
          {showPasswordField && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-yellow-600 text-xs">⚠️</span>
                </div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Modification de rôle détectée
                </h4>
              </div>
              <p className="text-xs text-yellow-700 mb-3">
                Pour des raisons de sécurité, veuillez confirmer votre mot de passe administrateur.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mot de passe administrateur
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="w-full border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required={roleChanged}
                />
              </div>
            </div>
          )}

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ResponsiveReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token: string | null) => setCaptchaToken(token)}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!captchaToken || isSubmitting}
              className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <span>Sauvegarder</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add User Modal Component
function AddUserModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any, captchaToken: string, avatarFile?: File) => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'donateur' as 'donateur' | 'demandeur' | 'admin',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      alert('Veuillez vérifier le reCAPTCHA avant de continuer.');
      return;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert('Merci de remplir les champs obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(formData, captchaToken, avatarFile);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
        >
          ×
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ajouter un utilisateur</h3>
        <p className="text-sm text-gray-600 mb-4">Créer un compte avec rôle, téléphone et avatar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: 0321234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="donateur">Donateur</option>
                <option value="demandeur">Demandeur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (optionnel)</label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 text-sm text-gray-600">
                <FiImage className="w-4 h-4" />
                <span>{avatarFile ? avatarFile.name : 'Choisir un fichier'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-center">
            <ResponsiveReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token: string | null) => setCaptchaToken(token)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}