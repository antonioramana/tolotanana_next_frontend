'use client';

import { useState, useEffect } from 'react';
import { getStoredToken } from '@/lib/auth-client';
import { API_BASE } from '@/lib/api';

interface SecureImageProps {
  src: string; // chemin relatif ex: /kyc-documents/kyc-xxx.jpg
  alt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Composant pour afficher des images protégées par JWT.
 * Charge l'image via fetch avec le Bearer token puis l'affiche en blob URL.
 */
export default function SecureImage({ src, alt, className = '', onClick }: SecureImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      try {
        const token = getStoredToken();
        const filename = src.split('/').pop();
        const res = await fetch(`${API_BASE}/admin/kyc/document/${filename}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to load image');

        const blob = await res.blob();
        if (!cancelled) {
          setBlobUrl(URL.createObjectURL(blob));
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };

    if (src) loadImage();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs ${className}`}>
        Image non disponible
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
}
