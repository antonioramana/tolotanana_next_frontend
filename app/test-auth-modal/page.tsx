'use client';

import { useState } from 'react';
import AuthModal from '@/components/layout/auth-modal';

export default function TestAuthModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">
          Test - Modal d'authentification
        </h1>
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Ouvrir le modal d'authentification
        </button>
        
        <AuthModal 
          open={isOpen} 
          onClose={() => setIsOpen(false)}
          initialTab="login"
        />
      </div>
    </div>
  );
}
