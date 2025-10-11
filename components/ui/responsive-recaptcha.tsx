'use client';

import React, { useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ResponsiveReCAPTCHAProps {
  sitekey: string;
  onChange: (token: string | null) => void;
  className?: string;
}

export default function ResponsiveReCAPTCHA({ 
  sitekey, 
  onChange, 
  className = '' 
}: ResponsiveReCAPTCHAProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug: Vérifier si la sitekey est définie
  useEffect(() => {
    console.log('🔍 ResponsiveReCAPTCHA - Debug info:');
    console.log('📝 Sitekey prop:', sitekey);
    console.log('📝 Sitekey length:', sitekey?.length);
    console.log('📝 Sitekey defined:', !!sitekey);
    console.log('📝 Environment variable:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
  }, [sitekey]);

  useEffect(() => {
    const handleResize = () => {
      if (recaptchaRef.current && containerRef.current) {
        // Forcer le re-render du reCAPTCHA lors du redimensionnement
        const currentToken = recaptchaRef.current.getValue();
        if (currentToken) {
          recaptchaRef.current.reset();
          // Ne pas utiliser execute() car cela ne fonctionne qu'avec reCAPTCHA invisible
          // Le reCAPTCHA normal se re-render automatiquement
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Si la sitekey n'est pas définie, afficher un message d'erreur
  if (!sitekey) {
    return (
      <div className={`flex justify-center items-center w-full ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 font-medium mb-2">⚠️ reCAPTCHA non configuré</div>
          <div className="text-red-500 text-sm">
            La clé reCAPTCHA n'est pas définie. Vérifiez NEXT_PUBLIC_RECAPTCHA_SITE_KEY dans votre fichier .env.local
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex justify-center items-center w-full ${className}`}
      style={{
        minHeight: '78px', // Hauteur minimale du reCAPTCHA
        overflow: 'hidden'
      }}
    >
      <div className="w-full max-w-sm">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={sitekey}
          onChange={onChange}
          size="normal"
          theme="light"
          style={{
            width: '100%',
            height: 'auto'
          }}
        />
      </div>
    </div>
  );
}
