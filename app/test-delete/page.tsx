'use client';

import DeleteAccountForm from '@/components/settings/DeleteAccountForm';

export default function TestDeletePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Test du composant de suppression de compte</h1>
        <DeleteAccountForm currentEmail="test@example.com" />
      </div>
    </div>
  );
}

