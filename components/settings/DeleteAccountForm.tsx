'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FiTrash2, FiAlertTriangle, FiMail, FiCheck, FiClock, FiX, FiLoader } from 'react-icons/fi';
import { AuthApi } from '@/lib/api';

interface DeleteAccountFormProps {
  currentEmail: string;
  onSuccess?: () => void;
}

export default function DeleteAccountForm({ currentEmail, onSuccess }: DeleteAccountFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmation?: string;
    verificationCode?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (form.email !== currentEmail) {
      newErrors.email = 'L\'email doit correspondre à votre adresse actuelle';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Mot de passe requis';
    }

    if (!form.confirmation.trim()) {
      newErrors.confirmation = 'Confirmation requise';
    } else if (form.confirmation !== 'SUPPRIMER MON COMPTE') {
      newErrors.confirmation = 'Veuillez taper exactement "SUPPRIMER MON COMPTE"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Réinitialiser les états
    setErrors({});
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.deleteAccountRequest({
        email: form.email,
        password: form.password,
      });

      setVerificationSent(true);
      setIsModalOpen(false); // Fermer le modal en cas de succès
      toast({
        title: 'Code de vérification envoyé',
        description: `Un code de vérification a été envoyé à ${form.email}`,
      });
    } catch (error: any) {
      console.error('Erreur demande suppression compte:', error);
      
      // Fermer le modal en cas d'erreur
      setIsModalOpen(false);
      
      // Gérer les différents types d'erreurs
      let errorMessage = 'Impossible d\'envoyer le code de vérification';
      
      if (error.message) {
        if (error.message.includes('Mot de passe incorrect')) {
          setErrors({ password: 'Mot de passe incorrect' });
          errorMessage = 'Le mot de passe est incorrect';
        } else if (error.message.includes('Email incorrect')) {
          setErrors({ email: 'Email incorrect' });
          errorMessage = 'L\'email ne correspond pas à votre compte';
        } else if (error.message.includes('Utilisateur non trouvé')) {
          setErrors({ email: 'Utilisateur non trouvé' });
          errorMessage = 'Aucun compte trouvé avec cet email';
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = 'Données invalides. Vérifiez vos informations.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setErrors({});
    
    if (!verificationCode.trim()) {
      setErrors({ verificationCode: 'Code de vérification requis' });
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.deleteAccountVerify({
        email: form.email,
        verificationCode: verificationCode,
      });

      setSuccess(true);
      toast({
        title: 'Compte supprimé',
        description: 'Votre compte a été supprimé avec succès.',
      });

      // Déconnexion et redirection après un délai
      setTimeout(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/');
      }, 3000);

    } catch (error: any) {
      console.error('Erreur vérification suppression:', error);
      
      // Gérer les différents types d'erreurs
      let errorMessage = 'Code de vérification invalide';
      
      if (error.message) {
        if (error.message.includes('Code de vérification incorrect')) {
          setErrors({ verificationCode: 'Code de vérification incorrect' });
          errorMessage = 'Le code de vérification est incorrect';
        } else if (error.message.includes('Code de vérification expiré')) {
          setErrors({ verificationCode: 'Code de vérification expiré' });
          errorMessage = 'Le code de vérification a expiré. Demandez un nouveau code.';
        } else if (error.message.includes('Aucun code de vérification trouvé')) {
          setErrors({ verificationCode: 'Aucun code de vérification trouvé' });
          errorMessage = 'Aucun code de vérification trouvé. Demandez un nouveau code.';
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = 'Données invalides. Vérifiez le code.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      confirmation: '',
    });
    setVerificationCode('');
    setVerificationSent(false);
    setErrors({});
    setSuccess(false);
    setIsModalOpen(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      await AuthApi.deleteAccountResend({
        email: form.email,
      });

      toast({
        title: 'Code renvoyé',
        description: 'Un nouveau code de vérification a été envoyé',
      });
    } catch (error: any) {
      console.error('Erreur renvoi code suppression:', error);
      
      let errorMessage = 'Impossible de renvoyer le code';
      
      if (error.message) {
        if (error.message.includes('Aucune demande de suppression trouvée')) {
          errorMessage = 'Aucune demande de suppression trouvée. Recommencez le processus.';
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = 'Données invalides. Vérifiez l\'email.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
      
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <FiTrash2 className="w-5 h-5" />
            Vérification de suppression
          </CardTitle>
          <CardDescription>
            Un code de vérification a été envoyé à {form.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Message de succès */}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <FiCheck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Compte supprimé !</strong> Votre compte a été supprimé avec succès. Vous allez être redirigé...
              </AlertDescription>
            </Alert>
          )}

          {/* Message d'erreur général */}
          {errors.general && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <FiX className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Erreur :</strong> {errors.general}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyAndDelete} className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Code de vérification</Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  if (errors.verificationCode || errors.general) {
                    setErrors(prev => ({ ...prev, verificationCode: undefined, general: undefined }));
                  }
                }}
                className={errors.verificationCode ? 'border-red-500' : ''}
                placeholder="Entrez le code à 6 chiffres"
                maxLength={6}
              />
              {errors.verificationCode && (
                <p className="text-sm text-red-600 mt-1">{errors.verificationCode}</p>
              )}
            </div>

            <Alert className="border-red-200 bg-red-50">
              <FiAlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Attention :</strong> Cette action est irréversible. 
                Toutes vos données seront définitivement supprimées.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="submit" 
                disabled={isLoading || success} 
                className={`flex-1 transition-all duration-200 ${
                  success 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : isLoading 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Suppression...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4" />
                    <span>Compte supprimé !</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FiTrash2 className="w-4 h-4" />
                    <span>Confirmer la suppression</span>
                  </div>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResendCode}
                disabled={isLoading || success}
                className="transition-all duration-200"
              >
                {isLoading ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  'Renvoyer'
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setVerificationSent(false);
                  setVerificationCode('');
                }}
                className="w-full"
              >
                Annuler
              </Button>
              
              {(success || errors.general) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="w-full"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Réinitialiser le formulaire
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <FiTrash2 className="w-5 h-5" />
          Supprimer le compte
        </CardTitle>
        <CardDescription>
          Supprimez définitivement votre compte et toutes vos données.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="border-red-200 bg-red-50 mb-6">
          <FiAlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Attention :</strong> Cette action est irréversible. 
            Toutes vos données (campagnes, dons, informations personnelles) seront définitivement supprimées.
          </AlertDescription>
        </Alert>

        {/* Message d'erreur général */}
        {errors.general && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <FiX className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Erreur :</strong> {errors.general}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSendVerification} className="space-y-4">
          <div>
            <Label htmlFor="email">Email de confirmation</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm(prev => ({ ...prev, email: e.target.value }));
                if (errors.email || errors.general) {
                  setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
                }
              }}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="Entrez votre adresse email"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Mot de passe actuel</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm(prev => ({ ...prev, password: e.target.value }));
                if (errors.password || errors.general) {
                  setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
                }
              }}
              className={errors.password ? 'border-red-500' : ''}
              placeholder="Entrez votre mot de passe actuel"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmation">Confirmation</Label>
            <Input
              id="confirmation"
              type="text"
              value={form.confirmation}
              onChange={(e) => {
                setForm(prev => ({ ...prev, confirmation: e.target.value }));
                if (errors.confirmation || errors.general) {
                  setErrors(prev => ({ ...prev, confirmation: undefined, general: undefined }));
                }
              }}
              className={errors.confirmation ? 'border-red-500' : ''}
              placeholder="Tapez 'SUPPRIMER MON COMPTE'"
            />
            {errors.confirmation && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmation}</p>
            )}
          </div>

          <Alert>
            <FiMail className="h-4 w-4" />
            <AlertDescription>
              Un code de vérification sera envoyé à votre adresse email. 
              Vous devrez le saisir pour confirmer la suppression.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!form.email || !form.password || !form.confirmation}
                >
                  <div className="flex items-center gap-2">
                    <FiTrash2 className="w-4 h-4" />
                    <span>Demander la suppression du compte</span>
                  </div>
                </Button>
              </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <FiAlertTriangle className="w-5 h-5" />
                  Confirmation de suppression
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left">
                  <p className="mb-2">
                    Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est <strong>irréversible</strong>.
                  </p>
                  <p className="mb-2">Les données suivantes seront définitivement supprimées :</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Vos campagnes et toutes leurs données</li>
                    <li>Vos dons et historique</li>
                    <li>Vos informations personnelles</li>
                    <li>Vos paramètres et préférences</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSendVerification}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {errors.general && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="w-full"
            >
              <FiX className="w-4 h-4 mr-2" />
              Réinitialiser le formulaire
            </Button>
          )}
        </div>
        </form>
      </CardContent>
    </Card>
  );
}
