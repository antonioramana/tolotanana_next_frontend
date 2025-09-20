import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppShell from '@/components/layout/app-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TOLOTANANA',
  description: 'Plateforme de collecte de fonds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: RootLayout est un composant serveur; Header a besoin du user côté client
  // On encapsule le contenu dans un wrapper client minimal si nécessaire ailleurs
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-gray-50 overflow-x-hidden`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
