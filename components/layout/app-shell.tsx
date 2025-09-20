'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />
      {children}
      {!hideFooter && <Footer />}
    </div>
  );
}





