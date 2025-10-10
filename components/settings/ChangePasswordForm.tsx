'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FiEye, FiEyeOff, FiLock, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { AuthApi } from '@/lib/api';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export default function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = 'Mot de passe actuel requis';
    }

    if (!form.newPassword.trim()) {
      newErrors.newPassword = 'Nouveau mot de passe requis';
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmation du mot de passe requise';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (form.currentPassword === form.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'actuel';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les états
    setErrors({});
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await AuthApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccess(true);
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été changé avec succès.',
      });

      // Réinitialiser le formulaire
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      
      // Gérer les différents types d'erreurs
      let errorMessage = 'Impossible de changer le mot de passe';
      
      if (error.message) {
        if (error.message.includes('Mot de passe actuel incorrect')) {
          setErrors({ currentPassword: 'Mot de passe actuel incorrect' });
          errorMessage = 'Le mot de passe actuel est incorrect';
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetForm = () => {
    setForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setSuccess(false);
  };

  // Réinitialiser le formulaire après 3 secondes en cas de succès
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        resetForm();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiLock className="w-5 h-5" />
          Changer le mot de passe
        </CardTitle>
        <CardDescription>
          Modifiez votre mot de passe pour sécuriser votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Message de succès */}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <FiCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Succès !</strong> Votre mot de passe a été modifié avec succès.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
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
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, newPassword: e.target.value }));
                  if (errors.newPassword || errors.general) {
                    setErrors(prev => ({ ...prev, newPassword: undefined, general: undefined }));
                  }
                }}
                className={errors.newPassword ? 'border-red-500' : ''}
                placeholder="Entrez votre nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                  if (errors.confirmPassword || errors.general) {
                    setErrors(prev => ({ ...prev, confirmPassword: undefined, general: undefined }));
                  }
                }}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                placeholder="Confirmez votre nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Alert>
            <FiLock className="h-4 w-4" />
            <AlertDescription>
              Votre mot de passe doit contenir au moins 6 caractères. 
              Assurez-vous de choisir un mot de passe sécurisé.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              type="submit" 
              disabled={isLoading || success} 
              className={`w-full transition-all duration-200 ${
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
                  <span>Modification en cours...</span>
                </div>
              ) : success ? (
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4" />
                  <span>Mot de passe modifié !</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiLock className="w-4 h-4" />
                  <span>Changer le mot de passe</span>
                </div>
              )}
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
