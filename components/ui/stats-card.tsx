import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
  description?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description 
}: StatsCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-2 ${changeColor[changeType]}`}>
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <div className="text-orange-600 text-xl">
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}