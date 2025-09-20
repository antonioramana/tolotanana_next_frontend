'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/favicon.ico" alt="TOLOTANANA" className="w-8 h-8 rounded" />
              <span className="text-xl font-bold">TOLOTANANA</span>
            </div>
            <p className="text-gray-400">
              La plateforme de collecte de fonds qui rassemble les Malagasy pour des causes qui comptent.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Campagnes</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/campaigns?category=Santé" className="hover:text-white">Santé</Link></li>
              <li><Link href="/campaigns?category=Éducation" className="hover:text-white">Éducation</Link></li>
              <li><Link href="/campaigns?category=Urgence" className="hover:text-white">Urgence</Link></li>
              <li><Link href="/campaigns?category=Communauté" className="hover:text-white">Communauté</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/how-it-works" className="hover:text-white">Comment ça marche</Link></li>
              <li><Link href="/fees" className="hover:text-white">Frais et tarifs</Link></li>
              <li><Link href="/safety" className="hover:text-white">Sécurité</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/terms" className="hover:text-white">Conditions d'utilisation</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Politique de confidentialité</Link></li>
              <li><Link href="/cookies" className="hover:text-white">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 TOLOTANANA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}


