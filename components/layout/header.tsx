'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiHeart } from 'react-icons/fi';
import { clearStoredUser, getStoredUser } from '@/lib/auth-client';
import AuthModal from '@/components/layout/auth-modal';
import NotificationBell from '@/components/notifications/NotificationBell';

type AuthTab = 'login' | 'register';

export default function Header({ user: userProp }: { user?: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(userProp);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<AuthTab>('login');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!userProp) {
      setUser(getStoredUser());
    } else {
      setUser(userProp);
    }
  }, [userProp]);

  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  useEffect(() => {
    const auth = searchParams?.get('auth');
    if (auth === 'login' || auth === 'register') {
      setAuthInitialTab(auth);
      setAuthModalOpen(true);
      // Nettoyer l'URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        router.replace(url.pathname + (url.search || ''));
      }
    }
  }, [searchParams, router]);

  const handleLogout = () => {
    console.log('Déconnexion utilisateur');
    clearStoredUser();
    // Vider les champs d'authentification dans localStorage
    localStorage.removeItem('auth_form_data');
    router.push('/login');
    setUser(null);
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : '/dashboard';
  };

  return (
    <header className="bg-white shadow-lg border-b-2 border-orange-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/favicon.ico" alt="TOLOTANANA" className="w-8 h-8 rounded" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              TOLOTANANA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Accueil
            </Link>
            <Link href="/campaigns" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Campagnes
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Contact
            </Link>
            {user && (
              <Link href="/dashboard/favorites" className="inline-flex items-center text-gray-700 hover:text-orange-600 font-medium transition-colors">
                <FiHeart className="w-4 h-4 mr-1" /> Favoris
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationBell />
                
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                  >
                  <img 
                    src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                    alt="Profile"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium">{user.firstName}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href={getDashboardUrl()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiUser className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiSettings className="w-4 h-4 mr-3" />
                        Profil admin
                      </Link>
                    )}
                    <Link
                      href={`${getDashboardUrl()}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiSettings className="w-4 h-4 mr-3" />
                      Profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Déconnexion
                    </button>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => { setAuthInitialTab('login'); setAuthModalOpen(true); }}
                  className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
                >
                  Connexion
                </button>
                <button
                  onClick={() => { setAuthInitialTab('register'); setAuthModalOpen(true); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-600"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
              >
                Accueil
              </Link>
              <Link
                href="/campaigns"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
              >
                Campagnes
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
              >
                Contact
              </Link>
              {user && (
                <Link
                  href="/dashboard/favorites"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                >
                  Favoris
                </Link>
              )}
              
              {user ? (
                <>
                  <Link
                    href={getDashboardUrl()}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setAuthInitialTab('login'); setAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => { setAuthInitialTab('register'); setAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-base font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authInitialTab} />
    </header>
  );
}