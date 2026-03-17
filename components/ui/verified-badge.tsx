import { FiCheck } from 'react-icons/fi';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  xs: { icon: 'w-3 h-3', badge: 'w-3.5 h-3.5', text: 'text-[10px]' },
  sm: { icon: 'w-3 h-3', badge: 'w-4 h-4', text: 'text-xs' },
  md: { icon: 'w-3.5 h-3.5', badge: 'w-5 h-5', text: 'text-sm' },
};

export default function VerifiedBadge({ size = 'sm', showLabel = false, className = '' }: VerifiedBadgeProps) {
  const config = sizeConfig[size];

  return (
    <span className={`inline-flex items-center ${className}`} title="Profil verifie">
      <span className={`${config.badge} bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0`}>
        <FiCheck className={`${config.icon} text-white`} strokeWidth={3} />
      </span>
      {showLabel && (
        <span className={`${config.text} text-blue-600 font-medium ml-1`}>Verifie</span>
      )}
    </span>
  );
}
