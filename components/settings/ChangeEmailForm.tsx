'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FiMail, FiCheck, FiClock, FiX, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { AuthApi } from '@/lib/api';

interface ChangeEmailFormProps {
  currentEmail: string;
  onSuccess?: () => void;
}

export default function ChangeEmailForm({ currentEmail, onSuccess }: ChangeEmailFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    newEmail: '',
    currentPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    newEmail?: string;
    currentPassword?: string;
    verificationCode?: string;
    general?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!form.newEmail.trim()) {
      newErrors.newEmail = 'Nouvel email requis';
    } else if (!validateEmail(form.newEmail)) {
      newErrors.newEmail = 'Format d\'email invalide';
    } else if (form.newEmail === currentEmail) {
      newErrors.newEmail = 'Le nouvel email doit être différent de l\'actuel';
    }

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = 'Mot de passe actuel requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les états
    setErrors({});
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.changeEmailRequest({
        newEmail: form.newEmail,
        currentPassword: form.currentPassword,
      });

      setVerificationSent(true);
      toast({
        title: 'Code de vérification envoyé',
        description: `Un code de vérification a été envoyé à ${form.newEmail}`,
      });
    } catch (error: any) {
      console.error('Erreur envoi code vérification:', error);
      
      // Gérer les différents types d'erreurs
      let errorMessage = 'Impossible d\'envoyer le code de vérification';
      
      if (error.message) {
        if (error.message.includes('Mot de passe actuel incorrect')) {
          setErrors({ currentPassword: 'Mot de passe actuel incorrect' });
          errorMessage = 'Le mot de passe actuel est incorrect';
        } else if (error.message.includes('Cette adresse email est déjà utilisée')) {
          setErrors({ newEmail: 'Cette adresse email est déjà utilisée' });
          errorMessage = 'Cette adresse email est déjà utilisée par un autre compte';
        } else if (error.message.includes('Le nouvel email doit être différent')) {
          setErrors({ newEmail: 'Le nouvel email doit être différent de l\'actuel' });
          errorMessage = 'Le nouvel email doit être différent de l\'actuel';
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

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setErrors({});
    
    if (!verificationCode.trim()) {
      setErrors({ verificationCode: 'Code de vérification requis' });
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.changeEmailVerify({
        newEmail: form.newEmail,
        verificationCode: verificationCode,
      });

      setSuccess(true);
      toast({
        title: 'Email modifié',
        description: 'Votre adresse email a été changée avec succès.',
      });

      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        setForm({
          newEmail: '',
          currentPassword: '',
        });
        setVerificationCode('');
        setVerificationSent(false);
        setErrors({});
        setSuccess(false);
        onSuccess?.();
      }, 3000);

    } catch (error: any) {
      console.error('Erreur vérification email:', error);
      
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
      newEmail: '',
      currentPassword: '',
    });
    setVerificationCode('');
    setVerificationSent(false);
    setErrors({});
    setSuccess(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      await AuthApi.changeEmailResend({
        newEmail: form.newEmail,
      });

      toast({
        title: 'Code renvoyé',
        description: 'Un nouveau code de vérification a été envoyé',
      });
    } catch (error: any) {
      console.error('Erreur renvoi code:', error);
      
      let errorMessage = 'Impossible de renvoyer le code';
      
      if (error.message) {
        if (error.message.includes('Aucune demande de changement d\'email trouvée')) {
          errorMessage = 'Aucune demande de changement d\'email trouvée. Recommencez le processus.';
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiMail className="w-5 h-5" />
            Vérification de l'email
          </CardTitle>
          <CardDescription>
            Un code de vérification a été envoyé à {form.newEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Message de succès */}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <FiCheck className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Succès !</strong> Votre adresse email a été modifiée avec succès.
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

          <form onSubmit={handleVerifyEmail} className="space-y-4">
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

            <Alert>
              <FiClock className="h-4 w-4" />
              <AlertDescription>
                Le code de vérification est valide pendant 15 minutes. 
                Vérifiez votre boîte de réception et vos spams.
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
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Vérification...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4" />
                    <span>Email modifié !</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    <span>Vérifier et changer l'email</span>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiMail className="w-5 h-5" />
          Changer l'adresse email
        </CardTitle>
        <CardDescription>
          Modifiez votre adresse email. Un code de vérification sera envoyé à la nouvelle adresse.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="currentEmail">Email actuel</Label>
            <Input
              id="currentEmail"
              type="email"
              value={currentEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="newEmail">Nouvel email</Label>
            <Input
              id="newEmail"
              type="email"
              value={form.newEmail}
              onChange={(e) => {
                setForm(prev => ({ ...prev, newEmail: e.target.value }));
                if (errors.newEmail || errors.general) {
                  setErrors(prev => ({ ...prev, newEmail: undefined, general: undefined }));
                }
              }}
              className={errors.newEmail ? 'border-red-500' : ''}
              placeholder="Entrez votre nouvelle adresse email"
            />
            {errors.newEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.newEmail}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(e) => {
                setForm(prev => ({ ...prev, currentPassword: e.target.value }));
                if (errors.currentPassword || errors.general) {
                  setErrors(prev => ({ ...prev, currentPassword: undefined, general: undefined }));
                }
              }}
              className={errors.currentPassword ? 'border-red-500' : ''}
              placeholder="Entrez votre mot de passe actuel"
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <Alert>
            <FiCheck className="h-4 w-4" />
            <AlertDescription>
              Un code de vérification sera envoyé à votre nouvelle adresse email. 
              Vous devrez le saisir pour confirmer le changement.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiMail className="w-4 h-4" />
                  <span>Envoyer le code de vérification</span>
                </div>
              )}
            </Button>
            
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
