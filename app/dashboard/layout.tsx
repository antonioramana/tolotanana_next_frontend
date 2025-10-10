'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import { FiMenu, FiX } from 'react-icons/fi';
import { getStoredUser, startSessionWatcher, stopSessionWatcher, isTokenExpired, clearStoredUser } from '@/lib/auth-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'admin') {
      router.replace('/admin');
      return;
    }
    if (isTokenExpired()) {
      clearStoredUser();
      router.replace('/login');
      return;
    }
    setCurrentUser(user);
    setIsCheckingAuth(false);

    startSessionWatcher(() => {
      router.replace('/login');
    }, 5000);

    return () => {
      stopSessionWatcher();
    };
  }, [router]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar desktop */}
        <div className="hidden lg:block lg:w-80 lg:fixed lg:h-full pt-16">
          <Sidebar userRole={currentUser?.role || 'demandeur'} />
        </div>

        {/* Off-canvas Sidebar mobile/tablette */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed top-16 left-0 bottom-0 w-80 z-50 bg-white shadow-xl lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold">Menu</span>
                <button
                  aria-label="Fermer le menu"
                  className="p-2 rounded hover:bg-gray-100"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FiX size={20} />
                </button>
              </div>
              <Sidebar userRole={currentUser?.role || 'demandeur'} />
            </div>
          </>
        )}

        {/* Contenu principal */}
        <div className="flex-1 w-full lg:ml-80 pt-24 p-4 sm:p-6 lg:p-8">
          {/* Bouton pour ouvrir la sidebar sur mobile */}
          <div className="lg:hidden mb-4">
            <button
              aria-label="Ouvrir le menu"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              <FiMenu />
              <span>Menu</span>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}