'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUpload, FiX, FiCalendar, FiDollarSign, FiFileText, FiImage } from 'react-icons/fi';
import { BankApi, UploadApi, CatalogApi } from '@/lib/api';
import ResponsiveReCAPTCHA from '@/components/ui/responsive-recaptcha';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    targetAmount: '',
    deadline: '',
    images: [] as string[],
    video: '',
    story: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [defaultBank, setDefaultBank] = useState<any | null>(null);

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Informations de base', icon: FiFileText },
    { id: 2, title: 'Médias et histoire', icon: FiImage },
    { id: 3, title: 'Informations bancaires', icon: FiDollarSign },
  ];

  useEffect(() => {
    // Load categories from API
    CatalogApi.categories().then((list) => {
      setCategories(Array.isArray(list) ? list : []);
      console.log('[CreateCampaign] Loaded categories:', list);
    }).catch((err) => {
      console.error('[CreateCampaign] Failed to load categories', err);
      setCategories([]);
    });
  }, []);

  useEffect(() => {
    if (currentStep === 3) {
      BankApi.list().then((list) => {
        const d = Array.isArray(list) ? list.find((b) => b.isDefault) || list[0] || null : null;
        setDefaultBank(d);
        console.log('[CreateCampaign] Default bank info:', d, 'All bank infos:', list);
      }).catch((err) => {
        console.error('[CreateCampaign] Failed to load bank infos', err);
        setDefaultBank(null);
      });
    }
  }, [currentStep]);

  const validateStep = (step: number) => {
    const newErrors: any = {};

    if (step === 1) {
      if (!formData.title) newErrors.title = 'Le titre est requis';
      if (!formData.description) newErrors.description = 'La description est requise';
      if (!formData.categoryId) newErrors.categoryId = 'La catégorie est requise';
      if (!formData.targetAmount) newErrors.targetAmount = 'Le montant cible est requis';
      if (!formData.deadline) newErrors.deadline = 'La date limite est requise';
    }

    if (step === 2) {
      if (formData.images.length === 0) newErrors.images = 'Au moins une image est requise';
      if (!formData.story) newErrors.story = "L'histoire détaillée est requise";
    }

    setErrors(newErrors);
    const ok = Object.keys(newErrors).length === 0;
    if (!ok) {
      console.warn('[CreateCampaign] Validation errors at step', step, newErrors);
    }
    return ok;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Show previews immediately
    const previews = files.slice(0, 5 - formData.images.length).map((file) => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...formData.images, ...previews].slice(0, 5) });
    
    // Upload files to backend
    const uploaded: string[] = [];
    for (const file of files.slice(0, 5 - formData.images.length)) {
      try {
        console.log('[CreateCampaign] Uploading file:', file.name);
        const url = await UploadApi.uploadFile(file);
        console.log('[CreateCampaign] Uploaded to:', url);
        uploaded.push(url);
      } catch (err) {
        console.error('[CreateCampaign] Upload failed for:', file.name, err);
      }
    }
    
    // Replace blob URLs with real uploaded URLs
    if (uploaded.length > 0) {
      setFormData((prev) => {
        const existingUrls = prev.images.filter((u) => !u.startsWith('blob:'));
        const newUrls = [...existingUrls, ...uploaded].slice(0, 5);
        console.log('[CreateCampaign] Final image URLs:', newUrls);
        return { ...prev, images: newUrls };
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    if (!defaultBank) {
      console.warn('[CreateCampaign] Submission blocked: no default bank info');
      alert('Veuillez définir une information bancaire par défaut dans Paramètres.');
      return;
    }

    // Check if all images are uploaded (no blob URLs)
    const blobImages = formData.images.filter((u) => u.startsWith('blob:'));
    if (blobImages.length > 0) {
      console.warn('[CreateCampaign] Submission blocked: still have blob URLs:', blobImages);
      alert('Veuillez attendre que toutes les images soient uploadées avant de soumettre.');
      return;
    }

    if (!captchaToken) {
      alert('Veuillez vérifier le reCAPTCHA avant de créer la campagne.');
      return;
    }

    setIsSubmitting(true);

    // Build payload for backend DTO
    const payload = {
      title: formData.title,
      description: `${formData.description}\n\n${formData.story}`.trim(),
      targetAmount: Number(formData.targetAmount),
      categoryId: formData.categoryId,
      images: formData.images, // All should be valid URLs now
      video: formData.video ? formData.video : undefined,
      deadline: new Date(formData.deadline).toISOString(),
    } as any;

    try {
      const token = (typeof window !== 'undefined' && localStorage.getItem('auth_user'))
        ? (JSON.parse(localStorage.getItem('auth_user') as string)?.token || '')
        : '';

      console.log('[CreateCampaign] Submitting payload:', payload);
      console.log('[CreateCampaign] Image URLs being sent:', payload.images);
      console.log('[CreateCampaign] Each image URL validation:');
      payload.images.forEach((url: string, index: number) => {
        console.log(`  [${index}] "${url}" - starts with http: ${url.startsWith('http:')}, starts with https: ${url.startsWith('https:')}`);
      });

      // Utiliser la nouvelle API avec protection reCAPTCHA
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...payload,
          token: captchaToken
        }),
      });

      const rawText = await res.text();
      let parsed: any = null;
      try { parsed = rawText ? JSON.parse(rawText) : null; } catch {}
      console.log('[CreateCampaign] Response status:', res.status, 'body:', parsed ?? rawText);

      if (!res.ok) {
        const message = parsed?.message || parsed?.error || rawText || 'Erreur inconnue';
        alert(`Échec de création de la campagne: ${Array.isArray(message) ? message.join(', ') : message}`);
        return;
      }

      alert('Campagne créée avec succès ! Elle sera examinée par notre équipe avant publication.');
      router.push('/dashboard/campaigns');
    } catch (e) {
      console.error('[CreateCampaign] Exception during submit:', e);
      alert("Échec de création de la campagne. Veuillez vérifier les champs et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer une nouvelle campagne</h1>
        <p className="text-gray-600">Partagez votre histoire et collectez des fonds pour votre cause</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {/* Desktop: Layout horizontal */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  Étape {step.id}
                </p>
                <p className={`text-xs ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Layout vertical */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  Étape {step.id}: {step.title}
                </p>
                {currentStep === step.id && (
                  <p className="text-xs text-gray-600 mt-1">Étape actuelle</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de base</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la campagne *</label>
              <input type="text" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.title ? 'border-red-300' : 'border-gray-300'}`} placeholder="Ex: Aide pour les frais médicaux de ma fille" />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description courte *</label>
              <textarea value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} rows={3} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'}`} placeholder="Résumé de votre campagne en quelques phrases..." />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select value={formData.categoryId} onChange={(e)=>setFormData({...formData, categoryId: e.target.value})} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.categoryId ? 'border-red-300' : 'border-gray-300'}`}>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant cible (Ar) *</label>
                <input type="number" value={formData.targetAmount} onChange={(e)=>setFormData({...formData, targetAmount: e.target.value})} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.targetAmount ? 'border-red-300' : 'border-gray-300'}`} placeholder="Ex: 5000000" />
                {errors.targetAmount && <p className="text-red-500 text-sm mt-1">{errors.targetAmount}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date limite *</label>
              <input type="date" value={formData.deadline} onChange={(e)=>setFormData({...formData, deadline: e.target.value})} min={new Date().toISOString().split('T')[0]} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.deadline ? 'border-red-300' : 'border-gray-300'}`} />
              {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Médias et histoire</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images de la campagne * (Max 5)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Cliquez pour télécharger des images</span>
                      <input id="images" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <p className="mt-1 text-sm text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                  </div>
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button onClick={()=>removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vidéo (optionnel)</label>
              <input type="url" value={formData.video} onChange={(e)=>setFormData({...formData, video: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Lien YouTube ou Vimeo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Histoire détaillée *</label>
              <textarea value={formData.story} onChange={(e)=>setFormData({...formData, story: e.target.value})} rows={8} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.story ? 'border-red-300' : 'border-gray-300'}`} placeholder="Racontez votre histoire en détail..." />
              {errors.story && <p className="text-red-500 text-sm mt-1">{errors.story}</p>}
              <p className="text-sm text-gray-500 mt-1">Une histoire authentique et détaillée augmente vos chances de succès</p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations bancaires</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">Ces informations sont utilisées pour recevoir les fonds. Elles proviennent de vos paramètres.</p>
            </div>

            {!defaultBank ? (
              <div className="p-4 border rounded-lg">
                <p className="text-gray-700">Aucune information par défaut trouvée.</p>
                <Link href="/dashboard/settings" className="text-orange-600 hover:text-orange-700 underline">Ajouter une information bancaire</Link>
              </div>
            ) : (
              <div className="p-4 border rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{defaultBank.accountName} • {defaultBank.accountNumber}</p>
                    <p className="text-sm text-gray-600 truncate">{defaultBank.type === 'mobile_money' ? defaultBank.provider : `Banque: ${defaultBank.provider}`}</p>
                  </div>
                  <Link href="/dashboard/settings" className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm whitespace-nowrap">Modifier</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* reCAPTCHA - affiché seulement à l'étape 3 */}
        {currentStep === 3 && (
          <div className="flex justify-center pt-6">
            <ResponsiveReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token: string | null) => setCaptchaToken(token)}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
          <button onClick={handlePrevious} disabled={currentStep === 1} className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
          {currentStep < 3 ? (
            <button onClick={handleNext} className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg">Suivant</button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting || !defaultBank} className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Création...' : 'Créer la campagne'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}