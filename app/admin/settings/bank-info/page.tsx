'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiEdit, FiTrash2, FiPlus, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { BankApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

interface BankInfo {
  id: string;
  type: 'mobile_money' | 'bank_account';
  accountNumber: string;
  accountName: string;
  provider: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBankInfoPage() {
  const { toast } = useToast();
  const [bankInfos, setBankInfos] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'mobile_money' as 'mobile_money' | 'bank_account',
    accountNumber: '',
    accountName: '',
    provider: 'Mvola',
    isDefault: false,
  });

  const loadBankInfo = async () => {
    try {
      setLoading(true);
      const response = await BankApi.list();
      setBankInfos(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement des informations bancaires',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!captchaToken) {
      toast({
        title: 'Vérification requise',
        description: 'Veuillez vérifier le reCAPTCHA avant de sauvegarder.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Récupérer le token d'authentification
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      if (!token) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour effectuer cette action',
          variant: 'destructive',
        });
        return;
      }

      // Utiliser la nouvelle API avec protection reCAPTCHA
      const response = await fetch('/api/admin/bank-info/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          token: captchaToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      toast({
        title: 'Succès',
        description: 'Information bancaire ajoutée avec succès',
      });
      
      setFormData({
        type: 'mobile_money',
        accountNumber: '',
        accountName: '',
        provider: 'Mvola',
        isDefault: false,
      });
      setIsEditing(false);
      await loadBankInfo();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la sauvegarde des informations bancaires',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette information bancaire ?')) {
      return;
    }

    try {
      setSaving(true);
      await BankApi.remove(id);
      toast({
        title: 'Succès',
        description: 'Information bancaire supprimée avec succès',
      });
      await loadBankInfo();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression de l\'information bancaire',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setSaving(true);
      await BankApi.setDefault(id);
      toast({
        title: 'Succès',
        description: 'Information bancaire définie par défaut',
      });
      await loadBankInfo();
    } catch (error: any) {
      console.error('Erreur lors de la définition par défaut:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la définition par défaut',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadBankInfo();
  }, []);

  const isMobile = formData.type === 'mobile_money';
  const accountNumberPlaceholder = isMobile
    ? (formData.provider === 'Mvola' ? 'Ex: 034xxxxxxx ou 038xxxxxxx'
      : formData.provider === 'Orange Money' ? 'Ex: 032xxxxxxx ou 037xxxxxxx'
      : 'Ex: 033xxxxxxx')
    : 'Numéro de compte bancaire (≥ 10 chiffres)';

  function validate(): boolean {
    if (!formData.accountName.trim()) {
      toast({ title: 'Erreur', description: 'Titulaire requis', variant: 'destructive' });
      return false;
    }

    if (formData.type === 'mobile_money') {
      const number = formData.accountNumber.replace(/\s+/g, '');
      if (!/^\d{10}$/.test(number)) {
        toast({ title: 'Erreur', description: 'Numéro mobile money (10 chiffres)', variant: 'destructive' });
        return false;
      } else {
        const prefix = number.substring(0, 3);
        if (formData.provider === 'Mvola' && !['034', '038'].includes(prefix)) {
          toast({ title: 'Erreur', description: 'Mvola: commence par 034 ou 038', variant: 'destructive' });
          return false;
        }
        if (formData.provider === 'Orange Money' && !['032', '037'].includes(prefix)) {
          toast({ title: 'Erreur', description: 'Orange Money: commence par 032 ou 037', variant: 'destructive' });
          return false;
        }
        if (formData.provider === 'Airtel Money' && prefix !== '033') {
          toast({ title: 'Erreur', description: 'Airtel Money: commence par 033', variant: 'destructive' });
          return false;
        }
      }
    } else {
      const digits = formData.accountNumber.replace(/\D+/g, '');
      if (digits.length < 10) {
        toast({ title: 'Erreur', description: 'Numéro de compte bancaire invalide (≥ 10 chiffres)', variant: 'destructive' });
        return false;
      }
      if (!formData.provider.trim()) {
        toast({ title: 'Erreur', description: 'Nom de la banque requis', variant: 'destructive' });
        return false;
      }
    }
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await handleSave();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 sm:p-10">
      <h1 className="text-3xl font-bold mb-4">Paramètres Admin</h1>
      <h2 className="text-xl font-semibold mb-6">Informations bancaires (affichées lors des dons)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Ajouter une information</h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const type = e.target.value as 'mobile_money' | 'bank_account';
                  setFormData({
                    ...formData,
                    type,
                    provider: type === 'mobile_money' ? 'Mvola' : '',
                    accountNumber: '',
                  });
                }}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg"
              >
                <option value="mobile_money" style={{backgroundColor: '#1f2937', color: 'white'}}>Mobile Money</option>
                <option value="bank_account" style={{backgroundColor: '#1f2937', color: 'white'}}>Compte bancaire</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Numéro</label>
                <input
                  value={formData.accountNumber}
                  onChange={(e)=>setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg"
                  placeholder={accountNumberPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Titulaire</label>
                <input
                  value={formData.accountName}
                  onChange={(e)=>setFormData({...formData, accountName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg"
                  placeholder="Nom complet"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fournisseur / Banque</label>
              {isMobile ? (
                <select
                  value={formData.provider}
                  onChange={(e)=>setFormData({...formData, provider: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg"
                >
                  <option value="Mvola" style={{backgroundColor: '#1f2937', color: 'white'}}>Mvola</option>
                  <option value="Orange Money" style={{backgroundColor: '#1f2937', color: 'white'}}>Orange Money</option>
                  <option value="Airtel Money" style={{backgroundColor: '#1f2937', color: 'white'}}>Airtel Money</option>
                </select>
              ) : (
                <input
                  value={formData.provider}
                  onChange={(e)=>setFormData({...formData, provider: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 rounded-lg"
                  placeholder="Nom de la banque (ex: BNI, BOA, ... )"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isDefault} onChange={(e)=>setFormData({...formData, isDefault: e.target.checked})} />
              <span>Définir par défaut</span>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ResponsiveReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token: string | null) => setCaptchaToken(token)}
              />
            </div>

            <button disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Vos comptes</h3>
          {bankInfos.length === 0 ? (
            <div className="text-gray-200">Aucune information enregistrée.</div>
          ) : (
            <div className="space-y-3">
              {bankInfos.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{b.accountName} • {b.accountNumber}</p>
                    <p className="text-sm text-gray-200 truncate">{b.type === 'mobile_money' ? b.provider : `Banque: ${b.provider}`}</p>
                    {b.isDefault && <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Par défaut</span>}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {!b.isDefault && (
                      <button onClick={()=>handleSetDefault(b.id)} className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm">Définir par défaut</button>
                    )}
                    <button onClick={()=>handleDelete(b.id)} className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Comment ça fonctionne ?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ces informations bancaires seront affichées dans le formulaire de don</li>
          <li>• Les donateurs pourront voir où envoyer leurs virements</li>
          <li>• Seuls les administrateurs peuvent modifier ces informations</li>
          <li>• Vous pouvez définir un compte par défaut</li>
        </ul>
      </div>
    </div>
  );
}
