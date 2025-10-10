'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FiLock, FiCheck, FiX, FiLoader, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { AuthApi } from '@/lib/api';

interface ResetPasswordFormProps {
  email: string;
  onBack?: () => void;
}

export default function ResetPasswordForm({ email, onBack }: ResetPasswordFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    verificationCode?: string;
    general?: string;
  }>({});

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!form.verificationCode.trim()) {
      newErrors.verificationCode = 'Code de vérification requis';
    } else if (form.verificationCode.length !== 6) {
      newErrors.verificationCode = 'Le code doit contenir exactement 6 chiffres';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Nouveau mot de passe requis';
    } else if (!validatePassword(form.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmation du mot de passe requise';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setErrors({});
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.resetPassword({
        email,
        verificationCode: form.verificationCode,
        password: form.password,
      });
      
      setSuccess(true);
      toast({
        title: 'Mot de passe réinitialisé',
        description: 'Votre mot de passe a été réinitialisé avec succès.',
      });

      // Redirection vers la page de connexion après un délai
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);

    } catch (error: any) {
      console.error('Erreur réinitialisation mot de passe:', error);
      
      let errorMessage = 'Impossible de réinitialiser le mot de passe';
      
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
          errorMessage = 'Données invalides. Vérifiez vos informations.';
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

  const resetForm = () => {
    setForm({
      password: '',
      confirmPassword: '',
      verificationCode: '',
    });
    setErrors({});
    setSuccess(false);
  };

  if (success) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <FiCheck className="w-5 h-5" />
            Mot de passe réinitialisé
          </CardTitle>
          <CardDescription>
            Votre mot de passe a été mis à jour avec succès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-green-200 bg-green-50">
            <FiCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Succès !</strong> Votre mot de passe a été réinitialisé avec succès. 
              Vous allez être redirigé vers la page de connexion...
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="w-full"
            >
              <FiX className="w-4 h-4 mr-2" />
              Réinitialiser le formulaire
            </Button>
            
            <Button 
              type="button" 
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FiCheck className="w-4 h-4 mr-2" />
              Aller à la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiLock className="w-5 h-5" />
          Nouveau mot de passe
        </CardTitle>
        <CardDescription>
          {email ? `Entrez votre nouveau mot de passe pour ${email}` : 'Entrez votre nouveau mot de passe'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="verificationCode">Code de vérification</Label>
            <Input
              id="verificationCode"
              type="text"
              value={form.verificationCode}
              onChange={(e) => {
                setForm(prev => ({ ...prev, verificationCode: e.target.value }));
                if (errors.verificationCode || errors.general) {
                  setErrors(prev => ({ ...prev, verificationCode: undefined, general: undefined }));
                }
              }}
              className={errors.verificationCode ? 'border-red-500' : ''}
              placeholder="Entrez le code à 6 chiffres"
              maxLength={6}
              disabled={isLoading}
            />
            {errors.verificationCode && (
              <p className="text-sm text-red-600 mt-1">{errors.verificationCode}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, password: e.target.value }));
                  if (errors.password || errors.general) {
                    setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
                  }
                }}
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Entrez votre nouveau mot de passe"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <FiEyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <FiEye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                  if (errors.confirmPassword || errors.general) {
                    setErrors(prev => ({ ...prev, confirmPassword: undefined, general: undefined }));
                  }
                }}
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirmez votre nouveau mot de passe"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <FiEye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Alert>
            <FiLock className="h-4 w-4" />
            <AlertDescription>
              Votre mot de passe doit contenir au moins 8 caractères.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              type="submit" 
              disabled={isLoading || !form.verificationCode.trim() || !form.password.trim() || !form.confirmPassword.trim()}
              className={`w-full transition-all duration-200 ${
                isLoading 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Réinitialisation...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiLock className="w-4 h-4" />
                  <span>Réinitialiser le mot de passe</span>
                </div>
              )}
            </Button>
            
            {onBack && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onBack}
                className="w-full"
                disabled={isLoading}
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
