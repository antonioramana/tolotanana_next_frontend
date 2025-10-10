'use client';

import { useState } from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function TestForgotPasswordPage() {
  const [step, setStep] = useState<'forgot' | 'reset'>('forgot');
  const [email, setEmail] = useState('');

  const handleSuccess = (userEmail: string, code: string) => {
    setEmail(userEmail);
    setStep('reset');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Test - Mot de passe oublié
          </h1>
          
          {step === 'forgot' ? (
            <ForgotPasswordForm 
              onSuccess={handleSuccess}
              onBack={() => setStep('forgot')}
            />
          ) : (
            <ResetPasswordForm 
              email={email}
              onBack={() => setStep('forgot')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
