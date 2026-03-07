'use client';

import Link from 'next/link';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg mx-auto">
        {/* 404 Number */}
        <div className="relative mb-6">
          <h1 className="text-[10rem] sm:text-[12rem] font-black text-orange-500/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-pulse">
              <FiSearch className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Page introuvable
        </h2>
        <p className="text-gray-500 mb-10 text-base sm:text-lg max-w-md mx-auto">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            <FiHome className="w-5 h-5" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/campaigns"
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <FiArrowLeft className="w-5 h-5" />
            Voir les campagnes
          </Link>
        </div>
      </div>
    </div>
  );
}
