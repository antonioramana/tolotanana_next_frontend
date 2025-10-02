'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CatalogApi, CampaignsApi, UploadApi } from '@/lib/api';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiHeart } from 'react-icons/fi';

export default function EditCampaignClient() {
  const params = useParams();
  const router = useRouter();
  const campaignId = useMemo(() => (params?.id as string) || '', [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    targetAmount: '',
    deadline: '',
    images: [] as string[],
    video: '',
  });

  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);
    Promise.all([
      CatalogApi.campaignById(campaignId),
      CatalogApi.categories(),
    ])
      .then(([data, cats]) => {
        setCategories(cats);
        setForm({
          title: data.title || '',
          description: data.description || '',
          categoryId: data.categoryId || data.category?.id || '',
          targetAmount: String(data.targetAmount ?? ''),
          deadline: data.deadline ? new Date(data.deadline).toISOString().slice(0, 10) : '',
          images: Array.isArray(data.images) ? data.images : [],
          video: data.video || '',
        });
      })
      .catch((e) => {
        console.error('Failed to load campaign/categories', e);
        setError("Impossible de charger la campagne");
      })
      .finally(() => setLoading(false));
  }, [campaignId]);

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const uploaded: string[] = [];
    for (const file of files) {
      try {
        const url = await UploadApi.uploadFile(file);
        uploaded.push(url);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    if (uploaded.length > 0) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded].slice(0, 5) }));
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.categoryId || !form.targetAmount || !form.deadline) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const hasBlob = form.images.some((u) => u.startsWith('blob:'));
    if (hasBlob) {
      alert('Veuillez attendre que toutes les images soient uploadées');
      return;
    }

    const payload: any = {
      title: form.title,
      description: form.description,
      categoryId: form.categoryId,
      targetAmount: Number(form.targetAmount),
      deadline: new Date(form.deadline).toISOString(),
      images: form.images,
      video: form.video || undefined,
    };

    try {
      setSaving(true);
      const res = await CampaignsApi.update(campaignId, payload);
      console.log('[EditCampaign] Saved:', res);
      alert('Campagne mise à jour avec succès');
      router.push('/dashboard/campaigns');
    } catch (e: any) {
      console.error('[EditCampaign] Save failed:', e);
      let message = 'Échec de la mise à jour de la campagne';
      try {
        const parsed = JSON.parse(e.message);
        message = Array.isArray(parsed?.message) ? parsed.message.join(', ') : (parsed?.message || message);
      } catch {}
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-500 mt-2">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard/campaigns" className="text-orange-600 underline">Retour</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/campaigns" className="text-gray-600 hover:text-gray-900 flex items-center">
            <FiArrowLeft className="w-5 h-5 mr-1" /> Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la campagne</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg disabled:opacity-50"
        >
          <FiSave className="w-5 h-5 mr-2" />
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {/* Section Messages de remerciement */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiHeart className="w-5 h-5 text-pink-500" />
              Messages de remerciement
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Personnalisez les messages qui s'affichent après chaque don sur votre campagne
            </p>
          </div>
          <Link
            href={`/dashboard/campaigns/${campaignId}/thank-you-messages`}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FiHeart className="w-4 h-4" />
            Gérer les messages
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant cible (Ar) *</label>
            <input
              type="number"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date limite *</label>
          <input
            type="date"
            value={form.deadline}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images (max 5)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="images" className="cursor-pointer text-orange-600 hover:underline">Télécharger des images</label>
              <input id="images" type="file" accept="image/*" multiple className="hidden" onChange={handleUploadImages} />
            </div>
          </div>
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt={`image-${idx}`} className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vidéo (URL)</label>
          <input
            type="url"
            value={form.video}
            onChange={(e) => setForm({ ...form, video: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}


