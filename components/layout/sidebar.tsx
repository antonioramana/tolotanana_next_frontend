'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome, FiPlus, FiList, FiBarChart2, FiUser, FiSettings,
  FiUsers, FiFlag, FiDollarSign, FiTrendingUp, FiHeart, FiCreditCard, FiCheckCircle, FiMessageSquare, FiFileText
} from 'react-icons/fi';

interface SidebarProps {
  userRole: 'demandeur' | 'admin';
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  
  const demandeurMenuItems = [
    { icon: FiHome, label: 'Tableau de bord', href: '/dashboard' },
    { icon: FiPlus, label: 'Nouvelle campagne', href: '/dashboard/create-campaign' },
    { icon: FiList, label: 'Mes campagnes', href: '/dashboard/campaigns' },
    { icon: FiDollarSign, label: 'Retraits', href: '/dashboard/withdrawals' },
    { icon: FiUser, label: 'Profil', href: '/dashboard/profile' },
    { icon: FiSettings, label: 'Paramètres', href: '/dashboard/settings' },
  ];

  const adminMenuItems = [
    { icon: FiHome, label: 'Vue d\'ensemble', href: '/admin' },
    { icon: FiFlag, label: 'Campagnes', href: '/admin/campaigns' },
    { icon: FiHeart, label: 'Dons', href: '/admin/donations' },
    { icon: FiUsers, label: 'Utilisateurs', href: '/admin/users' },
    { icon: FiCreditCard, label: 'Transactions', href: '/admin/transactions' },
    { icon: FiTrendingUp, label: 'Retraits', href: '/admin/withdrawals' },
    { icon: FiCheckCircle, label: 'Vérification', href: '/admin/campaign-verification' },
    { icon: FiMessageSquare, label: 'Messages Contact', href: '/admin/contact' },
    { icon: FiSettings, label: 'Paramètres', href: '/admin/settings' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : demandeurMenuItems;

  return (
    <div className="bg-white shadow-xl border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 sm:p-8 overflow-y-auto">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            // Pour les liens Paramètres, activer si on est sur n'importe quelle sous-page de settings
            const isActive = (item.href === '/admin/settings' || item.href === '/dashboard/settings')
              ? pathname.startsWith(item.href)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-4 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-500' : ''}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
