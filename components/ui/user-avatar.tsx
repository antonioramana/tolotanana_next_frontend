'use client';

import { useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  xs: { container: 'w-5 h-5', icon: 'w-3 h-3' },
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-12 h-12', icon: 'w-6 h-6' },
};

export default function UserAvatar({ src, alt = '', size = 'md', className = '' }: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const config = sizeConfig[size];

  if (!src || hasError) {
    return (
      <div className={`${config.container} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ${className}`}>
        <FiUser className={`${config.icon} text-gray-500`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${config.container} rounded-full object-cover flex-shrink-0 ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
