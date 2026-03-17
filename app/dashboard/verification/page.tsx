'use client';

import { useState, useEffect, useRef } from 'react';
import { FiShield, FiUpload, FiCheck, FiX, FiClock, FiAlertCircle, FiUser, FiHome } from 'react-icons/fi';
import { KycApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getStoredUser } from '@/lib/auth-client';

export default function VerificationPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState<'personal' | 'organization'>('personal');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);

  // Preview URLs
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    if (user) {
      setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    }
    loadKycStatus();
  }, []);

  const loadKycStatus = async () => {
    try {
      const status = await KycApi.getStatus();
      setKycStatus(status);
    } catch {
      // Pas de KYC encore
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void,
    previewSetter: (s: string | null) => void,
  ) => {
    const file = e.target.files?.[0] || null;
    setter(file);
    if (file) {
      const url = URL.createObjectURL(file);
      previewSetter(url);
    } else {
      previewSetter(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentNumber.trim()) {
      toast({ title: 'Champ requis', description: `Veuillez saisir votre numéro de ${type === 'personal' ? 'CIN' : 'NIF/STAT'}`, variant: 'destructive' });
      return;
    }
    if (!fullName.trim()) {
      toast({ title: 'Champ requis', description: 'Veuillez saisir votre nom complet', variant: 'destructive' });
      return;
    }
    if (type === 'organization' && !organizationName.trim()) {
      toast({ title: 'Champ requis', description: 'Veuillez saisir le nom de votre organisation', variant: 'destructive' });
      return;
    }
    if (!documentFront) {
      toast({ title: 'Document requis', description: 'Veuillez uploader la photo du document (recto)', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('documentNumber', documentNumber);
      formData.append('fullName', fullName);
      if (organizationName) formData.append('organizationName', organizationName);
      formData.append('documentFront', documentFront);
      if (documentBack) formData.append('documentBack', documentBack);
      if (selfiePhoto) formData.append('selfiePhoto', selfiePhoto);

      await KycApi.submit(formData);
      toast({ title: 'Demande envoyée', description: 'Votre demande de vérification a été soumise avec succès.' });
      loadKycStatus();
    } catch (err: any) {
      let msg = 'Erreur lors de la soumission';
      try {
        const parsed = JSON.parse(err.message);
        msg = parsed.message || msg;
      } catch {}
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Afficher le statut si déjà soumis
  if (kycStatus?.hasKyc) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <FiShield className="w-7 h-7 text-orange-500" />
          Vérification du profil
        </h1>

        <div className={`rounded-xl border-2 p-8 text-center ${
          kycStatus.status === 'approved'
            ? 'border-green-300 bg-green-50'
            : kycStatus.status === 'rejected'
              ? 'border-red-300 bg-red-50'
              : 'border-yellow-300 bg-yellow-50'
        }`}>
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            kycStatus.status === 'approved'
              ? 'bg-green-100'
              : kycStatus.status === 'rejected'
                ? 'bg-red-100'
                : 'bg-yellow-100'
          }`}>
            {kycStatus.status === 'approved' && <FiCheck className="w-8 h-8 text-green-600" />}
            {kycStatus.status === 'rejected' && <FiX className="w-8 h-8 text-red-600" />}
            {kycStatus.status === 'pending' && <FiClock className="w-8 h-8 text-yellow-600" />}
          </div>

          <h2 className="text-xl font-bold mb-2">
            {kycStatus.status === 'approved' && 'Profil vérifié'}
            {kycStatus.status === 'rejected' && 'Vérification refusée'}
            {kycStatus.status === 'pending' && 'Vérification en attente'}
          </h2>

          <p className="text-gray-600 mb-4">
            {kycStatus.status === 'approved' && 'Votre profil a été vérifié avec succès. Vous bénéficiez du badge vérifié.'}
            {kycStatus.status === 'rejected' && `Votre demande a été refusée.`}
            {kycStatus.status === 'pending' && 'Votre demande est en cours de traitement par notre équipe. Vous serez notifié du résultat.'}
          </p>

          {kycStatus.status === 'rejected' && kycStatus.rejectionReason && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm font-semibold text-red-800 mb-1">Raison du rejet :</p>
              <p className="text-sm text-red-700">{kycStatus.rejectionReason}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>Type : {kycStatus.type === 'personal' ? 'Personnel (CIN)' : 'Organisation (NIF/STAT)'}</p>
            <p>Soumis le : {new Date(kycStatus.createdAt).toLocaleDateString('fr-FR')}</p>
            {kycStatus.reviewedAt && (
              <p>Traité le : {new Date(kycStatus.reviewedAt).toLocaleDateString('fr-FR')}</p>
            )}
          </div>

          {kycStatus.status === 'rejected' && (
            <button
              onClick={() => setKycStatus({ hasKyc: false })}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Soumettre une nouvelle demande
            </button>
          )}
        </div>
      </div>
    );
  }

  // Formulaire de soumission
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
        <FiShield className="w-7 h-7 text-orange-500" />
        Vérifier mon profil
      </h1>
      <p className="text-gray-600 mb-8">
        Vérifiez votre identité pour obtenir le badge vérifié et renforcer la confiance des donateurs.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Vos documents sont sécurisés</p>
            <p>Les documents soumis sont chiffrés et stockés de manière sécurisée. Seuls les administrateurs autorisés peuvent les consulter pour la vérification.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de vérification */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">Type de compte</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('personal')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                type === 'personal'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FiUser className={`w-6 h-6 mb-2 ${type === 'personal' ? 'text-orange-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-gray-900">Personnel</p>
              <p className="text-xs text-gray-500 mt-1">Carte d'Identité Nationale (CIN)</p>
            </button>
            <button
              type="button"
              onClick={() => setType('organization')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                type === 'organization'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FiHome className={`w-6 h-6 mb-2 ${type === 'organization' ? 'text-orange-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-gray-900">Organisation / ONG</p>
              <p className="text-xs text-gray-500 mt-1">NIF / STAT</p>
            </button>
          </div>
        </div>

        {/* Numéro de document */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {type === 'personal' ? 'Numéro CIN' : 'Numéro NIF/STAT'} *
          </label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-400"
            placeholder={type === 'personal' ? 'Ex: 101 123 456 789' : 'Ex: NIF-12345678'}
          />
        </div>

        {/* Nom complet */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Nom complet (tel qu'il apparaît sur le document) *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-400"
            placeholder="Nom et prénom"
          />
        </div>

        {/* Nom organisation */}
        {type === 'organization' && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Nom de l'organisation *
            </label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-400"
              placeholder="Ex: Association XYZ"
            />
          </div>
        )}

        {/* Upload documents */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-800">
            Documents à fournir
          </label>

          {/* Document Recto */}
          <div
            onClick={() => frontRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
          >
            <input
              ref={frontRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, setDocumentFront, setFrontPreview)}
            />
            {frontPreview ? (
              <div className="space-y-2">
                <img src={frontPreview} alt="Recto" className="mx-auto max-h-40 rounded-lg object-contain" />
                <p className="text-sm text-green-600 font-medium">Document recto uploadé</p>
              </div>
            ) : (
              <>
                <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {type === 'personal' ? 'Photo CIN (recto)' : 'Photo NIF/STAT'} *
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG - Max 5 Mo</p>
              </>
            )}
          </div>

          {/* Document Verso */}
          <div
            onClick={() => backRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
          >
            <input
              ref={backRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, setDocumentBack, setBackPreview)}
            />
            {backPreview ? (
              <div className="space-y-2">
                <img src={backPreview} alt="Verso" className="mx-auto max-h-40 rounded-lg object-contain" />
                <p className="text-sm text-green-600 font-medium">Document verso uploadé</p>
              </div>
            ) : (
              <>
                <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {type === 'personal' ? 'Photo CIN (verso)' : 'Document complémentaire'} (optionnel)
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG - Max 5 Mo</p>
              </>
            )}
          </div>

          {/* Selfie */}
          <div
            onClick={() => selfieRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
          >
            <input
              ref={selfieRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, setSelfiePhoto, setSelfiePreview)}
            />
            {selfiePreview ? (
              <div className="space-y-2">
                <img src={selfiePreview} alt="Selfie" className="mx-auto max-h-40 rounded-lg object-contain" />
                <p className="text-sm text-green-600 font-medium">Selfie uploadé</p>
              </div>
            ) : (
              <>
                <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Selfie avec le document (optionnel)</p>
                <p className="text-xs text-gray-500 mt-1">Photo de vous tenant votre document</p>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Envoi en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FiShield className="w-5 h-5" />
              Soumettre la demande de vérification
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
