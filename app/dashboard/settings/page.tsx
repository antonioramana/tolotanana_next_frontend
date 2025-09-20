'use client';

import { useEffect, useState } from 'react';
import { BankApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function DashboardSettingsPage() {
  const { toast } = useToast();
  const [bankInfos, setBankInfos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: 'mobile_money',
    accountNumber: '',
    accountName: '',
    provider: 'Mvola',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ accountNumber?: string; accountName?: string; provider?: string }>({});

  async function load() {
    setLoading(true);
    try {
      const list = await BankApi.list();
      setBankInfos(Array.isArray(list) ? list : []);
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de charger vos informations bancaires', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function validate(): boolean {
    const nextErrors: typeof errors = {};

    if (!form.accountName.trim()) {
      nextErrors.accountName = 'Titulaire requis';
    }

    if (form.type === 'mobile_money') {
      // Valider préfixes selon provider
      const number = form.accountNumber.replace(/\s+/g, '');
      if (!/^\d{10}$/.test(number)) {
        nextErrors.accountNumber = 'Numéro mobile money (10 chiffres)';
      } else {
        const prefix = number.substring(0, 3);
        if (form.provider === 'Mvola' && !['034', '038'].includes(prefix)) {
          nextErrors.accountNumber = 'Mvola: commence par 034 ou 038';
        }
        if (form.provider === 'Orange Money' && !['032', '037'].includes(prefix)) {
          nextErrors.accountNumber = 'Orange Money: commence par 032 ou 037';
        }
        if (form.provider === 'Airtel Money' && prefix !== '033') {
          nextErrors.accountNumber = 'Airtel Money: commence par 033';
        }
      }
    } else {
      // Bank account: nombre libre mais au moins 10 chiffres
      const digits = form.accountNumber.replace(/\D+/g, '');
      if (digits.length < 10) {
        nextErrors.accountNumber = 'Numéro de compte bancaire invalide (≥ 10 chiffres)';
      }
      if (!form.provider.trim()) {
        nextErrors.provider = 'Nom de la banque requis';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await BankApi.create(form as any);
      toast({ title: 'Enregistré', description: 'Information bancaire ajoutée' });
      setForm({ type: 'mobile_money', accountNumber: '', accountName: '', provider: 'Mvola', isDefault: false });
      setErrors({});
      await load();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'information', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function onSetDefault(id: string) {
    try {
      await BankApi.setDefault(id);
      toast({ title: 'Défini par défaut' });
      await load();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de définir par défaut', variant: 'destructive' });
    }
  }

  async function onDelete(id: string) {
    try {
      await BankApi.remove(id);
      toast({ title: 'Supprimé' });
      await load();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Suppression impossible', variant: 'destructive' });
    }
  }

  const isMobile = form.type === 'mobile_money';
  const accountNumberPlaceholder = isMobile
    ? (form.provider === 'Mvola' ? 'Ex: 034xxxxxxx ou 038xxxxxxx'
      : form.provider === 'Orange Money' ? 'Ex: 032xxxxxxx ou 037xxxxxxx'
      : 'Ex: 033xxxxxxx')
    : 'Numéro de compte bancaire (≥ 10 chiffres)';

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <h1 className="text-3xl font-bold mb-4">Paramètres</h1>
      <h2 className="text-xl font-semibold mb-6">Informations bancaires</h2>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Ajouter une information</h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) => {
                  const type = e.target.value as 'mobile_money' | 'bank_account';
                  setForm({
                    ...form,
                    type,
                    provider: type === 'mobile_money' ? 'Mvola' : '',
                    accountNumber: '',
                  });
                  setErrors({});
                }}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_account">Compte bancaire</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro</label>
                <input
                  value={form.accountNumber}
                  onChange={(e)=>setForm({...form, accountNumber: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.accountNumber ? 'border-red-300' : ''}`}
                  placeholder={accountNumberPlaceholder}
                />
                {errors.accountNumber && <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titulaire</label>
                <input
                  value={form.accountName}
                  onChange={(e)=>setForm({...form, accountName: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.accountName ? 'border-red-300' : ''}`}
                  placeholder="Nom complet"
                />
                {errors.accountName && <p className="text-sm text-red-600 mt-1">{errors.accountName}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fournisseur / Banque</label>
              {isMobile ? (
                <select
                  value={form.provider}
                  onChange={(e)=>setForm({...form, provider: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg"
                >
                  <option value="Mvola">Mvola</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                </select>
              ) : (
                <input
                  value={form.provider}
                  onChange={(e)=>setForm({...form, provider: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${errors.provider ? 'border-red-300' : ''}`}
                  placeholder="Nom de la banque (ex: BNI, BOA, ... )"
                />
              )}
              {errors.provider && <p className="text-sm text-red-600 mt-1">{errors.provider}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isDefault} onChange={(e)=>setForm({...form, isDefault: e.target.checked})} />
              <span>Définir par défaut</span>
            </div>
            <button disabled={saving} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Vos comptes</h3>
          {loading ? (
            <div className="text-gray-600">Chargement...</div>
          ) : bankInfos.length === 0 ? (
            <div className="text-gray-600">Aucune information enregistrée.</div>
          ) : (
            <div className="space-y-3">
              {bankInfos.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{b.accountName} • {b.accountNumber}</p>
                    <p className="text-sm text-gray-600 truncate">{b.type === 'mobile_money' ? b.provider : `Banque: ${b.provider}`}</p>
                    {b.isDefault && <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Par défaut</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!b.isDefault && (
                      <button onClick={()=>onSetDefault(b.id)} className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200">Définir par défaut</button>
                    )}
                    <button onClick={()=>onDelete(b.id)} className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


