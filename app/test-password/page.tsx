'use client';

import ChangePasswordForm from '@/components/settings/ChangePasswordForm';

export default function TestPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Test du composant de changement de mot de passe</h1>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
