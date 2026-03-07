'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MaintenancePage from '@/components/MaintenancePage';
import { MaintenanceApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth-client';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');
  const [maintenance, setMaintenance] = useState<{ isActive: boolean; message: string } | null>(null);

  useEffect(() => {
    MaintenanceApi.getStatus()
      .then(setMaintenance)
      .catch(() => {});
  }, []);

  // Show maintenance page for non-admin users when maintenance is active
  if (maintenance?.isActive) {
    const isAdminPath = pathname?.startsWith('/admin');
    const user = typeof window !== 'undefined' ? getStoredUser() : null;
    const isAdmin = user?.role === 'admin';

    if (!isAdmin && !isAdminPath) {
      return <MaintenancePage message={maintenance.message} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      {children}
      {!hideFooter && <Footer />}
    </div>
  );
}





