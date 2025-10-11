'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import { FiMenu, FiX } from 'react-icons/fi';
import { getStoredUser, startSessionWatcher, stopSessionWatcher, isTokenExpired, clearStoredUser } from '@/lib/auth-client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    console.log('Layout admin - Utilisateur récupéré:', user);
    
    if (!user) {
      console.log('Layout admin - Pas d\'utilisateur, redirection vers /admin-login');
      router.replace('/admin-login');
      return;
    }
    if (user.role !== 'admin') {
      console.log('Layout admin - Utilisateur non admin, redirection vers /dashboard');
      router.replace('/dashboard');
      return;
    }
    if (isTokenExpired()) {
      clearStoredUser();
      router.replace('/admin-login');
      return;
    }
    
    console.log('Layout admin - Utilisateur admin validé:', user);
    setCurrentUser(user);
    setIsCheckingAuth(false);

    startSessionWatcher(() => {
      router.replace('/admin-login');
    }, 5000);

    return () => {
      stopSessionWatcher();
    };
  }, [router]);

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="dark">
      <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Sidebar desktop - accolé à la navbar */}
        <div className="hidden lg:block lg:w-80 lg:fixed lg:h-screen lg:top-0 lg:left-0 lg:z-30">
          <Sidebar userRole={currentUser?.role || 'admin'} />
        </div>

        {/* Off-canvas Sidebar mobile/tablette - accolé à la navbar */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
              <div className="fixed top-0 left-0 bottom-0 w-80 z-50 bg-gray-800 shadow-xl lg:hidden overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <span className="font-semibold text-white">Menu</span>
                  <button
                    aria-label="Fermer le menu"
                    className="p-2 rounded hover:bg-gray-700 text-white"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <Sidebar userRole={currentUser?.role || 'admin'} />
              </div>
          </>
        )}

        {/* Contenu principal */}
          <div className="flex-1 w-full lg:ml-80 pt-16 p-4 sm:p-6 lg:p-8">
          {/* Bouton pour ouvrir la sidebar sur mobile */}
          <div className="lg:hidden mb-4">
            <button
              aria-label="Ouvrir le menu"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
            >
              <FiMenu />
              <span>Menu</span>
            </button>
          </div>
          {children}
        </div>
      </div>
      </div>
    </div>
  );
}