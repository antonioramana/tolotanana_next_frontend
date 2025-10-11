'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FiMail, FiCheck, FiX, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { AuthApi } from '@/lib/api';

interface ForgotPasswordFormProps {
  onBack?: () => void;
  onSuccess?: (email: string, code: string) => void;
}

export default function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setErrors({});
    setSuccess(false);
    
    // Validation
    if (!email.trim()) {
      setErrors({ email: 'Email requis' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Format d\'email invalide' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthApi.forgotPasswordRequest({ email });
      
      setSuccess(true);
      setVerificationCode(res.verificationCode || '');
      toast({
        title: 'Code envoyé',
        description: 'Un code de vérification a été envoyé à votre adresse email.',
      });
      
      if (onSuccess) {
        onSuccess(email, res.verificationCode || '');
      }
      
      // Passer automatiquement à l'étape suivante après 2 secondes
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(email, res.verificationCode || '');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Erreur demande réinitialisation:', error);
      
      let errorMessage = 'Impossible d\'envoyer le code de vérification';
      
      if (error.message) {
        if (error.message.includes('Utilisateur non trouvé')) {
          setErrors({ email: 'Aucun compte trouvé avec cet email' });
          errorMessage = 'Aucun compte trouvé avec cet email';
        } else if (error.message.includes('HTTP 400')) {
          errorMessage = 'Email invalide';
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
    setEmail('');
    setVerificationCode('');
    setErrors({});
    setSuccess(false);
  };

  if (success) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <FiCheck className="w-5 h-5" />
            Email envoyé
          </CardTitle>
          <CardDescription>
            Vérifiez votre boîte de réception
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-green-200 bg-green-50">
            <FiCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Code envoyé !</strong> Un code de vérification a été envoyé à <strong>{email}</strong>.
              Vérifiez votre boîte de réception et vos spams.
            </AlertDescription>
          </Alert>

          {verificationCode && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <FiCheck className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Code de vérification :</strong> <span className="font-mono text-lg font-bold">{verificationCode}</span>
                <br />
                <small className="text-blue-600">(Affiché uniquement en mode développement)</small>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              type="button" 
              onClick={() => onSuccess && onSuccess(email, verificationCode)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FiCheck className="w-4 h-4 mr-2" />
              Continuer vers la réinitialisation
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="w-full"
            >
              <FiX className="w-4 h-4 mr-2" />
              Réinitialiser le formulaire
            </Button>
            
            {onBack && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onBack}
                className="w-full"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiMail className="w-5 h-5" />
          Mot de passe oublié
        </CardTitle>
        <CardDescription>
          Entrez votre adresse email pour recevoir un code de vérification
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
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.general) {
                  setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
                }
              }}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="Entrez votre adresse email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <Alert>
            <FiMail className="h-4 w-4" />
            <AlertDescription>
              Nous vous enverrons un code de vérification à 6 chiffres pour réinitialiser votre mot de passe.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              type="submit" 
              disabled={isLoading || !email.trim()}
              className={`w-full transition-all duration-200 ${
                isLoading 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
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
            
            {onBack && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onBack}
                className="w-full"
                disabled={isLoading}
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
