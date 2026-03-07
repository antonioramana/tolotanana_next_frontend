'use client';

import { FiTool, FiClock } from 'react-icons/fi';

interface MaintenancePageProps {
  message: string;
}

export default function MaintenancePage({ message }: MaintenancePageProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        {/* Animated icon */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <FiTool className="w-16 h-16 text-white -rotate-12" />
            </div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-3xl rotate-12 border-4 border-orange-400/30 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          Maintenance en cours
        </h1>

        {/* Message */}
        <div className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-6 mb-8 shadow-sm">
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {message}
          </p>
        </div>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
          <FiClock className="w-4 h-4" />
          <span>Nous revenons bientot</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
        </div>

        {/* Tolotanana branding */}
        <p className="mt-10 text-sm text-gray-400 font-medium tracking-wide">
          TOLOTANANA
        </p>
      </div>
    </div>
  );
}
