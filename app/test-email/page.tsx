'use client';

import ChangeEmailForm from '@/components/settings/ChangeEmailForm';

export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Test du composant de changement d'email</h1>
        <ChangeEmailForm currentEmail="test@example.com" />
      </div>
    </div>
  );
}
